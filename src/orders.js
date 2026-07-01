const orders = [];

// BUG: returns internal array directly — callers can mutate it
function getOrders() {
    return orders;
}

// BUG: no validation on id — undefined/null id will silently return undefined
function getOrderById(id) {
    return orders.find(o => o.id === id);
}

// BUG: no check if userId or items exist — will crash with TypeError
function createOrder(order) {
    const total = order.items.reduce((sum, item) => sum + item.price, 0);
    orders.push({ ...order, total });
    return order;
}

// BUG: allows overwriting id and createdAt via spread
function updateOrder(id, updates) {
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) {
        return null;
    }
    orders[index] = { ...orders[index], ...updates };
    return orders[index];
}

// BUG: deleteOrder does not return deleted order — no confirmation
function deleteOrder(id) {
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) {
        return false;
    }
    orders.splice(index, 1);
}

// BUG: division by zero if orders array is empty
function getAverageOrderTotal() {
    const total = orders.reduce((sum, o) => sum + o.total, 0);
    return total / orders.length;
}

// BUG: case-sensitive status comparison — 'Pending' won't match 'pending'
function getOrdersByStatus(status) {
    return orders.filter(o => o.status === status);
}

// BUG: eval used to parse discount — security vulnerability
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
