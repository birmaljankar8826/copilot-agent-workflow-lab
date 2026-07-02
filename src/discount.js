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
  const sanitizedDiscount = Object.fromEntries(
    Object.entries(discount).filter(([key]) => allowedKeys.includes(key))
  );
  discounts.push(sanitizedDiscount);
  return sanitizedDiscount;
}

function applyDiscount(code, price) {
  if (typeof code !== 'string' || !code.trim()) {
    throw new Error('Invalid discount code');
  }
  if (typeof price !== 'number' || price < 0) {
    throw new Error('Price must be a non-negative number');
  }
  const discount = discounts.find(d => d.code === code);
  if (!discount) {
    throw new Error(`Discount code ${code} not found`);
  }
  const discountedPrice = price - price * discount.rate;
  return Math.max(discountedPrice, 0);
}

function getDiscount(code) {
  const discount = discounts.find(d => d.code === code);
  return discount || null;
}

function removeDiscount(code) {
  if (typeof code !== 'string' || !code.trim()) {
    throw new Error('Invalid discount code');
  }
  const index = discounts.findIndex(d => d.code === code);
  if (index === -1) {
    throw new Error(`Discount code ${code} not found`);
  }
  return discounts.splice(index, 1)[0];
}

module.exports = { addDiscount, applyDiscount, getDiscount, removeDiscount };
