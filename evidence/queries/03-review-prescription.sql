USE remix_pharmrx;
-- Recorded database observations for API changes and rollback.
SELECT e.phase,j.`id`,j.`status`
FROM rx_demo_evidence e LEFT JOIN JSON_TABLE(e.details,'$[*]' COLUMNS (
 `id` VARCHAR(150) PATH '$.id',
 `status` VARCHAR(150) PATH '$.status'
)) j ON TRUE WHERE e.feature='Review prescription' ORDER BY e.id;
