USE remix_pharmrx;
SELECT 'Prescriptions' record_type,COUNT(*) saved FROM rx_prescriptions
UNION ALL
SELECT 'Dispensed',COUNT(*) FROM rx_prescriptions WHERE status='Dispensed'
UNION ALL
SELECT 'Invoices',COUNT(*) FROM rx_invoices
UNION ALL
SELECT 'Medicines',COUNT(*) FROM rx_medicines
UNION ALL
SELECT 'Patients',COUNT(*) FROM rx_patients
UNION ALL
SELECT 'Safety triggers',COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() AND TRIGGER_NAME LIKE 'rx_safety_invoice_%';