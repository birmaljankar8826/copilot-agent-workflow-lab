const { addItem, getTotalStock, getItemById } = require('../../src/inventory');

// Reset the module state before each test
let items;
beforeEach(() => {
  jest.resetModules();
  ({ addItem, getTotalStock, getItemById } = require('../../src/inventory'));
  items = require('../../src/inventory').items;
});

describe('addItem', () => {
  // Scenario: successfully adds a valid item
  it('adds a valid item to the inventory', () => {
    const item = { id: 'item1', stock: 10 };
    const result = addItem(item);
    expect(result).toEqual(item);
    expect(items).toContainEqual(item);
  });

  // Scenario: throws an error if item is missing required properties
  it('throws an error if item is missing required properties', () => {
    expect(() => addItem({ id: 'item1' })).toThrow('Invalid item: must have `id` and `stock` properties.');
    expect(() => addItem({ stock: 10 })).toThrow('Invalid item: must have `id` and `stock` properties.');
    expect(() => addItem(null)).toThrow('Invalid item: must have `id` and `stock` properties.');
  });

  // Scenario: throws an error if item with duplicate id is added
  it('throws an error if item with duplicate id is added', () => {
    const item = { id: 'item1', stock: 10 };
    addItem(item);
    expect(() => addItem(item)).toThrow('Item with id item1 already exists.');
  });
});

describe('getTotalStock', () => {
  // Scenario: calculates total stock correctly for multiple items
  it('calculates total stock correctly for multiple items', () => {
    addItem({ id: 'item1', stock: 10 });
    addItem({ id: 'item2', stock: 20 });
    const result = getTotalStock();
    expect(result).toBe(30);
  });

  // Scenario: returns 0 when no items are in the inventory
  it('returns 0 when no items are in the inventory', () => {
    const result = getTotalStock();
    expect(result).toBe(0);
  });

  // Scenario: ignores invalid stock values when calculating total
  it('ignores invalid stock values when calculating total', () => {
    addItem({ id: 'item1', stock: 10 });
    addItem({ id: 'item2', stock: 'invalid' });
    addItem({ id: 'item3', stock: null });
    const result = getTotalStock();
    expect(result).toBe(10);
  });
});

describe('getItemById', () => {
  // Scenario: retrieves an item by its id
  it('retrieves an item by its id', () => {
    const item = { id: 'item1', stock: 10 };
    addItem(item);
    const result = getItemById('item1');
    expect(result).toEqual(item);
  });

  // Scenario: returns null if item with given id does not exist
  it('returns null if item with given id does not exist', () => {
    const result = getItemById('nonexistent');
    expect(result).toBeNull();
  });

  // Scenario: throws an error if id is null or undefined
  it('throws an error if id is null or undefined', () => {
    expect(() => getItemById(null)).toThrow('Invalid id: id cannot be null or undefined.');
    expect(() => getItemById(undefined)).toThrow('Invalid id: id cannot be null or undefined.');
  });
});