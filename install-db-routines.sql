-- Run with the original administrator connection in MySQL Workbench.
-- Affects only remix_pharmrx. No records are deleted.
USE remix_pharmrx;
DELIMITER $$
DROP TRIGGER IF EXISTS Before_Invoice_Item_Insert_Check_Athlete$$
CREATE TRIGGER Before_Invoice_Item_Insert_Check_Athlete BEFORE INSERT ON rx_invoice_items FOR EACH ROW
BEGIN
 IF EXISTS(SELECT 1 FROM rx_invoices i JOIN rx_patients p ON p.id=i.patient_id
 JOIN rx_batches b ON b.id=NEW.batch_id JOIN rx_sports_restrictions s ON s.medicine_id=b.medicine_id
 WHERE i.id=NEW.invoice_id AND p.flag_athlete=TRUE)
 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Configured sports restriction: dispensing blocked for athlete'; END IF;
END$$
DROP PROCEDURE IF EXISTS Schedule_Followup_Checkup$$
CREATE PROCEDURE Schedule_Followup_Checkup(IN p_patient_id INT,IN p_prescription_id INT,IN p_days_after INT)
BEGIN
 IF p_days_after<1 OR p_days_after>365 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Follow-up days must be between 1 and 365'; END IF;
 INSERT INTO rx_checkups(patient_id,prescription_id,checkup_due_date)
 VALUES(p_patient_id,p_prescription_id,DATE_ADD(CURRENT_DATE,INTERVAL p_days_after DAY));
END$$
DELIMITER ;
SELECT 'PharmRx routines installed' AS result;
