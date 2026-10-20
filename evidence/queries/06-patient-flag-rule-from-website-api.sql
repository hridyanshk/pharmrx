USE remix_pharmrx;
-- Recorded database observations for API changes and rollback.
SELECT e.phase,j.`rule_name`,j.`patient_flag`,j.`severity`
FROM rx_demo_evidence e LEFT JOIN JSON_TABLE(e.details,'$[*]' COLUMNS (
 `rule_name` VARCHAR(150) PATH '$.rule_name',
 `patient_flag` VARCHAR(150) PATH '$.patient_flag',
 `severity` VARCHAR(150) PATH '$.severity'
)) j ON TRUE WHERE e.feature='Patient flag rule from website API' ORDER BY e.id;
