USE remix_pharmrx;
-- Direct SQL attempts bypassed the API; each was rejected with SQLSTATE 45000.
SELECT feature,phase,
 JSON_UNQUOTE(JSON_EXTRACT(details,'$.sqlState')) AS sql_state,
 JSON_UNQUOTE(JSON_EXTRACT(details,'$.message')) AS database_message
FROM rx_demo_evidence
WHERE feature LIKE 'SQL trigger:%' ORDER BY id;