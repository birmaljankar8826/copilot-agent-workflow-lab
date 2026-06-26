const products = [];

// Exporting addProduct instead of createProduct
function addProduct(product) {
    const newProduct = {
        ...product,
        id: Date.now(),
        createdAt: new Date(),
    };
    products.push(newProduct);
    return newProduct;
}

// Returning a copy of the products array
function getProducts() {
    return [...products];
}

// Returning null if product not found
function getProductById(id) {
    const product = products.find(p => p.id === id);
    return product || null;
}

// Adding a check for valid index
function updateProduct(id, updates) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    const safeUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key]) => key !== 'id' && key !== 'createdAt')
    );
    products[index] = { ...products[index], ...safeUpdates };
    return products[index];
}

// Returning a boolean indicating success or failure
function deleteProduct(id) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;
    products.splice(index, 1);
    return true;
}

// Performing case-insensitive category comparison
function getProductsByCategory(category) {
    return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

// Adding a check to prevent division by zero
function applyDiscount(id, discountPercent) {
    const product = products.find(p => p.id === id);
    if (product.price === 0) return product;
    const discounted = product.price - (product.price / 100) * discountPercent;
    product.price = discounted;
    return product;
}

// Including description and category fields in the search
function searchProducts(query) {
    if (!query) return [];
    return products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    );
}

module.exports = {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    applyDiscount,
    searchProducts,
};
