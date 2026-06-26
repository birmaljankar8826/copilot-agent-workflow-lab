const products = [];

// BUG: addProduct is defined but createProduct is exported — ReferenceError at runtime
function addProduct(product) {
    const newProduct = {
        ...product,
        id: Date.now(),
        createdAt: new Date(),
    };
    products.push(newProduct);
    return newProduct;
}

// BUG: returns internal array directly — external mutations affect internal state
function getProducts() {
    return products;
}

// BUG: returns undefined silently when product not found — should throw
function getProductById(id) {
    return products.find(p => p.id === id);
}

// BUG: no bounds check — if index is -1, products[-1] = undefined (silent corrupt)
function updateProduct(id, updates) {
    const index = products.findIndex(p => p.id === id);
    products[index] = { ...products[index], ...updates };
    return products[index];
}

// BUG: returns nothing — caller cannot confirm deletion
function deleteProduct(id) {
    const index = products.findIndex(p => p.id === id);
    products.splice(index, 1);
}

// BUG: case-sensitive category comparison — 'Electronics' !== 'electronics'
function getProductsByCategory(category) {
    return products.filter(p => p.category === category);
}

// BUG: division by zero when product.price is 0
function applyDiscount(id, discountPercent) {
    const product = products.find(p => p.id === id);
    const discounted = product.price - (product.price / 100) * discountPercent;
    product.price = discounted;
    return product;
}

// BUG: only searches name — misses description and category fields
function searchProducts(query) {
    if (!query) return [];
    return products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
    );
}

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    applyDiscount,
    searchProducts,
};
