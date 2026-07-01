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
    return products;
}

function getProductById(id) {
    const product = products.find(p => p.id === id);
    return product;
}

function updateProduct(id, updates) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...updates };
    return products[index];
}

function deleteProduct(id) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;
    products.splice(index, 1);
}

function getProductsByCategory(category) {
    return products.filter(p => p.category === category);
}

function applyDiscount(id, discountPercent) {
    const product = products.find(p => p.id === id);
    const discounted = product.price - (product.price / 100) * discountPercent;
    product.price = discounted;
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
