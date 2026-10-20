USE remix_pharmrx;
-- Recorded database observations for API changes and rollback.
SELECT e.phase,j.`id`,j.`status`,j.`stock`,j.`stock_qty`,j.`invoice_id`,j.`net_payable`
FROM rx_demo_evidence e LEFT JOIN JSON_TABLE(e.details,'$[*]' COLUMNS (
 `id` VARCHAR(150) PATH '$.id',
 `status` VARCHAR(150) PATH '$.status',
 `stock` VARCHAR(150) PATH '$.stock',
 `stock_qty` VARCHAR(150) PATH '$.stock_qty',
 `invoice_id` VARCHAR(150) PATH '$.invoice_id',
 `net_payable` VARCHAR(150) PATH '$.net_payable'
)) j ON TRUE WHERE e.feature='Dispense RX-619' ORDER BY e.id;
