FILE: src/discount.js

```javascript
const discounts = [];

function addDiscount(discount) {
  if (!discount || typeof discount.code !== 'string' || typeof discount.rate !== 'number') {
    throw new Error('Invalid discount: must have code (string) and rate (number)');
  }
  if (discount.rate < 0 || discount.rate > 1) {
    throw new Error('Discount rate must be between 0 and 1');
  }
  if (discounts.some(d => d.code === discount.code)) {
    throw new Error(`Discount code ${discount.code} already exists`);
  }
  const allowedKeys = ['code', 'rate'];
  const hasUnexpectedKeys = Object.keys(discount).some(key => !allowedKeys.includes(key));
  if (hasUnexpectedKeys) {
    throw new Error('Discount object contains unexpected properties');
  }
  discounts.push(discount);
  return discount;
}

function applyDiscount(code, price) {
  const discount = discounts.find(d => d.code === code);
  if (!discount) {
    throw new Error(`Discount code ${code} not found`);
  }
  if (typeof price !== 'number' || price < 0) {
    throw new Error('Price must be a non-negative number');
  }
  return price - price * discount.rate;
}

function getDiscount(code) {
  const discount = discounts.find(d => d.code === code);
  if (!discount) {
    console.warn(`Warning: Discount code ${code} not found`);
  }
  return discount || null;
}

function removeDiscount(code) {
  const index = discounts.findIndex(d => d.code === code);
  if (index === -1) {
    return null;
  }
  return discounts.splice(index, 1)[0];
}

module.exports = { addDiscount, applyDiscount, getDiscount, removeDiscount };
