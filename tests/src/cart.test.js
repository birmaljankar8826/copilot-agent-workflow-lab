let addItem, removeItem, updateQuantity, getItems, getTotal, applyDiscount, getItemCount, clearCart;

beforeEach(() => {
    jest.resetModules();
    ({ addItem, removeItem, updateQuantity, getItems, getTotal, applyDiscount, getItemCount, clearCart } = require('../../src/cart'));
});

describe('Cart Module', () => {

    describe('addItem', () => {
        it('adds a new item to the cart', () => {
            const product = { id: 'p1', name: 'Apple', price: 1.5 };
            const item = addItem(product, 3);
            expect(item).toMatchObject({ id: 'p1', quantity: 3 });
            expect(getItems()).toHaveLength(1);
        });

        it('increments quantity by the given amount when item already exists', () => {
            const product = { id: 'p1', name: 'Apple', price: 1.5 };
            addItem(product, 2);
            addItem(product, 3);
            expect(getItems()[0].quantity).toBe(5);
        });

        it('throws for an invalid product', () => {
            expect(() => addItem(null)).toThrow('Invalid product');
            expect(() => addItem({ id: 'p1', price: -1 })).toThrow('Invalid product');
        });

        it('throws for invalid quantity', () => {
            expect(() => addItem({ id: 'p1', price: 10 }, 0)).toThrow('Quantity must be a positive number');
            expect(() => addItem({ id: 'p1', price: 10 }, -1)).toThrow('Quantity must be a positive number');
        });
    });

    describe('removeItem', () => {
        it('removes an item and returns it', () => {
            const product = { id: 'p1', name: 'Apple', price: 1.5 };
            addItem(product, 2);
            const removed = removeItem('p1');
            expect(removed).toMatchObject({ id: 'p1' });
            expect(getItems()).toHaveLength(0);
        });

        it('throws when item is not in the cart', () => {
            expect(() => removeItem('nonexistent')).toThrow('Item with id nonexistent not found in cart');
        });
    });

    describe('updateQuantity', () => {
        it('updates the quantity of an existing item', () => {
            addItem({ id: 'p1', name: 'Apple', price: 1.5 }, 1);
            const updated = updateQuantity('p1', 5);
            expect(updated.quantity).toBe(5);
        });

        it('throws for invalid quantity', () => {
            addItem({ id: 'p1', name: 'Apple', price: 1.5 }, 1);
            expect(() => updateQuantity('p1', 0)).toThrow('Quantity must be a positive number');
        });

        it('throws when item is not in the cart', () => {
            expect(() => updateQuantity('nonexistent', 2)).toThrow('Item with id nonexistent not found in cart');
        });
    });

    describe('getItems', () => {
        it('returns a copy of the items array — mutating the result does not affect cart state', () => {
            addItem({ id: 'p1', name: 'Apple', price: 1.5 }, 1);
            const result = getItems();
            result.push({ fake: true });
            expect(getItems()).toHaveLength(1);
        });
    });

    describe('getTotal', () => {
        it('returns the correct subtotal with no discount', () => {
            addItem({ id: 'p1', name: 'Apple', price: 2 }, 3);
            addItem({ id: 'p2', name: 'Banana', price: 1 }, 2);
            expect(getTotal()).toBe(8);
        });

        it('applies a percentage discount correctly', () => {
            addItem({ id: 'p1', name: 'Apple', price: 10 }, 1);
            applyDiscount(0.2);
            expect(getTotal()).toBe(8);
        });
    });

    describe('applyDiscount', () => {
        it('throws for a rate outside 0–1', () => {
            expect(() => applyDiscount(1.5)).toThrow('Discount rate must be a number between 0 and 1');
            expect(() => applyDiscount(-0.1)).toThrow('Discount rate must be a number between 0 and 1');
        });
    });

    describe('getItemCount', () => {
        it('returns the total number of units across all items', () => {
            addItem({ id: 'p1', name: 'Apple', price: 1.5 }, 3);
            addItem({ id: 'p2', name: 'Banana', price: 1 }, 2);
            expect(getItemCount()).toBe(5);
        });
    });

    describe('clearCart', () => {
        it('removes all items from the cart', () => {
            addItem({ id: 'p1', name: 'Apple', price: 1.5 }, 2);
            clearCart();
            expect(getItems()).toHaveLength(0);
        });

        it('resets the discount so future totals are not discounted', () => {
            addItem({ id: 'p1', name: 'Apple', price: 10 }, 1);
            applyDiscount(0.5);
            clearCart();
            addItem({ id: 'p1', name: 'Apple', price: 10 }, 1);
            expect(getTotal()).toBe(10);
        });
    });

});
