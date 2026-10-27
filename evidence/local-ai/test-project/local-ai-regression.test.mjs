import test from 'node:test';
import assert from 'node:assert/strict';
import { available } from './frontend/src/workspace-data.mjs';

test('available stock subtracts reserved stock', () => {
  assert.equal(available({stock_qty: 10, reserved_qty: 3}), 7);
  assert.equal(available({stock_qty: 4, reserved_qty: 4}), 0);
  assert.equal(available({stock_qty: 2}), 2);
});
