describe('products module', () => {
  let addProduct, getProducts, getProductById, updateProduct, deleteProduct, getProductsByCategory, applyDiscount, searchProducts;

  beforeEach(() => {
    jest.resetModules();
    ({ addProduct, getProducts, getProductById, updateProduct, deleteProduct, getProductsByCategory, applyDiscount, searchProducts } = require('../../src/products'));
  });

  // Scenario: adds a new product and returns it
  it('should add a new product and return it', () => {
    const product = { name: 'Product A', price: 100, category: 'Category 1' };
    const result = addProduct(product);

    expect(result).toMatchObject({
      name: 'Product A',
      price: 100,
      category: 'Category 1'
    });
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('createdAt');
  });

  // Scenario: retrieves all products
  it('should retrieve all products', () => {
    const product1 = addProduct({ name: 'Product A', price: 100, category: 'Category 1' });
    const product2 = addProduct({ name: 'Product B', price: 200, category: 'Category 2' });

    const result = getProducts();

    expect(result).toEqual([product1, product2]);
  });

  // Scenario: retrieves a product by ID
  it('should retrieve a product by ID', () => {
    const product = addProduct({ name: 'Product A', price: 100, category: 'Category 1' });

    const result = getProductById(product.id);

    expect(result).toEqual(product);
  });

  // Scenario: returns null if product ID is not found
  it('should return null if product ID is not found', () => {
    const result = getProductById(999);

    expect(result).toBeNull();
  });

  // Scenario: updates a product by ID
  it('should update a product by ID', () => {
    const product = addProduct({ name: 'Product A', price: 100, category: 'Category 1' });

    const updates = { name: 'Updated Product A', price: 150 };
    const updatedProduct = updateProduct(product.id, updates);

    expect(updatedProduct).toMatchObject(updates);
    expect(updatedProduct.id).toBe(product.id);
    expect(updatedProduct.createdAt).toBe(product.createdAt);
  });

  // Scenario: returns null when updating a non-existent product
  it('should return null when updating a non-existent product', () => {
    const result = updateProduct(999, { name: 'Non-existent Product' });

    expect(result).toBeNull();
  });

  // Scenario: deletes a product by ID
  it('should delete a product by ID', () => {
    const product = addProduct({ name: 'Product A', price: 100, category: 'Category 1' });

    const deletedProduct = deleteProduct(product.id);

    expect(deletedProduct).toEqual(product);
    expect(getProducts()).toHaveLength(0);
  });

  // Scenario: returns null when deleting a non-existent product
  it('should return null when deleting a non-existent product', () => {
    const result = deleteProduct(999);

    expect(result).toBeNull();
  });

  // Scenario: retrieves products by category
  it('should retrieve products by category', () => {
    const product1 = addProduct({ name: 'Product A', price: 100, category: 'Category 1' });
    const product2 = addProduct({ name: 'Product B', price: 200, category: 'Category 2' });

    const result = getProductsByCategory('Category 1');

    expect(result).toEqual([product1]);
  });

  // Scenario: applies a discount to a product
  it('should apply a discount to a product', () => {
    const product = addProduct({ name: 'Product A', price: 100, category: 'Category 1' });

    const updatedProduct = applyDiscount(product.id, 20);

    expect(updatedProduct.price).toBe(80);
  });

  // Scenario: throws an error for invalid discount percent
  it('should throw an error for invalid discount percent', () => {
    const product = addProduct({ name: 'Product A', price: 100, category: 'Category 1' });

    expect(() => applyDiscount(product.id, -10)).toThrow('Invalid discount percent');
    expect(() => applyDiscount(product.id, 110)).toThrow('Invalid discount percent');
    expect(() => applyDiscount(product.id, 'invalid')).toThrow('Invalid discount percent');
  });

  // Scenario: throws an error if discounted price is negative
  it('should throw an error if discounted price is negative', () => {
    const product = addProduct({ name: 'Product A', price: 10, category: 'Category 1' });

    expect(() => applyDiscount(product.id, 200)).toThrow('Invalid discount percent');
  });

  // Scenario: searches products by query
  it('should search products by query', () => {
    const product1 = addProduct({ name: 'Product A', price: 100, category: 'Category 1' });
    const product2 = addProduct({ name: 'Another Product', price: 200, category: 'Category 2' });

    const result = searchProducts('Product');

    expect(result).toEqual([product1, product2]);
  });

  // Scenario: returns an empty array when query is empty
  it('should return an empty array when query is empty', () => {
    const result = searchProducts('');

    expect(result).toEqual([]);
  });
});