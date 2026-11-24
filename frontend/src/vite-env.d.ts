/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ENABLE_DEMO_LOGIN?: string;
  readonly VITE_DEMO_ADMIN_EMAIL?: string;
  readonly VITE_DEMO_ADMIN_PASSWORD?: string;
  readonly VITE_DEMO_DOCTOR_EMAIL?: string;
  readonly VITE_DEMO_DOCTOR_PASSWORD?: string;
  readonly VITE_DEMO_RECEPTIONIST_EMAIL?: string;
  readonly VITE_DEMO_RECEPTIONIST_PASSWORD?: string;
  readonly VITE_DEMO_PATIENT_EMAIL?: string;
  readonly VITE_DEMO_PATIENT_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
