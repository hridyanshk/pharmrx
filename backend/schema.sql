-- PharmRx extension schema. Existing assignment tables are left intact.
CREATE TABLE IF NOT EXISTS rx_action_history (
 id BIGINT AUTO_INCREMENT PRIMARY KEY, actor_id INT NOT NULL, actor_role VARCHAR(20) NOT NULL,
 label VARCHAR(150) NOT NULL, method VARCHAR(10) NOT NULL, path VARCHAR(200) NOT NULL,
 request_key VARCHAR(80), changes JSON NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 undone_at TIMESTAMP NULL, INDEX(actor_id,id), INDEX(request_key)
);
CREATE TABLE IF NOT EXISTS rx_patients (
 id INT AUTO_INCREMENT PRIMARY KEY, user_id INT UNIQUE, name VARCHAR(150) NOT NULL,
 date_of_birth DATE, phone VARCHAR(30), address TEXT, flag_athlete BOOLEAN NOT NULL DEFAULT FALSE,
 flag_elderly_care BOOLEAN NOT NULL DEFAULT FALSE, flag_high_risk_addiction BOOLEAN NOT NULL DEFAULT FALSE,
 requires_full_profile BOOLEAN NOT NULL DEFAULT FALSE,
 FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS rx_doctors (
 id INT AUTO_INCREMENT PRIMARY KEY, user_id INT UNIQUE, name VARCHAR(150) NOT NULL,
 reg_number VARCHAR(80) UNIQUE, phone VARCHAR(30), email VARCHAR(150), FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS rx_pharmacists (
 id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL UNIQUE, name VARCHAR(150) NOT NULL,
 dl_number VARCHAR(80), FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS rx_suppliers (
 id INT AUTO_INCREMENT PRIMARY KEY, company_name VARCHAR(150) NOT NULL, gstin VARCHAR(30), phone VARCHAR(30)
);
CREATE TABLE IF NOT EXISTS rx_medicines (
 id INT AUTO_INCREMENT PRIMARY KEY, brand_name VARCHAR(150) NOT NULL, generic_name VARCHAR(150),
 hsn_code VARCHAR(30), schedule_type ENUM('Schedule H','Schedule H1','Schedule X','OTC') NOT NULL DEFAULT 'OTC',
 tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0, reorder_level INT NOT NULL DEFAULT 20
);
CREATE TABLE IF NOT EXISTS rx_batches (
 id INT AUTO_INCREMENT PRIMARY KEY, medicine_id INT NOT NULL, batch_number VARCHAR(80) NOT NULL,
 expiry_date DATE NOT NULL, mrp DECIMAL(10,2) NOT NULL, stock_qty INT NOT NULL DEFAULT 0,
 supplier_id INT, UNIQUE(medicine_id,batch_number), CHECK(stock_qty>=0), CHECK(mrp>=0),
 FOREIGN KEY(medicine_id) REFERENCES rx_medicines(id), FOREIGN KEY(supplier_id) REFERENCES rx_suppliers(id)
);
CREATE TABLE IF NOT EXISTS rx_allergies (
 id INT AUTO_INCREMENT PRIMARY KEY, patient_id INT NOT NULL, medicine_id INT NOT NULL,
 allergy_name VARCHAR(150) NOT NULL, severity ENUM('Mild','Moderate','Severe') NOT NULL,
 FOREIGN KEY(patient_id) REFERENCES rx_patients(id), FOREIGN KEY(medicine_id) REFERENCES rx_medicines(id)
);
CREATE TABLE IF NOT EXISTS rx_stock_adjustments (
 id INT AUTO_INCREMENT PRIMARY KEY, batch_id INT NOT NULL, user_id INT NOT NULL,
 old_quantity INT NOT NULL, new_quantity INT NOT NULL, reason TEXT NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(batch_id) REFERENCES rx_batches(id), FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS rx_instructions (
 id INT AUTO_INCREMENT PRIMARY KEY, patient_id INT NOT NULL, medicine_id INT NOT NULL,
 instruction_type ENUM('Avoid','Specific Dose Limit','Monitoring Required') NOT NULL, notes TEXT NOT NULL,
 FOREIGN KEY(patient_id) REFERENCES rx_patients(id), FOREIGN KEY(medicine_id) REFERENCES rx_medicines(id)
);
CREATE TABLE IF NOT EXISTS rx_sports_restrictions (
 id INT AUTO_INCREMENT PRIMARY KEY, medicine_id INT NOT NULL UNIQUE, banned_category VARCHAR(150) NOT NULL, notes TEXT,
 FOREIGN KEY(medicine_id) REFERENCES rx_medicines(id)
);
CREATE TABLE IF NOT EXISTS rx_dosage_limits (
 id INT AUTO_INCREMENT PRIMARY KEY, medicine_id INT NOT NULL UNIQUE, max_qty_per_30_days INT NOT NULL,
 risk_level ENUM('Standard','Controlled','High OD Risk') NOT NULL, CHECK(max_qty_per_30_days>0),
 FOREIGN KEY(medicine_id) REFERENCES rx_medicines(id)
);
CREATE TABLE IF NOT EXISTS rx_interaction_rules (
 id INT AUTO_INCREMENT PRIMARY KEY, rule_name VARCHAR(150) NOT NULL, severity_level ENUM('High','Moderate','Low') NOT NULL
);
CREATE TABLE IF NOT EXISTS rx_interaction_medicines (
 id INT AUTO_INCREMENT PRIMARY KEY, rule_id INT NOT NULL, medicine_id INT NOT NULL,
 UNIQUE(rule_id,medicine_id), FOREIGN KEY(rule_id) REFERENCES rx_interaction_rules(id) ON DELETE CASCADE,
 FOREIGN KEY(medicine_id) REFERENCES rx_medicines(id)
);
CREATE TABLE IF NOT EXISTS rx_prescriptions (
 id INT AUTO_INCREMENT PRIMARY KEY, patient_id INT NOT NULL, doctor_id INT NOT NULL,
 prescription_date DATE NOT NULL, notes TEXT, status ENUM('Pending Review','In Filling','Dispensed','Cancelled') NOT NULL DEFAULT 'Pending Review',
 FOREIGN KEY(patient_id) REFERENCES rx_patients(id), FOREIGN KEY(doctor_id) REFERENCES rx_doctors(id)
);
ALTER TABLE rx_prescriptions MODIFY status ENUM('Pending Review','In Filling','Dispensed','Cancelled') NOT NULL DEFAULT 'Pending Review';
CREATE TABLE IF NOT EXISTS rx_prescription_items (
 id INT AUTO_INCREMENT PRIMARY KEY, prescription_id INT NOT NULL, medicine_id INT NOT NULL,
 dosage VARCHAR(150) NOT NULL, frequency VARCHAR(100) NOT NULL, duration_days INT NOT NULL, quantity_prescribed INT NOT NULL,
 CHECK(duration_days>0), CHECK(quantity_prescribed>0),
 FOREIGN KEY(prescription_id) REFERENCES rx_prescriptions(id), FOREIGN KEY(medicine_id) REFERENCES rx_medicines(id)
);
CREATE TABLE IF NOT EXISTS rx_verifications (
 id INT AUTO_INCREMENT PRIMARY KEY, patient_id INT NOT NULL, uploaded_image_url MEDIUMTEXT NOT NULL,
 fulfillment_type ENUM('Pickup','Delivery') NOT NULL, verification_status ENUM('Pending','Verified','Rejected') NOT NULL DEFAULT 'Pending',
 requested_items JSON NOT NULL, reviewer_notes TEXT, prescription_id INT UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(patient_id) REFERENCES rx_patients(id), FOREIGN KEY(prescription_id) REFERENCES rx_prescriptions(id)
);
CREATE TABLE IF NOT EXISTS rx_reservations (
 id INT AUTO_INCREMENT PRIMARY KEY, verification_id INT NOT NULL, batch_id INT NOT NULL, quantity INT NOT NULL,
 CHECK(quantity>0), FOREIGN KEY(verification_id) REFERENCES rx_verifications(id), FOREIGN KEY(batch_id) REFERENCES rx_batches(id),
 UNIQUE(verification_id,batch_id)
);
CREATE TABLE IF NOT EXISTS rx_invoices (
 id INT AUTO_INCREMENT PRIMARY KEY, patient_id INT NOT NULL, pharmacist_id INT NOT NULL, prescription_id INT UNIQUE,
 request_id VARCHAR(80) NOT NULL UNIQUE, invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 subtotal DECIMAL(12,2) NOT NULL, cgst DECIMAL(12,2) NOT NULL, sgst DECIMAL(12,2) NOT NULL,
 net_payable DECIMAL(12,2) NOT NULL, override_reason TEXT,
 FOREIGN KEY(patient_id) REFERENCES rx_patients(id), FOREIGN KEY(pharmacist_id) REFERENCES rx_pharmacists(id),
 FOREIGN KEY(prescription_id) REFERENCES rx_prescriptions(id)
);
CREATE TABLE IF NOT EXISTS rx_invoice_items (
 id INT AUTO_INCREMENT PRIMARY KEY, invoice_id INT NOT NULL, batch_id INT NOT NULL,
 qty_sold INT NOT NULL, unit_price DECIMAL(10,2) NOT NULL, tax_rate DECIMAL(5,2) NOT NULL,
 medicine_name VARCHAR(150) NOT NULL, batch_number VARCHAR(80) NOT NULL, CHECK(qty_sold>0),
 FOREIGN KEY(invoice_id) REFERENCES rx_invoices(id), FOREIGN KEY(batch_id) REFERENCES rx_batches(id)
);
CREATE TABLE IF NOT EXISTS rx_purchase_orders (
 id INT AUTO_INCREMENT PRIMARY KEY, supplier_id INT NOT NULL, pharmacist_id INT NOT NULL,
 order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, status ENUM('Draft','Sent','Received','Cancelled') NOT NULL DEFAULT 'Draft',
 FOREIGN KEY(supplier_id) REFERENCES rx_suppliers(id), FOREIGN KEY(pharmacist_id) REFERENCES rx_pharmacists(id)
);
CREATE TABLE IF NOT EXISTS rx_purchase_order_items (
 id INT AUTO_INCREMENT PRIMARY KEY, po_id INT NOT NULL, medicine_id INT NOT NULL, qty_ordered INT NOT NULL,
 CHECK(qty_ordered>0), FOREIGN KEY(po_id) REFERENCES rx_purchase_orders(id), FOREIGN KEY(medicine_id) REFERENCES rx_medicines(id)
);
CREATE TABLE IF NOT EXISTS rx_refills (
 id INT AUTO_INCREMENT PRIMARY KEY, prescription_item_id INT NOT NULL UNIQUE, next_refill_date DATE NOT NULL,
 frequency_days INT NOT NULL, CHECK(frequency_days>0), FOREIGN KEY(prescription_item_id) REFERENCES rx_prescription_items(id)
);
CREATE TABLE IF NOT EXISTS rx_checkups (
 id INT AUTO_INCREMENT PRIMARY KEY, patient_id INT NOT NULL, prescription_id INT NOT NULL,
 checkup_due_date DATE NOT NULL, status ENUM('Scheduled','Completed','Flagged_No_Response') NOT NULL DEFAULT 'Scheduled', notes TEXT,
 FOREIGN KEY(patient_id) REFERENCES rx_patients(id), FOREIGN KEY(prescription_id) REFERENCES rx_prescriptions(id)
);
CREATE OR REPLACE VIEW View_Patient_Safety_Alerts AS
 SELECT p.id patient_id,m.id medicine_id,'Allergy' reason,a.allergy_name notes,
 CASE WHEN a.severity='Severe' THEN 'CRITICAL' ELSE 'HIGH' END severity
 FROM rx_patients p JOIN rx_allergies a ON a.patient_id=p.id JOIN rx_medicines m ON m.id=a.medicine_id
 UNION ALL SELECT p.id,s.medicine_id,'Sports restriction',s.notes,'CRITICAL'
 FROM rx_patients p JOIN rx_sports_restrictions s ON p.flag_athlete=TRUE
 UNION ALL SELECT i.patient_id,i.medicine_id,i.instruction_type,i.notes,
 CASE WHEN i.instruction_type='Avoid' THEN 'CRITICAL' ELSE 'HIGH' END FROM rx_instructions i;
CREATE OR REPLACE VIEW View_Patient_Overuse_Monitor AS
 SELECT inv.patient_id,b.medicine_id,SUM(ii.qty_sold) qty_last_30_days,l.max_qty_per_30_days,l.risk_level,
 CASE WHEN SUM(ii.qty_sold)>l.max_qty_per_30_days THEN 'FLAGGED'
 WHEN SUM(ii.qty_sold)>=l.max_qty_per_30_days*0.8 THEN 'WARNING' ELSE 'NORMAL' END flag_status
 FROM rx_invoices inv JOIN rx_invoice_items ii ON ii.invoice_id=inv.id JOIN rx_batches b ON b.id=ii.batch_id
 LEFT JOIN rx_dosage_limits l ON l.medicine_id=b.medicine_id
 WHERE inv.invoice_date>=CURRENT_TIMESTAMP-INTERVAL 30 DAY GROUP BY inv.patient_id,b.medicine_id,l.max_qty_per_30_days,l.risk_level;
CREATE OR REPLACE VIEW View_Verification_Stock_Queue AS
 SELECT v.id verification_id,v.patient_id,v.fulfillment_type,v.verification_status,v.created_at,
 j.medicine_id,j.quantity,COALESCE((SELECT SUM(b.stock_qty) FROM rx_batches b WHERE b.medicine_id=j.medicine_id AND b.expiry_date>=CURRENT_DATE),0) unexpired_stock
 FROM rx_verifications v JOIN JSON_TABLE(v.requested_items,'$[*]' COLUMNS(medicine_id INT PATH '$.medicine_id',quantity INT PATH '$.quantity')) j
 WHERE v.verification_status='Pending';
-- Routine definitions are installed by setup.js (or run with a DELIMITER-aware client).
