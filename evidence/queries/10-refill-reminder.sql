USE remix_pharmrx;
-- Recorded database observations for API changes and rollback.
SELECT e.phase,j.`id`,j.`prescription_item_id`,j.`next_refill_date`,j.`frequency_days`
FROM rx_demo_evidence e LEFT JOIN JSON_TABLE(e.details,'$[*]' COLUMNS (
 `id` VARCHAR(150) PATH '$.id',
 `prescription_item_id` VARCHAR(150) PATH '$.prescription_item_id',
 `next_refill_date` VARCHAR(150) PATH '$.next_refill_date',
 `frequency_days` VARCHAR(150) PATH '$.frequency_days'
)) j ON TRUE WHERE e.feature='Refill reminder' ORDER BY e.id;
