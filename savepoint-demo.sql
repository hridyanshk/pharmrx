-- Run the entire example in one Workbench connection.
-- This demo intentionally rolls back its stock change.
USE remix_pharmrx;
START TRANSACTION;
SET @demo_batch = (SELECT MIN(id) FROM rx_batches);
SELECT id, batch_number, stock_qty AS before_quantity FROM rx_batches WHERE id=@demo_batch;
SAVEPOINT before_demo_change;
UPDATE rx_batches SET stock_qty=stock_qty+5 WHERE id=@demo_batch;
SELECT id, batch_number, stock_qty AS after_quantity FROM rx_batches WHERE id=@demo_batch;
ROLLBACK TO SAVEPOINT before_demo_change;
SELECT id, batch_number, stock_qty AS restored_quantity FROM rx_batches WHERE id=@demo_batch;
ROLLBACK;
-- COMMIT ends native savepoints. Use website Checkpoints across requests / sessions.
