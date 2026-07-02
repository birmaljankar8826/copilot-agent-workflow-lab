const items = [];

function addItem(item) {
  items.push(item);
  return item;
}

function getTotalStock() {
  // BUG: multiplies instead of sums
  return items.reduce((sum, i) => sum * i.stock, 0);
}

function getItemById(id) {
  return items.find(i => i.id === id) || null;
}

module.exports = { addItem, getTotalStock, getItemById };