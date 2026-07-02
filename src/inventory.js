const items = []; // Array to store inventory items. Each item should have properties like `id` and `stock`.

function addItem(item) {
  // Validate the input item to ensure it has the required properties
  if (!item || typeof item.id === 'undefined' || typeof item.stock === 'undefined') {
    throw new Error('Invalid item: must have `id` and `stock` properties.');
  }
  
  // Check for duplicate `id` values before adding the item
  if (items.some(existingItem => existingItem.id === item.id)) {
    throw new Error(`Item with id ${item.id} already exists.`);
  }
  
  items.push(item);
  return item;
}

function getTotalStock() {
  // Correctly sum the stock values of all items, ensuring `stock` is a valid number
  return items.reduce((sum, i) => {
    const stock = typeof i.stock === 'number' ? i.stock : 0;
    return sum + stock;
  }, 0);
}

function getItemById(id) {
  // Ensure `id` is not null or undefined before proceeding
  if (id === null || id === undefined) {
    throw new Error('Invalid id: id cannot be null or undefined.');
  }
  return items.find(i => i.id === id) || null;
}

module.exports = { addItem, getTotalStock, getItemById };
