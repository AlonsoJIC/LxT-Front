// hooks/use-license-monitor.ts
"use client";

import { useEffect, useCallback } from "react";
import { getCachedLicenseStatus } from "@/lib/licenseService";

interface UseLicenseMonitorOptions {
  enabled?: boolean;
  intervalMinutes?: number;
  onExpired?: () => void;
}

/**
 * Hook para monitorear el estado de la licencia en segundo plano
 * @param options.enabled - Si está habilitado el monitoreo (default: true)
 * @param options.intervalMinutes - Intervalo en minutos para verificar (default: 30)
 * @param options.onExpired - Callback cuando la licencia expira
 */
export function useLicenseMonitor({
  enabled = true,
  intervalMinutes = 30,
  onExpired,
}: UseLicenseMonitorOptions = {}) {
  const checkLicense = useCallback(async () => {
    try {
      const status = await getCachedLicenseStatus();

      if (!status.allow_usage && onExpired) {
        onExpired();
      }
    } catch (error) {
      console.error("Error al verificar licencia en segundo plano:", error);
    }
  }, [onExpired]);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      checkLicense();
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [enabled, intervalMinutes, checkLicense]);
}
