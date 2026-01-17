// components/license/license-wrapper.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { LoadingScreen } from "./loading-screen";
import { WelcomeScreen } from "./welcome-screen";
import { BlockedScreen } from "./blocked-screen";
import { ErrorScreen } from "./error-screen";
import { getLicenseStatus, getMachineId } from "@/lib/licenseService";
import { useLicenseMonitor } from "@/hooks/use-license-monitor";
import type { LicenseStatus } from "@/lib/licenseService";

type ScreenState = "loading" | "welcome" | "blocked" | "app" | "error";

interface LicenseWrapperProps {
  children: React.ReactNode;
}

export function LicenseWrapper({ children }: LicenseWrapperProps) {
  const [screen, setScreen] = useState<ScreenState>("loading");
  const [licenseData, setLicenseData] = useState<LicenseStatus | null>(null);
  const [machineId, setMachineId] = useState<string>("");
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const initializeApp = useCallback(async () => {
    setScreen("loading");
    
    try {
      // Verificar licencia
      const licenseResponse = await getLicenseStatus();
      console.log("📋 Respuesta de licencia:", licenseResponse);
      
      // Si el mensaje indica que no se encontró archivo, cambiar estado a NO_LICENSE
      if (licenseResponse.user_message && 
          licenseResponse.user_message.includes("No se encontró archivo de licencia")) {
        licenseResponse.state = "NO_LICENSE";
      }
      
      setLicenseData(licenseResponse);
      
      if (licenseResponse.allow_usage === true) {
        // Licencia válida
        setDaysRemaining(licenseResponse.days_remaining);
        
        if (licenseResponse.show_warning) {
          setWarningMessage(licenseResponse.user_message);
        }
        
        setScreen("welcome");
      } else {
        // Licencia no válida - obtener Machine ID
        const machineResponse = await getMachineId();
        setMachineId(machineResponse.machine_id);
        setScreen("blocked");
      }
    } catch (error: any) {
      console.error("❌ Error al verificar licencia:", error);
      console.log("❌ Mensaje de error:", error.message);
      
      // Si es un error 404, significa que no existe el archivo de licencia
      if (error.message && error.message.includes("404")) {
        console.log("🔵 Detectado error 404 - Mostrando pantalla NO_LICENSE");
        try {
          const machineResponse = await getMachineId();
          setMachineId(machineResponse.machine_id);
          setLicenseData({
            state: "NO_LICENSE",
            allow_usage: false,
            show_warning: false,
            user_message: "No se encontró archivo de licencia",
            days_remaining: 0,
            technical_status: "no_license"
          });
          setScreen("blocked");
        } catch {
          setScreen("error");
        }
      } else {
        setScreen("error");
      }
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Monitoreo periódico de la licencia (cada 30 minutos)
  useLicenseMonitor({
    enabled: screen === "app",
    intervalMinutes: 30,
    onExpired: async () => {
      // Licencia expiró durante el uso
      const machineResponse = await getMachineId();
      setMachineId(machineResponse.machine_id);
      setScreen("blocked");
    },
  });

  const handleWelcomeContinue = () => {
    setScreen("app");
  };

  // Renderizado condicional
  if (screen === "loading") {
    return <LoadingScreen />;
  }

  if (screen === "welcome") {
    return (
      <WelcomeScreen
        daysRemaining={daysRemaining}
        warningMessage={warningMessage}
        onContinue={handleWelcomeContinue}
      />
    );
  }

  if (screen === "blocked") {
    return (
      <BlockedScreen
        message={licenseData?.user_message || "Acceso bloqueado"}
        state={licenseData?.state || "BLOCKED"}
        machineId={machineId}
        onRetry={initializeApp}
      />
    );
  }

  if (screen === "error") {
    return <ErrorScreen onRetry={initializeApp} />;
  }

  // screen === "app" - Mostrar aplicación normal con advertencia si es necesario
  return (
    <>
      {warningMessage && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-yellow-500/10 border-b border-yellow-500/20 p-3">
          <div className="container mx-auto flex items-center justify-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
            <span>⚠️</span>
            <span>{warningMessage}</span>
          </div>
        </div>
      )}
      <div className={warningMessage ? "pt-12" : ""}>
        {children}
      </div>
    </>
  );
}
