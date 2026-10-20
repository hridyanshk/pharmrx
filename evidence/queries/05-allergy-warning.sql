USE remix_pharmrx;
-- Recorded database observations for API changes and rollback.
SELECT e.phase,j.`patient_id`,j.`medicine_id`,j.`severity`
FROM rx_demo_evidence e LEFT JOIN JSON_TABLE(e.details,'$[*]' COLUMNS (
 `patient_id` VARCHAR(150) PATH '$.patient_id',
 `medicine_id` VARCHAR(150) PATH '$.medicine_id',
 `severity` VARCHAR(150) PATH '$.severity'
)) j ON TRUE WHERE e.feature='Allergy warning' ORDER BY e.id;
