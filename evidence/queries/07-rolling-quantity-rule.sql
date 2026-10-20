USE remix_pharmrx;
-- Recorded database observations for API changes and rollback.
SELECT e.phase,j.`medicine_id`,j.`max_qty_per_30_days`,j.`risk_level`
FROM rx_demo_evidence e LEFT JOIN JSON_TABLE(e.details,'$[*]' COLUMNS (
 `medicine_id` VARCHAR(150) PATH '$.medicine_id',
 `max_qty_per_30_days` VARCHAR(150) PATH '$.max_qty_per_30_days',
 `risk_level` VARCHAR(150) PATH '$.risk_level'
)) j ON TRUE WHERE e.feature='Rolling quantity rule' ORDER BY e.id;
