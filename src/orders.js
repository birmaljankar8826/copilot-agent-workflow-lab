const orders = [];

function getOrders() {
    return orders;
}

function getOrderById(id) {
    return orders.find(o => o.id === id);
}

function createOrder(order) {
    if (!order.items || !Array.isArray(order.items) || !order.items.every(item => item && typeof item.price === 'number')) {
        throw new Error('Invalid order: items must be an array of objects with a price property');
    }
    const total = order.items.reduce((sum, item) => sum + item.price, 0);
    orders.push({ ...order, total });
    return order;
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
    return deletedOrder;
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
