// lib/licenseService.ts
export const LICENSE_API_BASE = "http://127.0.0.1:8000";

export interface LicenseStatus {
  state: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "BLOCKED" | "NO_LICENSE";
  allow_usage: boolean;
  show_warning: boolean;
  user_message: string;
  days_remaining: number;
  technical_status: string;
}

export interface CachedLicenseStatus {
  last_check: string;
  state: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "BLOCKED" | "NO_LICENSE";
  allow_usage: boolean;
  user_message: string;
  days_remaining: number;
}

export interface MachineIdResponse {
  machine_id: string;
}

export interface LicenseFeatures {
  allow_usage: boolean;
  features: {
    transcription: boolean;
    export_docx: boolean;
  };
}

export async function getLicenseStatus(): Promise<LicenseStatus> {
  const res = await fetch(`${LICENSE_API_BASE}/api/license/status`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("404: Archivo de licencia no encontrado");
    }
    throw new Error(`Error al verificar el estado de la licencia: ${res.status}`);
  }
  return res.json();
}

export async function getCachedLicenseStatus(): Promise<CachedLicenseStatus> {
  const res = await fetch(`${LICENSE_API_BASE}/api/license/cached-status`);
  if (!res.ok) {
    throw new Error("Error al obtener el estado cacheado de la licencia");
  }
  return res.json();
}

export async function getMachineId(): Promise<MachineIdResponse> {
  const res = await fetch(`${LICENSE_API_BASE}/api/license/machine-id`);
  if (!res.ok) {
    throw new Error("Error al obtener el Machine ID");
  }
  return res.json();
}

export async function getLicenseFeatures(): Promise<LicenseFeatures> {
  const res = await fetch(`${LICENSE_API_BASE}/api/license/features`);
  if (!res.ok) {
    throw new Error("Error al obtener las características de la licencia");
  }
  return res.json();
}
