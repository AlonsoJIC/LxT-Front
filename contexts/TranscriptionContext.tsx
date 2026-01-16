"use client"

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { TranscriptionTask, getTranscriptionStatus } from '@/lib/apiService'
import { useToast } from '@/components/ui/use-toast'

interface TranscriptionContextType {
  activeTasks: Map<string, TranscriptionTask>
  addTask: (task: TranscriptionTask) => void
  removeTask: (taskId: string) => void
  hasActiveTasks: boolean
}

const TranscriptionContext = createContext<TranscriptionContextType | undefined>(undefined)

export function TranscriptionProvider({ children }: { children: React.ReactNode }) {
  const [activeTasks, setActiveTasks] = useState<Map<string, TranscriptionTask>>(new Map())
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Cargar tareas desde localStorage al iniciar y verificar su estado real
  useEffect(() => {
    const loadAndVerifyTasks = async () => {
      const savedTasks = localStorage.getItem('activeTasks')
      if (!savedTasks) return

      try {
        const tasksArray = JSON.parse(savedTasks) as TranscriptionTask[]
        
        // Verificar el estado real de cada tarea en el backend
        const verifiedTasks = new Map<string, TranscriptionTask>()
        
        for (const task of tasksArray) {
          try {
            // Consultar estado actual en el backend
            const currentStatus = await getTranscriptionStatus(task.task_id)
            verifiedTasks.set(task.task_id, currentStatus)
            
            // Si se completó mientras estábamos offline, notificar
            if (currentStatus.status === 'completada' && task.status !== 'completada') {
              toast({
                title: 'Transcripción completada',
                description: `${currentStatus.filename} terminó mientras estabas offline.`,
                variant: 'default'
              })
            }
          } catch (error: any) {
            // Si la tarea no existe en el backend (404), no la restaurar
            if (error.message === 'TASK_NOT_FOUND') {
              console.log(`Tarea ${task.task_id} ya no existe en el backend, eliminando...`)
            } else {
              // Si hay otro error (red, servidor caído), mantener la tarea con estado guardado
              console.warn(`No se pudo verificar tarea ${task.task_id}, manteniendo estado guardado`)
              verifiedTasks.set(task.task_id, task)
            }
          }
        }
        
        setActiveTasks(verifiedTasks)
      } catch (e) {
        console.error('Error al cargar y verificar tareas guardadas:', e)
      }
    }

    loadAndVerifyTasks()
  }, [])

  // Guardar tareas en localStorage cuando cambien
  useEffect(() => {
    if (activeTasks.size > 0) {
      const tasksArray = Array.from(activeTasks.values())
      localStorage.setItem('activeTasks', JSON.stringify(tasksArray))
    } else {
      localStorage.removeItem('activeTasks')
    }
  }, [activeTasks])

  // Polling global de tareas activas
  useEffect(() => {
    const pollTasks = async () => {
      setActiveTasks(currentTasks => {
        if (currentTasks.size === 0) return currentTasks

        currentTasks.forEach(async (task, taskId) => {
          // Solo hacer polling si la tarea no está completada o con error
          if (task.status === "completada" || task.status === "error") return

          try {
            const status = await getTranscriptionStatus(taskId)
            
            // Actualizar el estado de la tarea
            setActiveTasks(prev => {
              const newMap = new Map(prev)
              newMap.set(taskId, status)
              return newMap
            })
            
            // Si se completó, mostrar notificación
            if (status.status === "completada") {
              toast({ 
                title: "Transcripción completada", 
                description: `${status.filename} está lista.`, 
                variant: "default" 
              })
            }
          } catch (error: any) {
            console.error(`Error al consultar estado de tarea ${taskId}:`, error)
            
            // Si la tarea no existe (404), eliminarla del estado
            if (error.message === 'TASK_NOT_FOUND') {
              console.log(`Tarea ${taskId} no existe en el backend, eliminando...`)
              setActiveTasks(prev => {
                const newMap = new Map(prev)
                newMap.delete(taskId)
                return newMap
              })
            }
          }
        })
        
        return currentTasks
      })
    }

    // Limpiar intervalo anterior si existe
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    // Solo crear intervalo si hay tareas activas
    if (activeTasks.size > 0) {
      pollTasks() // Ejecutar inmediatamente
      pollingIntervalRef.current = setInterval(pollTasks, 10000) // Polling cada 10 segundos
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [activeTasks.size, toast])

  // Limpiar tareas completadas o con error después de un tiempo
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []
    
    activeTasks.forEach((task, taskId) => {
      if (task.status === "completada" || task.status === "error") {
        const delay = task.status === "completada" ? 10000 : 15000 // 10s para completadas, 15s para errores
        const timeout = setTimeout(() => {
          setActiveTasks(prev => {
            const newMap = new Map(prev)
            newMap.delete(taskId)
            return newMap
          })
        }, delay)
        timeouts.push(timeout)
      }
    })
    
    return () => timeouts.forEach(clearTimeout)
  }, [activeTasks])

  const addTask = useCallback((task: TranscriptionTask) => {
    setActiveTasks(prev => new Map(prev).set(task.task_id, task))
  }, [])

  const removeTask = useCallback((taskId: string) => {
    setActiveTasks(prev => {
      const newMap = new Map(prev)
      newMap.delete(taskId)
      return newMap
    })
  }, [])

  return (
    <TranscriptionContext.Provider 
      value={{ 
        activeTasks, 
        addTask, 
        removeTask,
        hasActiveTasks: activeTasks.size > 0 
      }}
    >
      {children}
    </TranscriptionContext.Provider>
  )
}

export function useTranscription() {
  const context = useContext(TranscriptionContext)
  if (context === undefined) {
    throw new Error('useTranscription debe usarse dentro de TranscriptionProvider')
  }
  return context
}
