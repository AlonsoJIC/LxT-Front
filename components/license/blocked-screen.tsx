// components/license/blocked-screen.tsx
"use client";

import { useState } from "react";
import { Lock, Copy, Check, Mail, RefreshCw, ShoppingBag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/animated-background";

interface BlockedScreenProps {
  message: string;
  state: "EXPIRED" | "BLOCKED" | "NO_LICENSE" | string;
  machineId: string;
  onRetry?: () => void;
}

export function BlockedScreen({ message, state, machineId, onRetry }: BlockedScreenProps) {
  const [copied, setCopied] = useState(false);
  
  const copyMachineId = async () => {
    try {
      await navigator.clipboard.writeText(machineId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };
  
  const getTitle = () => {
    switch (state) {
      case "EXPIRED":
        return "Tu membresía ha expirado";
      case "BLOCKED":
        return "Licencia inválida detectada";
      case "NO_LICENSE":
        return "No se detectó licencia";
      default:
        return "Acceso bloqueado";
    }
  };

  const getIcon = () => {
    switch (state) {
      case "EXPIRED":
        return (
          <div className="relative">
            <Clock className="w-24 h-24 text-orange-500 animate-pulse" />
            <div className="absolute inset-0 blur-xl bg-orange-500/30 animate-pulse" />
          </div>
        );
      case "BLOCKED":
        return <Lock className="w-20 h-20 text-red-500" />;
      case "NO_LICENSE":
        return (
          <div className="relative">
            <ShoppingBag className="w-24 h-24 text-blue-500 animate-pulse" />
            <div className="absolute inset-0 blur-xl bg-blue-500/30 animate-pulse" />
          </div>
        );
      default:
        return <Lock className="w-20 h-20 text-muted-foreground" />;
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4">
      {/* Animated background para NO_LICENSE y EXPIRED */}
      {(state === "NO_LICENSE" || state === "EXPIRED") && (
        <>
          <AnimatedBackground />
          <div className={`fixed inset-0 pointer-events-none z-0 ${
            state === "NO_LICENSE" 
              ? "bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5"
              : "bg-gradient-to-br from-orange-500/5 via-red-500/5 to-yellow-500/5"
          }`} />
        </>
      )}
      
      <div className={`max-w-2xl w-full space-y-8 ${(state === "NO_LICENSE" || state === "EXPIRED") ? "relative z-10" : ""}`}>
        {/* Icono y título */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            {getIcon()}
          </div>
          <h1 className="text-3xl font-bold">{getTitle()}</h1>
          <p className="text-lg text-muted-foreground">{message}</p>
        </div>
        
        {/* Instrucciones específicas según el estado */}
        {state === "EXPIRED" ? (
          <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-lg p-6 space-y-4 backdrop-blur-sm shadow-xl">
            <h3 className="text-xl font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Para renovar tu membresía:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Copia tu Machine ID (identificador único de este equipo)</li>
              <li>Contacta al proveedor de LxT</li>
              <li>Envía tu Machine ID para solicitar renovación</li>
              <li>Recibirás un nuevo archivo de licencia</li>
              <li>Coloca el archivo en la carpeta de la aplicación y reinicia</li>
            </ol>
            <div className="mt-4 p-4 bg-orange-500/10 rounded-md border border-orange-500/20">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                📧 Renovaciones: ventas@lxt.com
              </p>
            </div>
          </div>
        ) : state === "BLOCKED" ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-500">⚠️ Problema de seguridad detectado</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>La licencia no pudo ser validada por uno de estos motivos:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Error común por fallo no detectado</li>
                <li>Cambio de hardware de tu computadora</li>
                <li>Desincronización con sistema de hora local de tu computadora</li>
                <li>El archivo de licencia fue modificado o está corrupto</li>
                <li>La licencia no corresponde a este equipo</li>
                <li>La firma digital no es válida</li>
              </ul>
              <p className="mt-4 font-medium">Contacta inmediatamente al soporte técnico con tu Machine ID.</p>
            </div>
          </div>
        ) : state === "NO_LICENSE" ? (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-500">💡 Licencia requerida</h3>
            <div className="space-y-3 text-muted-foreground">
              <p>Esta aplicación requiere una licencia válida para funcionar.</p>
              <p className="font-medium">Para adquirir tu licencia:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Copia tu Machine ID (identificador único de este equipo)</li>
                <li>Contacta a nuestro equipo de ventas</li>
                <li>Proporciona tu Machine ID al momento de la compra</li>
                <li>Recibirás un archivo de licencia personalizado</li>
                <li>Coloca el archivo en la carpeta de la aplicación</li>
                <li>Presiona "Verificar licencia nuevamente"</li>
              </ol>
              <div className="mt-4 p-3 bg-blue-500/5 rounded-md">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">💼 Ventas: ventas@lxt.com</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">Acceso no autorizado</h3>
            <p className="text-muted-foreground">Contacta al proveedor para obtener una licencia válida.</p>
          </div>
        )}
        
        {/* Machine ID */}
        <div className={`space-y-3 ${
          state === "NO_LICENSE" 
            ? "backdrop-blur-sm bg-background/50 rounded-lg p-4 border border-blue-500/20" 
            : state === "EXPIRED"
            ? "backdrop-blur-sm bg-background/50 rounded-lg p-4 border border-orange-500/20"
            : ""
        }`}>
          <label className="text-sm font-medium">Tu Machine ID:</label>
          <div className="bg-muted rounded-lg p-4">
            <code className="text-sm break-all font-mono">{machineId}</code>
          </div>
          <Button
            onClick={copyMachineId}
            className={`w-full ${
              state === "NO_LICENSE" 
                ? "bg-blue-600 hover:bg-blue-700" 
                : state === "EXPIRED"
                ? "bg-orange-600 hover:bg-orange-700"
                : ""
            }`}
            variant={copied ? "outline" : "default"}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Machine ID
              </>
            )}
          </Button>
        </div>
        
        {/* Botón de verificar nuevamente */}
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className={`w-full ${
              state === "NO_LICENSE" 
                ? "border-blue-500/30 hover:bg-blue-500/10" 
                : state === "EXPIRED"
                ? "border-orange-500/30 hover:bg-orange-500/10"
                : ""
            }`}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Verificar licencia nuevamente
          </Button>
        )}
        
        {/* Contacto - diferente según el estado */}
        <div className="text-center text-sm flex items-center justify-center gap-2">
          <Mail className="w-4 h-4" />
          {state === "BLOCKED" ? (
            <span className="text-red-600 dark:text-red-500 font-medium">
              Soporte urgente: soporte@lxt.com
            </span>
          ) : state === "NO_LICENSE" ? (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Ventas: ventas@lxt.com | Soporte: soporte@lxt.com
            </span>
          ) : state === "EXPIRED" ? (
            <span className="text-orange-600 dark:text-orange-400 font-medium">
              Renovaciones: ventas@lxt.com | Soporte: soporte@lxt.com
            </span>
          ) : (
            <span className="text-muted-foreground">
              Contacto: soporte@lxt.com
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
