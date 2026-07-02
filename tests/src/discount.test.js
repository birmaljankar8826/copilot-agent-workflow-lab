const { addDiscount, applyDiscount, getDiscount, removeDiscount } = require('../../src/discount');

// Reset module state before each test
let discounts;
beforeEach(() => {
  jest.resetModules();
  ({ addDiscount, applyDiscount, getDiscount, removeDiscount } = require('../../src/discount'));
  discounts = require('../../src/discount').__get__('discounts');
  discounts.length = 0; // Clear the in-memory state
});

describe('addDiscount', () => {
  // Scenario: successfully adds a valid discount
  it('adds a valid discount and returns the sanitized discount object', () => {
    const discount = { code: 'SUMMER', rate: 0.2, extraField: 'ignored' };
    const result = addDiscount(discount);
    expect(result).toEqual({ code: 'SUMMER', rate: 0.2 });
    expect(discounts).toContainEqual({ code: 'SUMMER', rate: 0.2 });
  });

  // Scenario: throws error for invalid discount object
  it('throws an error if discount object is invalid', () => {
    expect(() => addDiscount(null)).toThrow('Invalid discount: must have code (string) and rate (number)');
    expect(() => addDiscount({ code: 'SUMMER' })).toThrow('Invalid discount: must have code (string) and rate (number)');
    expect(() => addDiscount({ code: 'SUMMER', rate: 'not-a-number' })).toThrow('Invalid discount: must have code (string) and rate (number)');
  });

  // Scenario: throws error for invalid discount rate
  it('throws an error if discount rate is not between 0 and 1', () => {
    expect(() => addDiscount({ code: 'SUMMER', rate: -0.1 })).toThrow('Discount rate must be between 0 and 1');
    expect(() => addDiscount({ code: 'SUMMER', rate: 1.1 })).toThrow('Discount rate must be between 0 and 1');
  });

  // Scenario: throws error for duplicate discount code
  it('throws an error if discount code already exists', () => {
    addDiscount({ code: 'SUMMER', rate: 0.2 });
    expect(() => addDiscount({ code: 'SUMMER', rate: 0.3 })).toThrow('Discount code SUMMER already exists');
  });
});

describe('applyDiscount', () => {
  // Scenario: successfully applies a valid discount
  it('applies a valid discount and returns the discounted price', () => {
    addDiscount({ code: 'SUMMER', rate: 0.2 });
    const result = applyDiscount('SUMMER', 100);
    expect(result).toBe(80);
  });

  // Scenario: returns 0 if discounted price is less than 0
  it('returns 0 if the discounted price is less than 0', () => {
    addDiscount({ code: 'SUMMER', rate: 1 });
    const result = applyDiscount('SUMMER', 50);
    expect(result).toBe(0);
  });

  // Scenario: throws error for invalid discount code
  it('throws an error if discount code is invalid', () => {
    expect(() => applyDiscount('', 100)).toThrow('Invalid discount code');
    expect(() => applyDiscount(null, 100)).toThrow('Invalid discount code');
  });

  // Scenario: throws error for invalid price
  it('throws an error if price is invalid', () => {
    addDiscount({ code: 'SUMMER', rate: 0.2 });
    expect(() => applyDiscount('SUMMER', -10)).toThrow('Price must be a non-negative number');
    expect(() => applyDiscount('SUMMER', 'not-a-number')).toThrow('Price must be a non-negative number');
  });

  // Scenario: throws error if discount code is not found
  it('throws an error if discount code is not found', () => {
    expect(() => applyDiscount('WINTER', 100)).toThrow('Discount code WINTER not found');
  });
});

describe('getDiscount', () => {
  // Scenario: successfully retrieves an existing discount
  it('returns the discount object for a valid code', () => {
    addDiscount({ code: 'SUMMER', rate: 0.2 });
    const result = getDiscount('SUMMER');
    expect(result).toEqual({ code: 'SUMMER', rate: 0.2 });
  });

  // Scenario: returns null for a non-existent discount code
  it('returns null if the discount code does not exist', () => {
    const result = getDiscount('WINTER');
    expect(result).toBeNull();
  });
});

describe('removeDiscount', () => {
  // Scenario: successfully removes an existing discount
  it('removes the discount and returns the removed discount object', () => {
    addDiscount({ code: 'SUMMER', rate: 0.2 });
    const result = removeDiscount('SUMMER');
    expect(result).toEqual({ code: 'SUMMER', rate: 0.2 });
    expect(discounts).not.toContainEqual({ code: 'SUMMER', rate: 0.2 });
  });

  // Scenario: throws error for invalid discount code
  it('throws an error if discount code is invalid', () => {
    expect(() => removeDiscount('')).toThrow('Invalid discount code');
    expect(() => removeDiscount(null)).toThrow('Invalid discount code');
  });

  // Scenario: throws error if discount code is not found
  it('throws an error if discount code is not found', () => {
    expect(() => removeDiscount('WINTER')).toThrow('Discount code WINTER not found');
  });
});