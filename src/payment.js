const { v4: uuidv4 } = require('uuid');

const payments = [];

function processPayment(payment) {
  if (!payment || typeof payment.amount !== 'number' || payment.amount <= 0) {
    throw new Error('Invalid payment: amount must be a positive number');
  }
  if (!payment.method || !['card', 'cash', 'online'].includes(payment.method)) {
    throw new Error('Invalid payment: method must be card, cash, or online');
  }
  const record = { ...payment, id: 'PAY-' + uuidv4(), status: 'completed' };
  payments.push(record);
  return record;
}

function refundPayment(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid id: id must be a valid string');
  }
  const index = payments.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('Payment ' + id + ' not found');
  }
  if (payments[index].status === 'refunded') {
    throw new Error('Payment ' + id + ' already refunded');
  }
  const updatedPayment = { ...payments[index], status: 'refunded' };
  payments[index] = updatedPayment;
  return updatedPayment;
}

function getPayment(id) {
  const payment = payments.find(p => p.id === id);
  if (!payment) {
    throw new Error('Payment ' + id + ' not found');
  }
  return payment;
}

function getTotalCollected() {
  return payments.reduce(function(sum, p) {
    if (p.status === 'completed' && typeof p.amount === 'number' && p.amount > 0) {
      return sum + p.amount;
    }
    return sum;
  }, 0);
}

module.exports = { processPayment, refundPayment, getPayment, getTotalCollected };
