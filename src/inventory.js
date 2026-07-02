const items = []; // Array to store inventory items. Each item should have properties like `id` and `stock`.

function addItem(item) {
  // Validate the input item to ensure it has the required properties
  if (!item || typeof item.id === 'undefined' || typeof item.stock === 'undefined') {
    throw new Error('Invalid item: must have `id` and `stock` properties.');
  }
  items.push(item);
  return item;
}

function getTotalStock() {
  // Correctly sum the stock values of all items
  return items.reduce((sum, i) => sum + i.stock, 0);
}

function getItemById(id) {
  // Ensure `id` is not null or undefined before proceeding
  if (id == null) {
    throw new Error('Invalid id: id cannot be null or undefined.');
  }
  return items.find(i => i.id === id) || null;
}

module.exports = { addItem, getTotalStock, getItemById };
