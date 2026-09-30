const path = require('path');
const fs = require('fs/promises');

const DATA_FILE = path.join(__dirname, '..', 'db.json');

async function readProducts() {
  const data = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

async function writeProducts(products) {
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(products, null, 2) + '\n',
    'utf8'
  );
}

async function getAllProducts() {
  return readProducts();
}

async function getProductById(id) {
  const products = await readProducts();
  return products.find(product => product.id === id) || null;
}

async function createProduct({ name, price }) {
  const products = await readProducts();

  const nextId =
    products.reduce((maxId, product) => Math.max(maxId, product.id), 0) + 1;

  const product = {
    id: nextId,
    name,
    price,
  };

  products.push(product);
  await writeProducts(products);

  return product;
}

async function updateProduct(id, updates) {
  const products = await readProducts();
  const index = products.findIndex(product => product.id === id);

  if (index === -1) {
    return null;
  }

  products[index] = {
    ...products[index],
    ...updates,
  };

  await writeProducts(products);
  return products[index];
}

async function deleteProduct(id) {
  const products = await readProducts();
  const index = products.findIndex(product => product.id === id);

  if (index === -1) {
    return null;
  }

  const [deletedProduct] = products.splice(index, 1);
  await writeProducts(products);

  return deletedProduct;
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
