const productDatabase = require('../database/productDatabase');

function getProducts() {
  return productDatabase.getAllProducts();
}

function getProductById(id) {
  return productDatabase.getProductById(id);
}

function createProduct(productData) {
  return productDatabase.createProduct(productData);
}

function updateProduct(id, productData) {
  return productDatabase.updateProduct(id, productData);
}

function deleteProduct(id) {
  return productDatabase.deleteProduct(id);
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
