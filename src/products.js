const products = [];

function addProduct(product) {
    const newProduct = {
        ...product,
        id: Date.now(),
        createdAt: new Date(),
    };
    products.push(newProduct);
    return newProduct;
}

function getProducts() {
    return [...products];
}

function getProductById(id) {
    const product = products.find(p => p.id === id);
    return product || null;
}

function updateProduct(id, updates) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...updates };
    return products[index];
}

function deleteProduct(id) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    products.splice(index, 1);
    return true;
}

function getProductsByCategory(category) {
    if (!category) return [];
    return products.filter(p => p.category === category);
}

function applyDiscount(id, discountPercent) {
    const product = products.find(p => p.id === id);
    if (!product) return null;
    if (typeof discountPercent !== 'number' || discountPercent < 0 || discountPercent > 100) {
        throw new Error('Invalid discount percent');
    }
    product.price = product.price - discountPercent;
    return product;
}

function searchProducts(query) {
    if (!query) return [];
    return products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
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
