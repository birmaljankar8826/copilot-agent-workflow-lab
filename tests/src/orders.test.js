const { getOrders, getOrderById, createOrder, updateOrder, deleteOrder, getAverageOrderTotal, getOrdersByStatus, applyDiscount } = require('../../src/orders');

let ordersModule;

beforeEach(() => {
  jest.resetModules();
  ordersModule = require('../../src/orders');
});

describe('Orders Module', () => {
  // Scenario: getOrders returns an empty array when no orders exist
  it('should return an empty array when no orders exist', () => {
    expect(ordersModule.getOrders()).toEqual([]);
  });

  // Scenario: getOrderById returns null for non-existent ID
  it('should return null for non-existent ID', () => {
    expect(ordersModule.getOrderById('non-existent-id')).toBeNull();
  });

  // Scenario: createOrder adds a valid order
  it('should add a valid order', () => {
    const order = { id: '1', items: [{ price: 10 }, { price: 20 }] };
    const createdOrder = ordersModule.createOrder(order);
    expect(createdOrder).toEqual({ ...order, total: 30 });
    expect(ordersModule.getOrders()).toEqual([{ ...order, total: 30 }]);
  });

  // Scenario: createOrder throws error for invalid order
  it('should throw an error for invalid order', () => {
    const invalidOrder = { id: '1', items: [{ price: 'invalid' }] };
    expect(() => ordersModule.createOrder(invalidOrder)).toThrow('Invalid order: items must be an array of objects with a price property');
  });

  // Scenario: createOrder throws error for duplicate order ID
  it('should throw an error for duplicate order ID', () => {
    const order = { id: '1', items: [{ price: 10 }] };
    ordersModule.createOrder(order);
    expect(() => ordersModule.createOrder(order)).toThrow('Order with the same ID already exists');
  });

  // Scenario: updateOrder updates an existing order
  it('should update an existing order', () => {
    const order = { id: '1', items: [{ price: 10 }] };
    ordersModule.createOrder(order);
    const updatedOrder = ordersModule.updateOrder('1', { status: 'shipped' });
    expect(updatedOrder.status).toBe('shipped');
  });

  // Scenario: updateOrder returns null for non-existent order
  it('should return null for non-existent order', () => {
    expect(ordersModule.updateOrder('non-existent-id', { status: 'shipped' })).toBeNull();
  });

  // Scenario: deleteOrder removes an existing order
  it('should remove an existing order', () => {
    const order = { id: '1', items: [{ price: 10 }] };
    ordersModule.createOrder(order);
    const deletedOrder = ordersModule.deleteOrder('1');
    expect(deletedOrder).toEqual({ ...order, total: 10 });
    expect(ordersModule.getOrders()).toEqual([]);
  });

  // Scenario: deleteOrder returns null for non-existent order
  it('should return null for non-existent order', () => {
    expect(ordersModule.deleteOrder('non-existent-id')).toBeNull();
  });

  // Scenario: getAverageOrderTotal returns 0 when no orders exist
  it('should return 0 when no orders exist', () => {
    expect(ordersModule.getAverageOrderTotal()).toBe(0);
  });

  // Scenario: getAverageOrderTotal calculates the average total of orders
  it('should calculate the average total of orders', () => {
    ordersModule.createOrder({ id: '1', items: [{ price: 10 }] });
    ordersModule.createOrder({ id: '2', items: [{ price: 20 }] });
    expect(ordersModule.getAverageOrderTotal()).toBe(15);
  });

  // Scenario: getOrdersByStatus filters orders by status
  it('should filter orders by status', () => {
    ordersModule.createOrder({ id: '1', items: [{ price: 10 }], status: 'shipped' });
    ordersModule.createOrder({ id: '2', items: [{ price: 20 }], status: 'pending' });
    expect(ordersModule.getOrdersByStatus('shipped')).toEqual([
      { id: '1', items: [{ price: 10 }], status: 'shipped', total: 10 }
    ]);
  });

  // Scenario: applyDiscount applies a valid discount
  it('should apply a valid discount', () => {
    const order = { id: '1', items: [{ price: 100 }] };
    ordersModule.createOrder(order);
    const updatedOrder = ordersModule.applyDiscount('1', '20');
    expect(updatedOrder.total).toBe(80);
  });

  // Scenario: applyDiscount throws error for invalid discount expression
  it('should throw an error for invalid discount expression', () => {
    const order = { id: '1', items: [{ price: 100 }] };
    ordersModule.createOrder(order);
    expect(() => ordersModule.applyDiscount('1', 'invalid')).toThrow('Invalid discount expression');
  });

  // Scenario: applyDiscount throws error when discount exceeds total
  it('should throw an error when discount exceeds total', () => {
    const order = { id: '1', items: [{ price: 100 }] };
    ordersModule.createOrder(order);
    expect(() => ordersModule.applyDiscount('1', '200')).toThrow('Discount cannot exceed the order total');
  });

  // Scenario: applyDiscount returns null for non-existent order ID
  it('should return null for non-existent order ID', () => {
    expect(ordersModule.applyDiscount('non-existent-id', '20')).toBeNull();
  });
});