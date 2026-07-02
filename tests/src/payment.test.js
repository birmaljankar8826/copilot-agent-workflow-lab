let processPayment, refundPayment, getPayment, getTotalCollected;

beforeEach(() => {
  jest.resetModules();
  jest.mock('uuid', () => {
    let count = 0;
    return { v4: jest.fn(() => 'uuid-' + (++count)) };
  });
  ({ processPayment, refundPayment, getPayment, getTotalCollected } = require('../../src/payment'));
});

describe('processPayment', () => {
  // Scenario: processes a valid payment and returns a completed record
  it('processes a valid payment and returns a completed record', () => {
    const result = processPayment({ amount: 100, method: 'card' });
    expect(result.amount).toBe(100);
    expect(result.method).toBe('card');
    expect(result.status).toBe('completed');
    expect(result.id).toMatch(/^PAY-/);
  });

  // Scenario: throws error for invalid amount
  it('throws an error if amount is not a positive number', () => {
    expect(() => processPayment({ amount: -10, method: 'card' })).toThrow('Invalid payment: amount must be a positive number');
    expect(() => processPayment({ amount: 0, method: 'card' })).toThrow('Invalid payment: amount must be a positive number');
    expect(() => processPayment({ method: 'card' })).toThrow('Invalid payment: amount must be a positive number');
  });

  // Scenario: throws error for invalid payment method
  it('throws an error if method is not card, cash, or online', () => {
    expect(() => processPayment({ amount: 100, method: 'check' })).toThrow('Invalid payment: method must be card, cash, or online');
    expect(() => processPayment({ amount: 100 })).toThrow('Invalid payment: method must be card, cash, or online');
  });
});

describe('refundPayment', () => {
  // Scenario: refunds a valid payment and returns updated record
  it('refunds a valid payment and returns the updated record', () => {
    const processed = processPayment({ amount: 100, method: 'card' });
    const result = refundPayment(processed.id);
    expect(result.id).toBe(processed.id);
    expect(result.status).toBe('refunded');
  });

  // Scenario: throws error for invalid id
  it('throws an error if id is invalid', () => {
    expect(() => refundPayment(null)).toThrow('Invalid id: id must be a valid string');
    expect(() => refundPayment(123)).toThrow('Invalid id: id must be a valid string');
  });

  // Scenario: throws error if payment not found
  it('throws an error if payment is not found', () => {
    expect(() => refundPayment('non-existent-id')).toThrow('Payment non-existent-id not found');
  });

  // Scenario: throws error if payment is already refunded
  it('throws an error if payment is already refunded', () => {
    const processed = processPayment({ amount: 100, method: 'card' });
    refundPayment(processed.id);
    expect(() => refundPayment(processed.id)).toThrow('already refunded');
  });
});

describe('getPayment', () => {
  // Scenario: retrieves a payment by id
  it('retrieves a valid payment by id', () => {
    const processed = processPayment({ amount: 100, method: 'card' });
    const result = getPayment(processed.id);
    expect(result).toEqual(processed);
  });

  // Scenario: throws error if payment not found
  it('throws an error if payment is not found', () => {
    expect(() => getPayment('non-existent-id')).toThrow('Payment non-existent-id not found');
  });
});

describe('getTotalCollected', () => {
  // Scenario: sums only completed payments
  it('returns the total of all completed payments', () => {
    processPayment({ amount: 100, method: 'card' });
    processPayment({ amount: 200, method: 'cash' });
    expect(getTotalCollected()).toBe(300);
  });

  // Scenario: excludes refunded payments from total
  it('excludes refunded payments from the total', () => {
    processPayment({ amount: 100, method: 'card' });
    const p2 = processPayment({ amount: 200, method: 'cash' });
    refundPayment(p2.id);
    expect(getTotalCollected()).toBe(100);
  });

  // Scenario: returns 0 when no payments exist
  it('returns 0 if no payments exist', () => {
    expect(getTotalCollected()).toBe(0);
  });
});
