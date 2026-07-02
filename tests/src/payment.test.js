const { v4: uuidv4 } = require('uuid');
const { processPayment, refundPayment, getPayment, getTotalCollected } = require('../../src/payment');

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid')
}));

describe('Payment Module', () => {
  let payments;

  beforeEach(() => {
    jest.resetModules();
    ({ processPayment, refundPayment, getPayment, getTotalCollected } = require('../../src/payment'));
    payments = require('../../src/payment').payments;
    payments.length = 0; // Clear the in-memory payments array
  });

  describe('processPayment', () => {
    // Scenario: processes a valid payment
    it('processes a valid payment', () => {
      const payment = { amount: 100, method: 'card' };
      const result = processPayment(payment);

      expect(result).toEqual({
        ...payment,
        id: 'PAY-mocked-uuid',
        status: 'completed'
      });
      expect(payments).toContainEqual(result);
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
    // Scenario: refunds a valid payment
    it('refunds a valid payment', () => {
      const payment = { amount: 100, method: 'card' };
      const processedPayment = processPayment(payment);
      const result = refundPayment(processedPayment.id);

      expect(result).toEqual({ ...processedPayment, status: 'refunded' });
      expect(payments).toContainEqual(result);
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
      const payment = { amount: 100, method: 'card' };
      const processedPayment = processPayment(payment);
      refundPayment(processedPayment.id);

      expect(() => refundPayment(processedPayment.id)).toThrow(`Payment ${processedPayment.id} already refunded`);
    });
  });

  describe('getPayment', () => {
    // Scenario: retrieves a valid payment by ID
    it('retrieves a valid payment by ID', () => {
      const payment = { amount: 100, method: 'card' };
      const processedPayment = processPayment(payment);
      const result = getPayment(processedPayment.id);

      expect(result).toEqual(processedPayment);
    });

    // Scenario: throws error if payment not found
    it('throws an error if payment is not found', () => {
      expect(() => getPayment('non-existent-id')).toThrow('Payment non-existent-id not found');
    });
  });

  describe('getTotalCollected', () => {
    // Scenario: calculates total collected for completed payments
    it('calculates total collected for completed payments', () => {
      processPayment({ amount: 100, method: 'card' });
      processPayment({ amount: 200, method: 'cash' });
      processPayment({ amount: 50, method: 'online' });
      refundPayment('PAY-mocked-uuid'); // Refund one payment

      const total = getTotalCollected();
      expect(total).toBe(250); // Only the non-refunded payments are counted
    });

    // Scenario: returns 0 if no completed payments exist
    it('returns 0 if no completed payments exist', () => {
      expect(getTotalCollected()).toBe(0);
    });

    // Scenario: ignores invalid or refunded payments
    it('ignores invalid or refunded payments', () => {
      processPayment({ amount: 100, method: 'card' });
      const refundedPayment = processPayment({ amount: 200, method: 'cash' });
      refundPayment(refundedPayment.id);
      processPayment({ amount: -50, method: 'online' }); // Invalid payment

      const total = getTotalCollected();
      expect(total).toBe(100); // Only the valid, non-refunded payment is counted
    });
  });
});