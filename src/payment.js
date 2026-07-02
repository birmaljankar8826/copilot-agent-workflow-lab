const payments = [];

function processPayment(payment) {
  if (!payment || typeof payment.amount !== 'number' || payment.amount <= 0) {
    throw new Error('Invalid payment: amount must be a positive number');
  }
  if (!payment.method || !['card', 'cash', 'online'].includes(payment.method)) {
    throw new Error('Invalid payment: method must be card, cash, or online');
  }
  const record = { ...payment, id: `PAY-${Date.now()}`, status: 'completed' };
  payments.push(record);
  return record;
}

function refundPayment(id) {
  const index = payments.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error(`Payment ${id} not found`);
  }
  if (payments[index].status === 'refunded') {
    throw new Error(`Payment ${id} already refunded`);
  }
  payments[index] = { ...payments[index], status: 'refunded' };
  return payments[index];
}

function getPayment(id) {
  return payments.find(p => p.id === id) || null;
}

function getTotalCollected() {
  return payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
}

module.exports = { processPayment, refundPayment, getPayment, getTotalCollected };
