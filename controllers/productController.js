const productService = require('../services/productService');

async function getProducts(req, res, next) {
  try {
    const products = await productService.getProducts();
    return res.json(products);
  } catch (error) {
    return next(error);
  }
}

async function getProductById(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'Product id must be a number' });
  }

  try {
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

async function createProduct(req, res, next) {
  const { name, price } = req.body;

  if (typeof name !== 'string' || !name.trim() || typeof price !== 'number' || !Number.isFinite(price)) {
    return res.status(400).json({
      message: 'name (string) and price (number) are required',
    });
  }

  try {
    const product = await productService.createProduct({
      name: name.trim(),
      price,
    });

    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
}

async function updateProduct(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'Product id must be a number' });
  }

  const { name, price } = req.body;

  if (
    name !== undefined &&
    (typeof name !== 'string' || !name.trim())
  ) {
    return res.status(400).json({ message: 'name must be a non-empty string' });
  }

  if (
    price !== undefined &&
    (typeof price !== 'number' || !Number.isFinite(price))
  ) {
    return res.status(400).json({ message: 'price must be a number' });
  }

  if (name === undefined && price === undefined) {
    return res.status(400).json({
      message: 'Provide at least one of name or price',
    });
  }

  try {
    const product = await productService.updateProduct(id, {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(price !== undefined ? { price } : {}),
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'Product id must be a number' });
  }

  try {
    const product = await productService.deleteProduct(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({
      message: 'Product deleted successfully',
      product,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
