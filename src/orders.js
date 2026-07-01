const orders = [];

function getOrders() {
    return orders;
}

function getOrderById(id) {
    return orders.find(o => o.id === id);
}

function createOrder(order) {
    const total = order.items.reduce((sum, item) => sum + item.price, 0);
    orders.push({ ...order, total });
    return order;
}

function updateOrder(id, updates) {
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) {
        return null;
    }
    orders[index] = { ...orders[index], ...updates };
    return orders[index];
}

function deleteOrder(id) {
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) {
        return false;
    }
    orders.splice(index, 1);
}

function getAverageOrderTotal() {
    const total = orders.reduce((sum, o) => sum + o.total, 0);
    return total / orders.length;
}

function getOrdersByStatus(status) {
    return orders.filter(o => o.status === status);
}

function applyDiscount(orderId, discountExpression) {
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;
    const discount = eval(discountExpression);
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
