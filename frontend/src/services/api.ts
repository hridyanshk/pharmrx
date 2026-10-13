/**
 * API Service for connecting to Express/MySQL backend running at http://localhost:5000
 * Handles fetching, POST/PUT/DELETE operations, data normalization, and connection health.
 */

import { Medicine, Patient, Doctor, Prescription, PrescriptionItem } from '../types/pharmacy';

export const DEFAULT_API_BASE = 'http://localhost:5000/api';

// Allow overriding via localStorage or environment variable
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('pharmrx_api_url');
    if (customUrl) return customUrl;
  }
  return (import.meta.env.VITE_API_URL as string) || DEFAULT_API_BASE;
}

export function setApiBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pharmrx_api_url', url.trim());
  }
}

export function resetApiBaseUrl(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pharmrx_api_url');
  }
}

/**
 * Common fetch helper with JSON headers, timeout, and friendly error reporting
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  // 10 second timeout for network calls
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
    let errorMessage = `HTTP ${response.status} ${response.statusText}`;
    try {
        // Read the response text once safely
        const errorText = await response.text();
        try {
            // Try parsing it as JSON if it looks like JSON
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorData.msg || errorText;
        } catch {
            // If it's plain text (like an Express HTML error page), use it or fallback
            if (errorText) errorMessage = errorText;
        }
    } catch {
        // Fallback if reading the stream fails completely
    }
    throw new Error(errorMessage);
}

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error(`Request to ${url} timed out. Ensure your backend at ${baseUrl} is running.`);
      }
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        throw new Error(
          `Unable to connect to backend at ${url}. Please verify your Node.js/Express server is running on port 5000 with CORS enabled.`
        );
      }
      throw err;
    }
    throw new Error('An unexpected network error occurred.');
  }
}

/**
 * Safe array extractor to handle both raw array responses `[...]`
 * and wrapped responses `{ data: [...] }`, `{ rows: [...] }`, etc.
 */
function extractArray(data: any, preferredKey?: string): any[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  if (preferredKey && Array.isArray(data[preferredKey])) return data[preferredKey];
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.rows)) return data.rows;
  if (Array.isArray(data.result)) return data.result;
  if (Array.isArray(data.medicines)) return data.medicines;
  if (Array.isArray(data.patients)) return data.patients;
  if (Array.isArray(data.doctors)) return data.doctors;
  if (Array.isArray(data.prescriptions)) return data.prescriptions;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

/**
 * Normalization helpers to handle MySQL column names regardless of casing
 * (e.g. snake_case, camelCase, lowercase, or PascalCase)
 */
export function normalizeMedicine(item: any): Medicine {
  return {
    MedicineID: String(item.MedicineID || item.medicine_id || item.medicineId || item.id || item.ID || `MED-${Date.now()}`),
    Name: String(item.Name || item.name || item.medicine_name || item.medicineName || 'Unnamed Medicine'),
    Brand: String(item.Brand || item.brand || item.manufacturer || 'Generic'),
    Price: Number(item.Price ?? item.price ?? item.cost ?? 0),
    StockQty: Number(item.StockQty ?? item.stock_qty ?? item.stockQty ?? item.stock ?? item.quantity ?? 0),
    safetyThreshold: Number(item.safetyThreshold ?? item.safety_threshold ?? item.threshold ?? 30),
  };
}

export function normalizePatient(item: any): Patient {
  return {
    PatientID: String(item.PatientID || item.patient_id || item.patientId || item.id || item.ID || `PT-${Date.now()}`),
    Name: String(item.Name || item.name || item.patient_name || item.patientName || 'Unnamed Patient'),
    DateOfBirth: String(item.DateOfBirth || item.date_of_birth || item.dob || item.Date_Of_Birth || '1995-01-01'),
    Phone: String(item.Phone || item.phone || item.contact || item.phone_number || '+91 98000 00000'),
    Address: String(item.Address || item.address || item.city || 'Mumbai, Maharashtra'),
  };
}

export function normalizeDoctor(item: any): Doctor {
  const name = String(item.Name || item.name || item.doctor_name || item.doctorName || 'Dr. Practitioner');
  return {
    DoctorID: String(item.DoctorID || item.doctor_id || item.doctorId || item.id || item.ID || `DOC-${Date.now()}`),
    Name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
    Specialization: String(item.Specialization || item.specialization || item.specialty || 'General Physician'),
    Phone: String(item.Phone || item.phone || item.contact || '+91 98000 00000'),
    email: item.email || item.Email || item.contact_email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@pharmrx-health.com`,
  };
}

export function normalizePrescription(item: any): Prescription {
  return {
    PrescriptionID: String(item.PrescriptionID || item.prescription_id || item.prescriptionId || item.id || item.ID || `RX-${Date.now()}`),
    Date: String(item.Date || item.date || item.created_at || item.createdAt || new Date().toISOString().slice(0, 10)),
    Notes: String(item.Notes || item.notes || item.instruction || item.instructions || 'Take as directed'),
    DoctorID: String(item.DoctorID || item.doctor_id || item.doctorId || item.doctor || ''),
    PatientID: String(item.PatientID || item.patient_id || item.patientId || item.patient || ''),
    status: item.status || item.Status || 'Active',
  };
}

export function normalizePrescriptionItem(item: any): PrescriptionItem {
  return {
    ItemID: String(item.ItemID || item.item_id || item.itemId || item.id || `ITM-${Date.now()}`),
    Quantity: Number(item.Quantity ?? item.quantity ?? item.qty ?? 1),
    Dosage: String(item.Dosage || item.dosage || '1 dose daily'),
    PrescriptionID: String(item.PrescriptionID || item.prescription_id || item.prescriptionId || ''),
    MedicineID: String(item.MedicineID || item.medicine_id || item.medicineId || ''),
  };
}

// ==========================================
// MEDICINES API
// ==========================================

export async function fetchMedicines(): Promise<Medicine[]> {
  const res = await request<any>('/medicines');
  const list = extractArray(res, 'medicines');
  return list.map(normalizeMedicine);
}

export async function createMedicine(med: Omit<Medicine, 'MedicineID'> & { MedicineID?: string }): Promise<Medicine> {
  const res = await request<any>('/medicines', {
    method: 'POST',
    body: JSON.stringify(med),
  });
  return normalizeMedicine(res.data || res.medicine || res);
}

export async function updateMedicine(id: string, med: Partial<Medicine>): Promise<Medicine> {
  const res = await request<any>(`/medicines/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(med),
  });
  return normalizeMedicine(res.data || res.medicine || res);
}

export async function deleteMedicine(id: string): Promise<{ success: boolean; message?: string }> {
  return request<{ success: boolean; message?: string }>(`/medicines/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function adjustMedicineStock(id: string, newStock: number): Promise<Medicine> {
  try {
    const res = await request<any>(`/medicines/${encodeURIComponent(id)}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ StockQty: newStock }),
    });
    return normalizeMedicine(res.data || res.medicine || res);
  } catch {
    return updateMedicine(id, { StockQty: newStock });
  }
}

// ==========================================
// PATIENTS API
// ==========================================

export async function fetchPatients(): Promise<Patient[]> {
  const res = await request<any>('/patients');
  const list = extractArray(res, 'patients');
  return list.map(normalizePatient);
}

export async function createPatient(patient: Omit<Patient, 'PatientID'> & { PatientID?: string }): Promise<Patient> {
  const res = await request<any>('/patients', {
    method: 'POST',
    body: JSON.stringify(patient),
  });
  return normalizePatient(res.data || res.patient || res);
}

export async function updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
  const res = await request<any>(`/patients/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(patient),
  });
  return normalizePatient(res.data || res.patient || res);
}

export async function deletePatient(id: string): Promise<{ success: boolean; message?: string }> {
  return request<{ success: boolean; message?: string }>(`/patients/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// ==========================================
// DOCTORS API
// ==========================================

export async function fetchDoctors(): Promise<Doctor[]> {
  const res = await request<any>('/doctors');
  const list = extractArray(res, 'doctors');
  return list.map(normalizeDoctor);
}

export async function createDoctor(doctor: Omit<Doctor, 'DoctorID'> & { DoctorID?: string }): Promise<Doctor> {
  const res = await request<any>('/doctors', {
    method: 'POST',
    body: JSON.stringify(doctor),
  });
  return normalizeDoctor(res.data || res.doctor || res);
}

export async function updateDoctor(id: string, doctor: Partial<Doctor>): Promise<Doctor> {
  const res = await request<any>(`/doctors/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(doctor),
  });
  return normalizeDoctor(res.data || res.doctor || res);
}

export async function deleteDoctor(id: string): Promise<{ success: boolean; message?: string }> {
  return request<{ success: boolean; message?: string }>(`/doctors/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// ==========================================
// PRESCRIPTIONS API
// ==========================================

export async function fetchPrescriptions(): Promise<Prescription[]> {
  const res = await request<any>('/prescriptions');
  const list = extractArray(res, 'prescriptions');
  return list.map(normalizePrescription);
}

export async function createPrescription(
  prescription: Omit<Prescription, 'PrescriptionID'> & {
    PrescriptionID?: string;
    items?: PrescriptionItem[];
    stockUpdates?: { medicineId: string; newStock: number }[];
  }
): Promise<Prescription> {
  const res = await request<any>('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(prescription),
  });
  return normalizePrescription(res.data || res.prescription || res);
}

export async function updatePrescription(id: string, prescription: Partial<Prescription>): Promise<Prescription> {
  const res = await request<any>(`/prescriptions/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(prescription),
  });
  return normalizePrescription(res.data || res.prescription || res);
}

export async function deletePrescription(id: string): Promise<{ success: boolean; message?: string }> {
  return request<{ success: boolean; message?: string }>(`/prescriptions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// ==========================================
// PRESCRIPTION ITEMS API
// ==========================================

export async function fetchPrescriptionItems(): Promise<PrescriptionItem[]> {
  try {
    const res = await request<any>('/prescription-items');
    const list = extractArray(res, 'items');
    return list.map(normalizePrescriptionItem);
  } catch {
    // If backend doesn't have dedicated endpoint for prescription items, return empty
    return [];
  }
}

export async function createPrescriptionItem(item: PrescriptionItem): Promise<PrescriptionItem> {
  const res = await request<any>('/prescription-items', {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return normalizePrescriptionItem(res.data || res.item || res);
}

// ==========================================
// HEALTH / CONNECTIVITY CHECK
// ==========================================

export async function testApiConnection(): Promise<{ ok: boolean; message: string; url: string }> {
  const baseUrl = getApiBaseUrl();
  try {
    // Attempt health or medicines endpoint
    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/medicines`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      return {
        ok: true,
        message: `Successfully connected to backend at ${baseUrl} (HTTP ${res.status}).`,
        url: baseUrl,
      };
    }
    return {
      ok: false,
      message: `Backend responded with HTTP ${res.status} ${res.statusText}.`,
      url: baseUrl,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Connection failed';
    return {
      ok: false,
      message: `Cannot reach backend at ${baseUrl}: ${msg}`,
      url: baseUrl,
    };
  }
}
