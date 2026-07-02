const { v4: uuidv4 } = require('uuid');

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid')
}));

describe('cart module', () => {
  let cart;

  beforeEach(() => {
    jest.resetModules();
    cart = require('../src/cart');
  });

  describe('addItem', () => {
    // Scenario: adds a new item to the cart
    it('adds a new item to the cart', () => {
      const product = { id: 'p1', price: 10 };
      const result = cart.addItem(product, 2);

      expect(result).toEqual({ ...product, quantity: 2, cartItemId: 'mocked-uuid' });
      expect(cart.getItems()).toContainEqual(result);
    });

    // Scenario: increments quantity of an existing item
    it('increments quantity of an existing item', () => {
      const product = { id: 'p1', price: 10 };
      cart.addItem(product, 2);
      const result = cart.addItem(product, 3);

      expect(result.quantity).toBe(5);
      expect(cart.getItems()).toHaveLength(1);
    });

    // Scenario: throws error for invalid product
    it('throws error for invalid product', () => {
      expect(() => cart.addItem(null, 1)).toThrow('Invalid product');
      expect(() => cart.addItem({ id: 'p1' }, 1)).toThrow('Invalid product');
      expect(() => cart.addItem({ id: 'p1', price: -10 }, 1)).toThrow('Invalid product');
    });

    // Scenario: throws error for invalid quantity
    it('throws error for invalid quantity', () => {
      const product = { id: 'p1', price: 10 };
      expect(() => cart.addItem(product, 0)).toThrow('Quantity must be a positive integer');
      expect(() => cart.addItem(product, -1)).toThrow('Quantity must be a positive integer');
      expect(() => cart.addItem(product, 1.5)).toThrow('Quantity must be a positive integer');
    });
  });

  describe('removeItem', () => {
    // Scenario: removes an item from the cart
    it('removes an item from the cart', () => {
      const product = { id: 'p1', price: 10 };
      cart.addItem(product, 2);
      const result = cart.removeItem('p1');

      expect(result).toEqual({ ...product, quantity: 2, cartItemId: 'mocked-uuid' });
      expect(cart.getItems()).toHaveLength(0);
    });

    // Scenario: throws error if item not found
    it('throws error if item not found', () => {
      expect(() => cart.removeItem('p1')).toThrow('Item with id p1 not found in cart');
    });
  });

  describe('updateQuantity', () => {
    // Scenario: updates the quantity of an existing item
    it('updates the quantity of an existing item', () => {
      const product = { id: 'p1', price: 10 };
      cart.addItem(product, 2);
      const result = cart.updateQuantity('p1', 5);

      expect(result.quantity).toBe(5);
      expect(cart.getItems()[0].quantity).toBe(5);
    });

    // Scenario: throws error for invalid quantity
    it('throws error for invalid quantity', () => {
      const product = { id: 'p1', price: 10 };
      cart.addItem(product, 2);
      expect(() => cart.updateQuantity('p1', 0)).toThrow('Quantity must be a positive integer');
      expect(() => cart.updateQuantity('p1', -1)).toThrow('Quantity must be a positive integer');
      expect(() => cart.updateQuantity('p1', 1.5)).toThrow('Quantity must be a positive integer');
    });

    // Scenario: throws error if item not found
    it('throws error if item not found', () => {
      expect(() => cart.updateQuantity('p1', 5)).toThrow('Item with id p1 not found in cart');
    });
  });

  describe('getItems', () => {
    // Scenario: returns all items in the cart
    it('returns all items in the cart', () => {
      const product = { id: 'p1', price: 10 };
      cart.addItem(product, 2);

      expect(cart.getItems()).toEqual([{ ...product, quantity: 2, cartItemId: 'mocked-uuid' }]);
    });

    // Scenario: returns an empty array if no items in the cart
    it('returns an empty array if no items in the cart', () => {
      expect(cart.getItems()).toEqual([]);
    });
  });

  describe('getTotal', () => {
    // Scenario: calculates total without discount
    it('calculates total without discount', () => {
      cart.addItem({ id: 'p1', price: 10 }, 2);
      cart.addItem({ id: 'p2', price: 20 }, 1);

      expect(cart.getTotal()).toBe(40);
    });

    // Scenario: calculates total with discount
    it('calculates total with discount', () => {
      cart.addItem({ id: 'p1', price: 10 }, 2);
      cart.addItem({ id: 'p2', price: 20 }, 1);

      expect(cart.getTotal(0.1)).toBe(36);
    });

    // Scenario: throws error for invalid discount rate
    it('throws error for invalid discount rate', () => {
      expect(() => cart.getTotal(-0.1)).toThrow('Discount rate must be a number between 0 and 1');
      expect(() => cart.getTotal(1.1)).toThrow('Discount rate must be a number between 0 and 1');
    });
  });

  describe('applyDiscount', () => {
    // Scenario: applies discount to all items
    it('applies discount to all items', () => {
      cart.addItem({ id: 'p1', price: 10 }, 2);
      cart.addItem({ id: 'p2', price: 20 }, 1);
      cart.applyDiscount(0.1);

      const items = cart.getItems();
      expect(items[0].price).toBe(9);
      expect(items[1].price).toBe(18);
    });

    // Scenario: throws error for invalid discount rate
    it('throws error for invalid discount rate', () => {
      expect(() => cart.applyDiscount(-0.1)).toThrow('Discount rate must be a number between 0 and 1');
      expect(() => cart.applyDiscount(1.1)).toThrow('Discount rate must be a number between 0 and 1');
    });
  });

  describe('getItemCount', () => {
    // Scenario: returns the total quantity of items in the cart
    it('returns the total quantity of items in the cart', () => {
      cart.addItem({ id: 'p1', price: 10 }, 2);
      cart.addItem({ id: 'p2', price: 20 }, 3);

      expect(cart.getItemCount()).toBe(5);
    });

    // Scenario: returns 0 if no items in the cart
    it('returns 0 if no items in the cart', () => {
      expect(cart.getItemCount()).toBe(0);
    });
  });

  describe('clearCart', () => {
    // Scenario: clears all items from the cart
    it('clears all items from the cart', () => {
      cart.addItem({ id: 'p1', price: 10 }, 2);
      cart.addItem({ id: 'p2', price: 20 }, 3);

      const clearedItems = cart.clearCart();

      expect(clearedItems).toHaveLength(2);
      expect(cart.getItems()).toHaveLength(0);
    });

    // Scenario: returns an empty array if cart is already empty
    it('returns an empty array if cart is already empty', () => {
      expect(cart.clearCart()).toEqual([]);
    });
  });
});