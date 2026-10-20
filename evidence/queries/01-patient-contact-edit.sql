USE remix_pharmrx;
-- Recorded database observations for API changes and rollback.
SELECT e.phase,j.`id`,j.`name`,j.`phone`
FROM rx_demo_evidence e LEFT JOIN JSON_TABLE(e.details,'$[*]' COLUMNS (
 `id` VARCHAR(150) PATH '$.id',
 `name` VARCHAR(150) PATH '$.name',
 `phone` VARCHAR(150) PATH '$.phone'
)) j ON TRUE WHERE e.feature='Patient contact edit' ORDER BY e.id;
