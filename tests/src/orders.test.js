const path = require('path');

let getOrders, getOrderById, createOrder, updateOrder, deleteOrder, getAverageOrderTotal, getOrdersByStatus, applyDiscount;

beforeEach(() => {
  jest.resetModules();
  ({ getOrders, getOrderById, createOrder, updateOrder, deleteOrder, getAverageOrderTotal, getOrdersByStatus, applyDiscount } = require(path.resolve(__dirname, '../../src/orders')));
});

describe('Orders Module', () => {
  // Scenario: getOrders returns the internal orders array
  it('should return the internal orders array', () => {
    const result = getOrders();
    expect(result).toEqual([]);
  });

  // Scenario: getOrderById returns undefined for invalid id
  it('should return undefined for invalid id', () => {
    const result = getOrderById('nonexistent-id');
    expect(result).toBeUndefined();
  });

  // Scenario: createOrder adds a valid order and calculates total
  it('should add a valid order and calculate total', () => {
    const order = { id: '1', userId: 'user1', items: [{ price: 10 }, { price: 20 }] };
    const result = createOrder(order);
    expect(result).toEqual(order);
    expect(getOrders()).toHaveLength(1);
    expect(getOrders()[0].total).toBe(30);
  });

  // Scenario: createOrder throws TypeError for missing items
  it('should throw TypeError for missing items', () => {
    const order = { id: '1', userId: 'user1' };
    expect(() => createOrder(order)).toThrow(TypeError);
  });

  // Scenario: updateOrder updates an existing order
  it('should update an existing order', () => {
    const order = { id: '1', userId: 'user1', items: [{ price: 10 }] };
    createOrder(order);
    const updates = { status: 'shipped' };
    const result = updateOrder('1', updates);
    expect(result).toEqual({ ...order, total: 10, status: 'shipped' });
  });

  // Scenario: updateOrder returns null for non-existent id
  it('should return null for non-existent id', () => {
    const result = updateOrder('nonexistent-id', { status: 'shipped' });
    expect(result).toBeNull();
  });

  // Scenario: deleteOrder removes an order by id
  it('should remove an order by id', () => {
    const order = { id: '1', userId: 'user1', items: [{ price: 10 }] };
    createOrder(order);
    const result = deleteOrder('1');
    expect(result).toBe(true);
    expect(getOrders()).toHaveLength(0);
  });

  // Scenario: deleteOrder returns false for non-existent id
  it('should return false for non-existent id', () => {
    const result = deleteOrder('nonexistent-id');
    expect(result).toBe(false);
  });

  // Scenario: getAverageOrderTotal calculates the average total
  it('should calculate the average total', () => {
    createOrder({ id: '1', userId: 'user1', items: [{ price: 10 }] });
    createOrder({ id: '2', userId: 'user2', items: [{ price: 20 }] });
    const result = getAverageOrderTotal();
    expect(result).toBe(15);
  });

  // Scenario: getAverageOrderTotal handles empty orders array
  it('should return NaN when orders array is empty', () => {
    const result = getAverageOrderTotal();
    expect(result).toBeNaN();
  });

  // Scenario: getOrdersByStatus filters orders by status
  it('should filter orders by status', () => {
    createOrder({ id: '1', userId: 'user1', items: [{ price: 10 }], status: 'pending' });
    createOrder({ id: '2', userId: 'user2', items: [{ price: 20 }], status: 'shipped' });
    const result = getOrdersByStatus('pending');
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('pending');
  });

  // Scenario: applyDiscount applies a discount to an order
  it('should apply a discount to an order', () => {
    createOrder({ id: '1', userId: 'user1', items: [{ price: 100 }] });
    const result = applyDiscount('1', '10');
    expect(result.total).toBe(90);
  });

  // Scenario: applyDiscount returns null for non-existent order
  it('should return null for non-existent order', () => {
    const result = applyDiscount('nonexistent-id', '10');
    expect(result).toBeNull();
  });

  // Scenario: applyDiscount handles invalid discount expression
  it('should throw an error for invalid discount expression', () => {
    createOrder({ id: '1', userId: 'user1', items: [{ price: 100 }] });
    expect(() => applyDiscount('1', 'invalid')).toThrow();
  });
});