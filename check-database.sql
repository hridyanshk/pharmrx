-- Use a Workbench connection to the SAME database as the website.
-- The deployed website uses Railway MySQL. Local MySQL is a separate database.
SELECT DATABASE() AS connected_database, CURRENT_TIMESTAMP AS database_time;

SELECT 'Medicines' AS records, COUNT(*) AS total FROM rx_medicines
UNION ALL SELECT 'Patients', COUNT(*) FROM rx_patients
UNION ALL SELECT 'Doctors', COUNT(*) FROM rx_doctors
UNION ALL SELECT 'Suppliers', COUNT(*) FROM rx_suppliers
UNION ALL SELECT 'Batches', COUNT(*) FROM rx_batches
UNION ALL SELECT 'Prescriptions', COUNT(*) FROM rx_prescriptions
UNION ALL SELECT 'Prescription items', COUNT(*) FROM rx_prescription_items
UNION ALL SELECT 'Invoices', COUNT(*) FROM rx_invoices;

-- After adding a medicine on the website, rerun this query.
SELECT id, brand_name, generic_name, schedule_type, reorder_level
FROM rx_medicines ORDER BY id DESC LIMIT 15;

-- Exact save check: add a uniquely named medicine on the website and use its name here.
SELECT id, brand_name, generic_name FROM rx_medicines
WHERE brand_name = 'MY DATABASE CHECK';

-- Saved actions remain after refresh. Undo updates undone_at.
SELECT id, actor_id, label, method, path, created_at, undone_at
FROM rx_action_history ORDER BY id DESC LIMIT 20;

-- Stock and prescription status update together when medicines are issued.
SELECT b.id, m.brand_name, b.batch_number, b.stock_qty, b.expiry_date
FROM rx_batches b JOIN rx_medicines m ON m.id=b.medicine_id ORDER BY b.id DESC LIMIT 15;
SELECT id, patient_id, status FROM rx_prescriptions ORDER BY id DESC LIMIT 15;
SELECT id, prescription_id, net_payable, invoice_date FROM rx_invoices ORDER BY id DESC LIMIT 15;
