import test from 'node:test';
import assert from 'node:assert/strict';
import { TourSystem } from '../src/ui/tours.js';

test('tour menu entries include readable descriptions', () => {
  const tours = new TourSystem({}).tours;

  assert.equal(tours.length, 3);
  for (const tour of tours) {
    assert.ok(tour.title);
    assert.ok(tour.description);
  }
});
