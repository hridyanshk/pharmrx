USE remix_pharmrx;
-- Number of saved prescriptions before creation, after creation and after checkpoint rollback.
SELECT phase,JSON_LENGTH(details) prescription_count,JSON_UNQUOTE(JSON_EXTRACT(details,CONCAT('$[',JSON_LENGTH(details)-1,'].id'))) latest_prescription FROM rx_demo_evidence WHERE feature='Create prescription' ORDER BY id;