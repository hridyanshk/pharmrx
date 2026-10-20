USE remix_pharmrx;
-- Recorded database observations for API changes and rollback.
SELECT e.phase,j.`id`,j.`verification_status`,j.`prescription_id`,j.`batch_id`,j.`quantity`
FROM rx_demo_evidence e LEFT JOIN JSON_TABLE(e.details,'$[*]' COLUMNS (
 `id` VARCHAR(150) PATH '$.id',
 `verification_status` VARCHAR(150) PATH '$.verification_status',
 `prescription_id` VARCHAR(150) PATH '$.prescription_id',
 `batch_id` VARCHAR(150) PATH '$.batch_id',
 `quantity` VARCHAR(150) PATH '$.quantity'
)) j ON TRUE WHERE e.feature='Prescription upload and reservation' ORDER BY e.id;
