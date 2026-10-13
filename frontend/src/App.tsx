/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  NavRoute,
  UserRole,
  CurrentUser,
  Medicine,
  Patient,
  Doctor,
  Prescription,
  PrescriptionItem,
  ToastMessage,
} from './types/pharmacy';
import {
  INITIAL_MEDICINES,
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_PRESCRIPTION_ITEMS,
} from './data/mockData';

// Core Application Shell
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { SplashScreen } from './components/SplashScreen';

// Main Views
import { DashboardView } from './components/DashboardView';
import { MedicinesView } from './components/MedicinesView';
import { PatientsView } from './components/PatientsView';
import { DoctorsView } from './components/DoctorsView';
import { PrescriptionsView } from './components/PrescriptionsView';
import { InventoryView } from './components/InventoryView';
import { InventoryAlertsView } from './components/InventoryAlertsView';
import { ReportsView } from './components/ReportsView';

// Dedicated Profile & Patient Views
import { DoctorProfileView } from './components/DoctorProfileView';
import { PatientProfileView } from './components/PatientProfileView';
import { AdminProfileView } from './components/AdminProfileView';
import { PatientDashboardView } from './components/PatientDashboardView';
import { PatientMedicinesView } from './components/PatientMedicinesView';

// Modals
import { NewPrescriptionModal } from './components/modals/NewPrescriptionModal';
import { MedicineModal } from './components/modals/MedicineModal';
import { PatientModal } from './components/modals/PatientModal';
import { DoctorModal } from './components/modals/DoctorModal';
import { StockAdjustModal } from './components/modals/StockAdjustModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { ToastContainer } from './components/common/ToastContainer';
import { ApiStatusBanner } from './components/common/ApiStatusBanner';
import { ApiConfigModal } from './components/modals/ApiConfigModal';
import {
  fetchMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  adjustMedicineStock,
  fetchPatients,
  createPatient,
  updatePatient,
  deletePatient,
  fetchDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  fetchPrescriptions,
  createPrescription,
  adjustMedicineStock as apiAdjustStock,
  fetchPrescriptionItems,
  getApiBaseUrl,
} from './services/api';

export default function App() {
  // Authentication & Splash State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSplashLoading, setIsSplashLoading] = useState(false);

  // Current Logged-in User & Role
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: 'DOC-101',
    role: 'doctor',
    name: 'Dr. Arjun Mehta',
    email: 'a.mehta@pharmrx-health.com',
    subtitle: 'Chief Cardiologist, MD',
  });

  // Dark Mode Theme (persisted in localStorage)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pharmrx-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Sidebar Retractable State (persisted in localStorage)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pharmrx-sidebar-collapsed') === 'true';
    }
    return false;
  });

  // Active Navigation Route
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync dark theme class on documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('pharmrx-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('pharmrx-sidebar-collapsed', String(next));
      return next;
    });
  };

  // Core Relational Database Entities
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>(
    INITIAL_PRESCRIPTION_ITEMS
  );

  // Selected Detail Views
  const [selectedPrescriptionForDetail, setSelectedPrescriptionForDetail] =
    useState<Prescription | null>(null);

  // Modals State
  const [newRxModalOpen, setNewRxModalOpen] = useState(false);
  const [preselectedPatientId, setPreselectedPatientId] = useState<string | undefined>();
  const [preselectedDoctorId, setPreselectedDoctorId] = useState<string | undefined>();

  const [medicineModalOpen, setMedicineModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const [stockAdjustOpen, setStockAdjustOpen] = useState(false);
  const [adjustingMedicine, setAdjustingMedicine] = useState<Medicine | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteAction, setPendingDeleteAction] = useState<(() => void) | null>(null);
  const [deleteTitle, setDeleteTitle] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Lightweight Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Backend Express/MySQL API Connection & Loading State
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiConfigModalOpen, setApiConfigModalOpen] = useState<boolean>(false);

  // Fetch live data from backend at http://localhost:5000/api/...
  const loadAllData = async (isManualRefresh = false) => {
    setIsLoadingData(true);
    setApiError(null);
    try {
      const [medsRes, patsRes, docsRes, rxsRes, itemsRes] = await Promise.allSettled([
        fetchMedicines(),
        fetchPatients(),
        fetchDoctors(),
        fetchPrescriptions(),
        fetchPrescriptionItems(),
      ]);

      let anySuccess = false;
      let failureReason = '';

      if (medsRes.status === 'fulfilled') {
        if (medsRes.value.length > 0) {
          setMedicines(medsRes.value);
        }
        anySuccess = true;
      } else {
        failureReason = medsRes.reason?.message || 'Failed to fetch medicines';
      }

      if (patsRes.status === 'fulfilled') {
        if (patsRes.value.length > 0) {
          setPatients(patsRes.value);
        }
        anySuccess = true;
      } else if (!failureReason) {
        failureReason = patsRes.reason?.message || '';
      }

      if (docsRes.status === 'fulfilled') {
        if (docsRes.value.length > 0) {
          setDoctors(docsRes.value);
        }
        anySuccess = true;
      } else if (!failureReason) {
        failureReason = docsRes.reason?.message || '';
      }

      if (rxsRes.status === 'fulfilled') {
        if (rxsRes.value.length > 0) {
          setPrescriptions(rxsRes.value);
        }
        anySuccess = true;
      } else if (!failureReason) {
        failureReason = rxsRes.reason?.message || '';
      }

      if (itemsRes.status === 'fulfilled' && itemsRes.value.length > 0) {
        setPrescriptionItems(itemsRes.value);
      }

      if (anySuccess) {
        setApiConnected(true);
        setApiError(null);
        if (isManualRefresh) {
          showToast('Data refreshed dynamically from MySQL backend.', 'success');
        }
      } else {
        setApiConnected(false);
        const errMsg = failureReason || `Could not connect to backend at ${getApiBaseUrl()}`;
        setApiError(errMsg);
        if (isManualRefresh) {
          showToast(errMsg, 'error');
        }
      }
    } catch (err: unknown) {
      setApiConnected(false);
      const msg = err instanceof Error ? err.message : 'Network error connecting to backend';
      setApiError(msg);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fetch data dynamically on initial page load
  useEffect(() => {
    loadAllData();
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Login handler with instant role view opening
  const handleLogin = (role: UserRole, targetId?: string) => {
    if (role === 'admin') {
      setCurrentUser({
        id: 'ADMIN-001',
        role: 'admin',
        name: 'System Administrator',
        email: 'admin@pharmrx-health.com',
        subtitle: 'Super Admin • Full Access',
      });
      setCurrentRoute('dashboard');
      setIsAuthenticated(true);
      showToast('Signed in as Admin. Full access to all database sections granted.', 'success');
    } else if (role === 'doctor') {
      const doc = doctors.find((d) => d.DoctorID === targetId) || doctors[0];
      setCurrentUser({
        id: doc.DoctorID,
        role: 'doctor',
        name: doc.Name,
        email: doc.email || `${doc.Name.toLowerCase().replace(/[^a-z]/g, '')}@pharmrx-health.com`,
        subtitle: `${doc.Specialization} Specialist`,
      });
      setCurrentRoute('dashboard');
      setIsAuthenticated(true);
      showToast(`Signed in successfully as ${doc.Name}.`, 'success');
    } else {
      const pat = patients.find((p) => p.PatientID === targetId) || patients[0];
      setCurrentUser({
        id: pat.PatientID,
        role: 'patient',
        name: pat.Name,
        email: `${pat.Name.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
        subtitle: `Patient #${pat.PatientID}`,
      });
      setCurrentRoute('dashboard');
      setIsAuthenticated(true);
      showToast(`Signed in successfully as ${pat.Name}.`, 'success');
    }
  };

  const handleSplashComplete = () => {
    setIsSplashLoading(false);
    setIsAuthenticated(true);
    showToast(`Signed in successfully as ${currentUser.name}.`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentRoute('dashboard');
    showToast('Signed out of session.', 'info');
  };

  // Navigation Titles
  const routeTitles: Record<NavRoute, string> = {
    dashboard:
      currentUser.role === 'patient'
        ? 'My Dashboard'
        : currentUser.role === 'admin'
        ? 'Admin Overview'
        : 'Dashboard',
    medicines: 'Medicines',
    patients: 'Patients',
    doctors: 'Doctors',
    prescriptions:
      currentUser.role === 'patient'
        ? 'My Prescriptions'
        : 'Prescriptions',
    inventory: 'Inventory',
    alerts: 'Stock Alerts',
    reports: 'Reports & Analytics',
    profile:
      currentUser.role === 'patient'
        ? 'Patient Profile'
        : currentUser.role === 'admin'
        ? 'Administrator Profile'
        : 'Doctor Profile',
    'my-prescriptions': 'My Prescriptions',
    'my-medicines': 'My Medications',
  };

  // CRUD: Prescriptions (sends POST request to /api/prescriptions and updates stock)
  const handleSavePrescription = async (
    newPrescription: Prescription,
    newItems: PrescriptionItem[],
    stockUpdates: { medicineId: string; newStock: number }[]
  ) => {
    setIsSubmitting(true);
    try {
      // Send POST request to http://localhost:5000/api/prescriptions
      await createPrescription({
        ...newPrescription,
        items: newItems,
        stockUpdates,
      });

      // Synchronize stock adjustments with backend
      for (const update of stockUpdates) {
        try {
          await adjustMedicineStock(update.medicineId, update.newStock);
        } catch {
          // Continue with remaining updates
        }
      }

      // Optimistic UI state update
      setPrescriptions((prev) => [newPrescription, ...prev]);
      setPrescriptionItems((prev) => [...newItems, ...prev]);
      setMedicines((prevMeds) =>
        prevMeds.map((med) => {
          const update = stockUpdates.find((u) => u.medicineId === med.MedicineID);
          return update ? { ...med, StockQty: update.newStock } : med;
        })
      );

      showToast(`Prescription ${newPrescription.PrescriptionID} saved to MySQL database.`, 'success');
      // Automatically refresh UI state from backend
      loadAllData();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save prescription';
      showToast(`API Error: ${msg}`, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // CRUD: Medicines (sends POST to /api/medicines or PUT to /api/medicines/:id)
  const handleSaveMedicine = async (med: Medicine) => {
    setIsSubmitting(true);
    const exists = medicines.some((m) => m.MedicineID === med.MedicineID);
    try {
      let saved: Medicine;
      if (exists) {
        // Send PUT request to http://localhost:5000/api/medicines/:id
        saved = await updateMedicine(med.MedicineID, med);
        setMedicines((prev) => prev.map((m) => (m.MedicineID === med.MedicineID ? saved : m)));
        showToast(`Medicine ${med.Name} updated in MySQL.`, 'success');
      } else {
        // Send POST request to http://localhost:5000/api/medicines
        saved = await createMedicine(med);
        setMedicines((prev) => [saved, ...prev]);
        showToast(`Medicine ${med.Name} saved to MySQL.`, 'success');
      }
      // Refresh UI state automatically
      loadAllData();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save medicine';
      showToast(`API Error: ${msg}`, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMedicine = (medicineId: string) => {
    const med = medicines.find((m) => m.MedicineID === medicineId);
    setDeleteTitle('Delete Medicine');
    setDeleteMessage(
      `Are you sure you want to remove ${med?.Name || medicineId} from the MySQL database?`
    );
    setPendingDeleteAction(() => async () => {
      try {
        // Send DELETE request to http://localhost:5000/api/medicines/:id
        await deleteMedicine(medicineId);
        setMedicines((prev) => prev.filter((m) => m.MedicineID !== medicineId));
        showToast('Medicine deleted from MySQL database.', 'success');
        loadAllData();
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete medicine';
        showToast(`API Error: ${msg}`, 'error');
        throw err;
      }
    });
    setDeleteConfirmOpen(true);
  };

  // CRUD: Patients (sends POST to /api/patients or PUT to /api/patients/:id)
  const handleSavePatient = async (pat: Patient) => {
    setIsSubmitting(true);
    const exists = patients.some((p) => p.PatientID === pat.PatientID);
    try {
      let saved: Patient;
      if (exists) {
        // Send PUT request to http://localhost:5000/api/patients/:id
        saved = await updatePatient(pat.PatientID, pat);
        setPatients((prev) => prev.map((p) => (p.PatientID === pat.PatientID ? saved : p)));
        showToast(`Patient ${pat.Name} updated in MySQL.`, 'success');
      } else {
        // Send POST request to http://localhost:5000/api/patients
        saved = await createPatient(pat);
        setPatients((prev) => [saved, ...prev]);
        showToast(`Patient ${pat.Name} saved to MySQL.`, 'success');
      }
      loadAllData();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save patient';
      showToast(`API Error: ${msg}`, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePatient = (patientId: string) => {
    const pat = patients.find((p) => p.PatientID === patientId);
    setDeleteTitle('Delete Patient');
    setDeleteMessage(`Are you sure you want to delete patient ${pat?.Name || patientId}?`);
    setPendingDeleteAction(() => async () => {
      try {
        await deletePatient(patientId);
        setPatients((prev) => prev.filter((p) => p.PatientID !== patientId));
        showToast('Patient deleted from MySQL database.', 'success');
        loadAllData();
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete patient';
        showToast(`API Error: ${msg}`, 'error');
        throw err;
      }
    });
    setDeleteConfirmOpen(true);
  };

  // CRUD: Doctors (sends POST to /api/doctors or PUT to /api/doctors/:id)
  const handleSaveDoctor = async (doc: Doctor) => {
    setIsSubmitting(true);
    const exists = doctors.some((d) => d.DoctorID === doc.DoctorID);
    try {
      let saved: Doctor;
      if (exists) {
        // Send PUT request to http://localhost:5000/api/doctors/:id
        saved = await updateDoctor(doc.DoctorID, doc);
        setDoctors((prev) => prev.map((d) => (d.DoctorID === doc.DoctorID ? saved : d)));
        showToast(`Dr. ${doc.Name} profile updated in MySQL.`, 'success');
      } else {
        // Send POST request to http://localhost:5000/api/doctors
        saved = await createDoctor(doc);
        setDoctors((prev) => [saved, ...prev]);
        showToast(`Dr. ${doc.Name} added to MySQL directory.`, 'success');
      }
      loadAllData();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save doctor';
      showToast(`API Error: ${msg}`, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDoctor = (doctorId: string) => {
    const doc = doctors.find((d) => d.DoctorID === doctorId);
    setDeleteTitle('Delete Doctor');
    setDeleteMessage(`Are you sure you want to delete ${doc?.Name || doctorId}?`);
    setPendingDeleteAction(() => async () => {
      try {
        await deleteDoctor(doctorId);
        setDoctors((prev) => prev.filter((d) => d.DoctorID !== doctorId));
        showToast('Doctor deleted from MySQL database.', 'success');
        loadAllData();
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete doctor';
        showToast(`API Error: ${msg}`, 'error');
        throw err;
      }
    });
    setDeleteConfirmOpen(true);
  };

  // Stock Adjustment (sends PUT request to /api/medicines/:id/stock)
  const handleApplyStockAdjustment = async (medicineId: string, newStock: number) => {
    setIsSubmitting(true);
    try {
      const updated = await adjustMedicineStock(medicineId, newStock);
      setMedicines((prev) =>
        prev.map((m) => (m.MedicineID === medicineId ? { ...m, StockQty: updated.StockQty } : m))
      );
      showToast('Stock level updated on MySQL database.', 'success');
      loadAllData();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update stock';
      showToast(`API Error: ${msg}`, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Alerts flag
  const hasInventoryAlert =
    (currentUser.role === 'doctor' || currentUser.role === 'admin') &&
    medicines.some((m) => m.StockQty <= (m.safetyThreshold || 30));

  // If not logged in, render Login Page
  if (!isAuthenticated && !isSplashLoading) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // If splash loading is active
  if (isSplashLoading) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Current logged in patient or doctor record
  const activeDoctorRecord =
    doctors.find((d) => d.DoctorID === currentUser.id) || doctors[0];
  const activePatientRecord =
    patients.find((p) => p.PatientID === currentUser.id) || patients[0];

  // Prescriptions filtered for current patient if patient role
  const visiblePrescriptions =
    currentUser.role === 'patient'
      ? prescriptions.filter((r) => r.PatientID === currentUser.id)
      : prescriptions;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] font-sans text-slate-800 dark:text-[#F8FAFC] antialiased flex flex-col transition-colors duration-200">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Application Retractable Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onRouteChange={(route) => {
          setSelectedPrescriptionForDetail(null);
          setCurrentRoute(route);
        }}
        hasInventoryAlert={hasInventoryAlert}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        currentUser={currentUser}
      />

      {/* Main Container */}
      <div
        className={`${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        } flex flex-col min-h-screen transition-all duration-300`}
      >
        {/* Top Header */}
        <Header
          title={routeTitles[currentRoute]}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenNotifications={() => {
            if (currentUser.role === 'doctor' || currentUser.role === 'admin') {
              setCurrentRoute('alerts');
            } else {
              setCurrentRoute('dashboard');
            }
          }}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          hasNotifications={hasInventoryAlert}
          isSidebarCollapsed={isSidebarCollapsed}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          currentUser={currentUser}
          onNavigateToProfile={() => setCurrentRoute('profile')}
          onLogout={handleLogout}
          apiConnected={apiConnected}
          isSyncingData={isLoadingData}
          onRefreshData={() => loadAllData(true)}
          onOpenApiConfig={() => setApiConfigModalOpen(true)}
        />

        {/* View Switcher */}
        <main className="w-full pt-16 flex-1">
          {/* Backend Express/MySQL Connection and Loading Banner */}
          <ApiStatusBanner
            isLoading={isLoadingData}
            error={apiError}
            isConnected={apiConnected}
            onRetry={() => loadAllData(true)}
            onOpenSettings={() => setApiConfigModalOpen(true)}
            onDismissError={() => setApiError(null)}
          />

          {/* ================= PATIENT VIEWS ================= */}
          {currentUser.role === 'patient' && currentRoute === 'dashboard' && (
            <PatientDashboardView
              patient={activePatientRecord}
              prescriptions={prescriptions}
              prescriptionItems={prescriptionItems}
              medicines={medicines}
              doctors={doctors}
              onNavigateToPrescriptions={() => setCurrentRoute('my-prescriptions')}
              onNavigateToMedicines={() => setCurrentRoute('my-medicines')}
              onNavigateToProfile={() => setCurrentRoute('profile')}
              onViewPrescription={(rx) => {
                setSelectedPrescriptionForDetail(rx);
                setCurrentRoute('my-prescriptions');
              }}
            />
          )}

          {currentUser.role === 'patient' &&
            (currentRoute === 'my-prescriptions' || currentRoute === 'prescriptions') && (
              <PrescriptionsView
                prescriptions={visiblePrescriptions}
                prescriptionItems={prescriptionItems}
                medicines={medicines}
                doctors={doctors}
                patients={patients}
                onOpenNewRxModal={() => {
                  showToast('Prescriptions are authorized directly by medical clinicians.', 'info');
                }}
                selectedPrescription={selectedPrescriptionForDetail}
                onClearSelectedPrescription={() => setSelectedPrescriptionForDetail(null)}
              />
            )}

          {currentUser.role === 'patient' &&
            (currentRoute === 'my-medicines' || currentRoute === 'medicines') && (
              <PatientMedicinesView
                patientId={currentUser.id}
                medicines={medicines}
                prescriptionItems={prescriptionItems}
                prescriptions={prescriptions}
                doctors={doctors}
                onViewPrescription={(rx) => {
                  setSelectedPrescriptionForDetail(rx);
                  setCurrentRoute('my-prescriptions');
                }}
              />
            )}

          {currentUser.role === 'patient' && currentRoute === 'profile' && (
            <PatientProfileView
              patient={activePatientRecord}
              prescriptions={prescriptions}
              prescriptionItems={prescriptionItems}
              medicines={medicines}
              doctors={doctors}
              onViewPrescription={(rx) => {
                setSelectedPrescriptionForDetail(rx);
                setCurrentRoute('my-prescriptions');
              }}
            />
          )}

          {/* ================= CLINICAL & ADMIN VIEWS ================= */}
          {(currentUser.role === 'doctor' || currentUser.role === 'admin') && currentRoute === 'dashboard' && (
            <DashboardView
              medicines={medicines}
              patients={patients}
              doctors={doctors}
              prescriptions={prescriptions}
              onNavigate={(route) => setCurrentRoute(route)}
              onViewPrescription={(rx) => {
                setSelectedPrescriptionForDetail(rx);
                setCurrentRoute('prescriptions');
              }}
              isAdmin={currentUser.role === 'admin'}
            />
          )}

          {(currentUser.role === 'doctor' || currentUser.role === 'admin') && currentRoute === 'medicines' && (
            <MedicinesView
              medicines={medicines}
              prescriptionItems={prescriptionItems}
              prescriptions={prescriptions}
              onOpenAddModal={() => {
                setEditingMedicine(null);
                setMedicineModalOpen(true);
              }}
              onOpenEditModal={(med) => {
                setEditingMedicine(med);
                setMedicineModalOpen(true);
              }}
              onDeleteMedicine={handleDeleteMedicine}
              onOpenStockAdjust={(med) => {
                setAdjustingMedicine(med);
                setStockAdjustOpen(true);
              }}
            />
          )}

          {(currentUser.role === 'doctor' || currentUser.role === 'admin') && currentRoute === 'patients' && (
            <PatientsView
              patients={patients}
              prescriptions={prescriptions}
              doctors={doctors}
              onOpenAddModal={() => {
                setEditingPatient(null);
                setPatientModalOpen(true);
              }}
              onOpenEditModal={(pat) => {
                setEditingPatient(pat);
                setPatientModalOpen(true);
              }}
              onDeletePatient={handleDeletePatient}
              onOpenNewRxForPatient={(pat) => {
                setPreselectedPatientId(pat.PatientID);
                setPreselectedDoctorId(currentUser.role === 'admin' ? doctors[0].DoctorID : currentUser.id);
                setNewRxModalOpen(true);
              }}
              onViewPrescription={(rx) => {
                setSelectedPrescriptionForDetail(rx);
                setCurrentRoute('prescriptions');
              }}
            />
          )}

          {(currentUser.role === 'doctor' || currentUser.role === 'admin') && currentRoute === 'doctors' && (
            <DoctorsView
              doctors={doctors}
              prescriptions={prescriptions}
              patients={patients}
              onOpenAddModal={() => {
                setEditingDoctor(null);
                setDoctorModalOpen(true);
              }}
              onOpenEditModal={(doc) => {
                setEditingDoctor(doc);
                setDoctorModalOpen(true);
              }}
              onDeleteDoctor={handleDeleteDoctor}
              onOpenNewRxForDoctor={(doc) => {
                setPreselectedDoctorId(doc.DoctorID);
                setPreselectedPatientId(undefined);
                setNewRxModalOpen(true);
              }}
              onViewPrescription={(rx) => {
                setSelectedPrescriptionForDetail(rx);
                setCurrentRoute('prescriptions');
              }}
            />
          )}

          {(currentUser.role === 'doctor' || currentUser.role === 'admin') && currentRoute === 'prescriptions' && (
            <PrescriptionsView
              prescriptions={prescriptions}
              prescriptionItems={prescriptionItems}
              medicines={medicines}
              doctors={doctors}
              patients={patients}
              onOpenNewRxModal={() => {
                setPreselectedPatientId(undefined);
                setPreselectedDoctorId(currentUser.role === 'admin' ? doctors[0].DoctorID : currentUser.id);
                setNewRxModalOpen(true);
              }}
              selectedPrescription={selectedPrescriptionForDetail}
              onClearSelectedPrescription={() => setSelectedPrescriptionForDetail(null)}
            />
          )}

          {(currentUser.role === 'doctor' || currentUser.role === 'admin') && currentRoute === 'inventory' && (
            <InventoryView
              medicines={medicines}
              onNavigateToAlerts={() => setCurrentRoute('alerts')}
              onOpenStockAdjust={(med) => {
                setAdjustingMedicine(med);
                setStockAdjustOpen(true);
              }}
            />
          )}

          {(currentUser.role === 'doctor' || currentUser.role === 'admin') && currentRoute === 'alerts' && (
            <InventoryAlertsView
              medicines={medicines}
              onOpenStockAdjust={(med) => {
                setAdjustingMedicine(med);
                setStockAdjustOpen(true);
              }}
            />
          )}

          {(currentUser.role === 'doctor' || currentUser.role === 'admin') && currentRoute === 'reports' && (
            <ReportsView medicines={medicines} doctors={doctors} />
          )}

          {currentUser.role === 'doctor' && currentRoute === 'profile' && (
            <DoctorProfileView
              doctor={activeDoctorRecord}
              prescriptions={prescriptions}
              prescriptionItems={prescriptionItems}
              medicines={medicines}
              onViewPrescription={(rx) => {
                setSelectedPrescriptionForDetail(rx);
                setCurrentRoute('prescriptions');
              }}
            />
          )}

          {currentUser.role === 'admin' && currentRoute === 'profile' && (
            <AdminProfileView
              medicines={medicines}
              patients={patients}
              doctors={doctors}
              prescriptions={prescriptions}
              onNavigate={(route) => setCurrentRoute(route)}
            />
          )}
        </main>
      </div>

      {/* Reusable Modals */}
      <NewPrescriptionModal
        isOpen={newRxModalOpen}
        onClose={() => setNewRxModalOpen(false)}
        patients={patients}
        doctors={doctors}
        medicines={medicines}
        onSavePrescription={handleSavePrescription}
        preselectedPatientId={preselectedPatientId}
        preselectedDoctorId={preselectedDoctorId}
        isSubmitting={isSubmitting}
      />

      <MedicineModal
        isOpen={medicineModalOpen}
        onClose={() => {
          setMedicineModalOpen(false);
          setEditingMedicine(null);
        }}
        onSave={handleSaveMedicine}
        initialMedicine={editingMedicine}
        isSubmitting={isSubmitting}
      />

      <PatientModal
        isOpen={patientModalOpen}
        onClose={() => {
          setPatientModalOpen(false);
          setEditingPatient(null);
        }}
        onSave={handleSavePatient}
        initialPatient={editingPatient}
        isSubmitting={isSubmitting}
      />

      <DoctorModal
        isOpen={doctorModalOpen}
        onClose={() => {
          setDoctorModalOpen(false);
          setEditingDoctor(null);
        }}
        onSave={handleSaveDoctor}
        initialDoctor={editingDoctor}
        isSubmitting={isSubmitting}
      />

      <StockAdjustModal
        isOpen={stockAdjustOpen}
        onClose={() => {
          setStockAdjustOpen(false);
          setAdjustingMedicine(null);
        }}
        medicine={adjustingMedicine}
        onApply={handleApplyStockAdjustment}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setPendingDeleteAction(null);
        }}
        onConfirm={async () => {
          if (pendingDeleteAction) {
            await pendingDeleteAction();
          }
        }}
        title={deleteTitle}
        message={deleteMessage}
        isDeleting={isSubmitting}
      />

      <ApiConfigModal
        isOpen={apiConfigModalOpen}
        onClose={() => setApiConfigModalOpen(false)}
        onRefreshData={() => loadAllData(true)}
        isDataLoading={isLoadingData}
      />

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        medicines={medicines}
        patients={patients}
        doctors={doctors}
        prescriptions={prescriptions}
        onSelectMedicine={(med) => {
          if (currentUser.role === 'patient') {
            setCurrentRoute('my-medicines');
          } else {
            setCurrentRoute('medicines');
          }
        }}
        onSelectPatient={(pat) => {
          if (currentUser.role === 'patient') {
            setCurrentRoute('profile');
          } else {
            setCurrentRoute('patients');
          }
        }}
        onSelectDoctor={(doc) => {
          if (currentUser.role === 'doctor' || currentUser.role === 'admin') {
            setCurrentRoute('doctors');
          }
        }}
        onSelectPrescription={(rx) => {
          setSelectedPrescriptionForDetail(rx);
          if (currentUser.role === 'patient') {
            setCurrentRoute('my-prescriptions');
          } else {
            setCurrentRoute('prescriptions');
          }
        }}
      />
    </div>
  );
}
