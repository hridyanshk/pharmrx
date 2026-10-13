/**
 * Core Database Model - Exact relational specification
 * 
 * Doctor: DoctorID, Name, Specialization, Phone
 * Patient: PatientID, Name, DateOfBirth, Phone, Address
 * Prescription: PrescriptionID, Date, Notes, DoctorID, PatientID
 * PrescriptionItem: ItemID, Quantity, Dosage, PrescriptionID, MedicineID
 * Medicine: MedicineID, Name, Brand, Price, StockQty
 * 
 * Relationships:
 * Doctor -> Prescription
 * Patient -> Prescription
 * Prescription -> PrescriptionItem
 * PrescriptionItem -> Medicine
 */

export interface Doctor {
  DoctorID: string;
  Name: string;
  Specialization: string;
  Phone: string;
  // UI helpers
  email?: string;
}

export interface Patient {
  PatientID: string;
  Name: string;
  DateOfBirth: string; // YYYY-MM-DD
  Phone: string;
  Address: string;
  // UI helpers
  avatarUrl?: string;
  allergies?: string[];
}

export interface PrescriptionItem {
  ItemID: string;
  Quantity: number;
  Dosage: string;
  PrescriptionID: string;
  MedicineID: string;
  // Denormalized/UI helper for convenience
  medicineName?: string;
  unitPrice?: number;
}

export interface Prescription {
  PrescriptionID: string;
  Date: string; // YYYY-MM-DD or readable
  Notes: string;
  DoctorID: string;
  PatientID: string;
  // UI helpers / relations populated
  status?: 'Dispensed' | 'In Filling' | 'Pending Review';
  items?: PrescriptionItem[];
}

export interface Medicine {
  MedicineID: string;
  Name: string;
  Brand: string;
  Price: number;
  StockQty: number;
  // UI helpers
  safetyThreshold?: number;
  category?: string;
}

export interface StockAlert {
  id: string;
  MedicineID: string;
  medicineName: string;
  currentStock: number;
  safetyThreshold: number;
  status: 'Out of Stock' | 'Low Stock' | 'Recently Restocked';
  severity: 'critical' | 'warning' | 'success';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type UserRole = 'doctor' | 'patient' | 'admin';

export interface CurrentUser {
  id: string; // DoctorID or PatientID
  role: UserRole;
  name: string;
  email?: string;
  avatarUrl?: string;
  subtitle?: string; // e.g. "Chief Cardiologist" or "Patient #PT-1002"
}

export type NavRoute =
  | 'dashboard'
  | 'medicines'
  | 'patients'
  | 'doctors'
  | 'prescriptions'
  | 'inventory'
  | 'alerts'
  | 'reports'
  | 'profile'
  | 'my-prescriptions'
  | 'my-medicines';
