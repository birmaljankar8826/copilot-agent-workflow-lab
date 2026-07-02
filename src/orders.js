const orders = [];

function getOrders() {
    return [...orders];
}

function getOrderById(id) {
    const order = orders.find(o => o.id === id);
    return order || null;
}

function createOrder(order) {
    if (!order.items || !Array.isArray(order.items) || !order.items.every(item => item && typeof item.price === 'number')) {
        throw new Error('Invalid order: items must be an array of objects with a price property');
    }
    if (orders.some(o => o.id === order.id)) {
        throw new Error('Order with the same ID already exists');
    }
    const total = order.items.reduce((sum, item) => sum + item.price, 0);
    const newOrder = { ...order, total };
    orders.push(newOrder);
    return newOrder;
}

function updateOrder(id, updates) {
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) {
        return null;
    }
    const safeUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key]) => key !== 'id' && key !== 'createdAt')
    );
    orders[index] = { ...orders[index], ...safeUpdates };
    return orders[index];
}

function deleteOrder(id) {
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) {
        return null;
    }
    const deletedOrder = orders.splice(index, 1)[0];
    return deletedOrder || null;
}

function getAverageOrderTotal() {
    if (orders.length === 0) {
        return 0;
    }
    const total = orders.reduce((sum, o) => sum + o.total, 0);
    return total / orders.length;
}

function getOrdersByStatus(status) {
    return orders.filter(o => o.status === status);
}

function applyDiscount(orderId, discountExpression) {
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;
    const discount = parseFloat(discountExpression);
    if (isNaN(discount) || discount < 0) {
        throw new Error('Invalid discount expression');
    }
    if (discount > orders[index].total) {
        throw new Error('Discount cannot exceed the order total');
    }
    orders[index].total = orders[index].total - discount;
    return orders[index];
}

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    getAverageOrderTotal,
    getOrdersByStatus,
    applyDiscount,
};
