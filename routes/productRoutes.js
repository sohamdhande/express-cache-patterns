const express = require('express');
const productController = require('../controllers/productController');
const cacheMiddleware = require('../middleware/cacheMiddleware');
const invalidateCacheMiddleware = require('../middleware/invalidateCacheMiddleware');

const router = express.Router();

// Cached GET endpoints.
router.get('/', cacheMiddleware, productController.getProducts);
router.get('/:id', cacheMiddleware, productController.getProductById);

// Any successful write invalidates stale product cache entries.
router.post('/', invalidateCacheMiddleware, productController.createProduct);
router.put('/:id', invalidateCacheMiddleware, productController.updateProduct);
router.patch('/:id', invalidateCacheMiddleware, productController.updateProduct);
router.delete('/:id', invalidateCacheMiddleware, productController.deleteProduct);

module.exports = router;
