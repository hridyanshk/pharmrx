USE remix_pharmrx;
-- Recorded database observations for API changes and rollback.
SELECT e.phase,j.`id`,j.`batch_number`,j.`stock_qty`
FROM rx_demo_evidence e LEFT JOIN JSON_TABLE(e.details,'$[*]' COLUMNS (
 `id` VARCHAR(150) PATH '$.id',
 `batch_number` VARCHAR(150) PATH '$.batch_number',
 `stock_qty` VARCHAR(150) PATH '$.stock_qty'
)) j ON TRUE WHERE e.feature='Purchase order receipt' ORDER BY e.id;
