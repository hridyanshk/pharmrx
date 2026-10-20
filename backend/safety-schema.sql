CREATE TABLE IF NOT EXISTS rx_medicine_profiles (
 medicine_id INT PRIMARY KEY, strength_mg DECIMAL(10,2) NOT NULL,
 max_single_mg DECIMAL(10,2) NULL, max_daily_mg DECIMAL(10,2) NULL,
 side_effects TEXT NOT NULL, cautions TEXT NOT NULL, source_url VARCHAR(500) NOT NULL,
 reviewed_on DATE NOT NULL, FOREIGN KEY(medicine_id) REFERENCES rx_medicines(id),
 CHECK(strength_mg>0 AND max_single_mg>0 AND max_daily_mg>=max_single_mg)
);
CREATE TABLE IF NOT EXISTS rx_flag_rules (
 id INT AUTO_INCREMENT PRIMARY KEY, rule_name VARCHAR(150) NOT NULL,
 medicine_id INT NOT NULL, patient_flag ENUM('flag_athlete','flag_elderly_care','flag_high_risk_addiction') NOT NULL,
 severity ENUM('CRITICAL','HIGH') NOT NULL, notes TEXT NOT NULL, enabled BOOLEAN NOT NULL DEFAULT TRUE,
 FOREIGN KEY(medicine_id) REFERENCES rx_medicines(id)
);
CREATE TABLE IF NOT EXISTS rx_checkpoints (
 id BIGINT AUTO_INCREMENT PRIMARY KEY, label VARCHAR(150) NOT NULL, actor_id INT NOT NULL,
 reason VARCHAR(40) NOT NULL, state JSON NOT NULL, action_id BIGINT NOT NULL DEFAULT 0,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, restored_at TIMESTAMP NULL
);
