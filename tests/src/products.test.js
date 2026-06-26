const { addProduct, getProducts, getProductById, updateProduct, deleteProduct, getProductsByCategory, applyDiscount, searchProducts } = require('../src/products');

let productSample;

beforeEach(() => {
  jest.resetModules();
  ({ addProduct, getProducts, getProductById, updateProduct, deleteProduct, getProductsByCategory, applyDiscount, searchProducts } = require('../src/products'));
  productSample = { name: 'Sample Product', price: 100, category: 'Electronics', description: 'A sample product' };
});

// Scenario: adds a new product successfully
it('should add a new product', () => {
  const product = addProduct(productSample);
  expect(product).toHaveProperty('id');
  expect(product).toHaveProperty('createdAt');
  expect(product.name).toBe(productSample.name);
});

// Scenario: retrieves all products
it('should retrieve all products', () => {
  addProduct(productSample);
  const products = getProducts();
  expect(products.length).toBe(1);
});

// Scenario: retrieves a product by ID
it('should retrieve a product by ID', () => {
  const product = addProduct(productSample);
  const foundProduct = getProductById(product.id);
  expect(foundProduct).toEqual(product);
});

// Scenario: returns null if product not found by ID
it('should return null if product not found by ID', () => {
  const foundProduct = getProductById(999);
  expect(foundProduct).toBeNull();
});

// Scenario: updates a product successfully
it('should update a product', () => {
  const product = addProduct(productSample);
  const updatedProduct = updateProduct(product.id, { price: 150 });
  expect(updatedProduct.price).toBe(150);
});

// Scenario: returns null if product to update is not found
it('should return null if product to update is not found', () => {
  const updatedProduct = updateProduct(999, { price: 150 });
  expect(updatedProduct).toBeNull();
});

// Scenario: deletes a product successfully
it('should delete a product', () => {
  const product = addProduct(productSample);
  const result = deleteProduct(product.id);
  expect(result).toBe(true);
  expect(getProducts().length).toBe(0);
});

// Scenario: returns false if product to delete is not found
it('should return false if product to delete is not found', () => {
  const result = deleteProduct(999);
  expect(result).toBe(false);
});

// Scenario: retrieves products by category
it('should retrieve products by category', () => {
  addProduct(productSample);
  const products = getProductsByCategory('electronics');
  expect(products.length).toBe(1);
});

// Scenario: applies discount to a product
it('should apply discount to a product', () => {
  const product = addProduct(productSample);
  const discountedProduct = applyDiscount(product.id, 10);
  expect(discountedProduct.price).toBe(90);
});

// Scenario: does not apply discount if price is zero
it('should not apply discount if price is zero', () => {
  const product = addProduct({ ...productSample, price: 0 });
  const discountedProduct = applyDiscount(product.id, 10);
  expect(discountedProduct.price).toBe(0);
});

// Scenario: searches products by query
it('should search products by query', () => {
  addProduct(productSample);
  const results = searchProducts('sample');
  expect(results.length).toBe(1);
});

// Scenario: returns empty array if no query is provided
it('should return empty array if no query is provided', () => {
  const results = searchProducts('');
  expect(results.length).toBe(0);
});