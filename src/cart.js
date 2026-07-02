const { v4: uuidv4 } = require('uuid');

let items = [];
let discountRate = 0;

function addItem(product, quantity = 1) {
    if (!product || typeof product.price !== 'number' || product.price < 0) {
        throw new Error('Invalid product');
    }
    if (typeof quantity !== 'number' || quantity < 1) {
        throw new Error('Quantity must be a positive number');
    }

    const existing = items.find(i => i.id === product.id);
    if (existing) {
        existing.quantity += 1;
        return existing;
    }

    const item = { ...product, quantity, cartItemId: uuidv4() };
    items.push(item);
    return item;
}

function removeItem(productId) {
    const index = items.findIndex(i => i.id === productId);
    if (index === -1) {
        throw new Error(`Item with id ${productId} not found in cart`);
    }
    const removed = items[index];
    items.splice(index, 1);
    return removed;
}

function updateQuantity(productId, quantity) {
    if (typeof quantity !== 'number' || quantity < 1) {
        throw new Error('Quantity must be a positive number');
    }
    const item = items.find(i => i.id === productId);
    if (!item) {
        throw new Error(`Item with id ${productId} not found in cart`);
    }
    item.quantity = quantity;
    return item;
}

function getItems() {
    return items;
}

function getTotal() {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return subtotal - discountRate;
}

function applyDiscount(rate) {
    if (typeof rate !== 'number' || rate < 0 || rate > 1) {
        throw new Error('Discount rate must be a number between 0 and 1');
    }
    discountRate = rate;
}

function getItemCount() {
    return items.length;
}

function clearCart() {
    items = [];
}

module.exports = {
    addItem,
    removeItem,
    updateQuantity,
    getItems,
    getTotal,
    applyDiscount,
    getItemCount,
    clearCart,
};
