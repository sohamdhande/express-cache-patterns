const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const port = 3000;
const DATA_FILE = path.join(__dirname, 'db.json');
const CACHE_DELAY_MS = 1500;

// In-memory cache: key -> { value, expiresAt }
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000;

app.use(express.json());

async function readProducts() {
  const data = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

function getCache(key) {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

function setCache(key, value) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function invalidateProductsCache() {
  for (const key of cache.keys()) {
    if (key.startsWith('/products')) {
      cache.delete(key);
    }
  }
}

// GET all products.
// First request: MISS -> reads from disk with an intentional delay.
// Repeated request within TTL: HIT -> served from memory.
app.get('/products', async (req, res) => {
  const key = req.originalUrl;
  const cachedProducts = getCache(key);

  if (cachedProducts !== null) {
    res.set('X-Cache', 'HIT');
    return res.json(cachedProducts);
  }

  try {
    const products = await readProducts();

    // Keep the workshop's visible loading-delay behaviour.
    await new Promise(resolve => setTimeout(resolve, CACHE_DELAY_MS));

    setCache(key, products);
    res.set('X-Cache', 'MISS');
    return res.json(products);
  } catch (err) {
    console.error('Error reading products:', err);
    return res.status(500).json({ message: 'Error reading products' });
  }
});

// GET one product by numeric id.
app.get('/products/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'Product id must be a number' });
  }

  const key = req.originalUrl;
  const cachedProduct = getCache(key);

  if (cachedProduct !== null) {
    res.set('X-Cache', 'HIT');
    return res.json(cachedProduct);
  }

  try {
    const products = await readProducts();
    const product = products.find(item => item.id === id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    setCache(key, product);
    res.set('X-Cache', 'MISS');
    return res.json(product);
  } catch (err) {
    console.error('Error reading product:', err);
    return res.status(500).json({ message: 'Error reading product' });
  }
});

// POST a product to demonstrate cache invalidation after a data change.
app.post('/products', async (req, res) => {
  const { name, price } = req.body;

  if (typeof name !== 'string' || !name.trim() || typeof price !== 'number') {
    return res.status(400).json({
      message: 'name (string) and price (number) are required',
    });
  }

  try {
    const products = await readProducts();
    const nextId = products.reduce((max, item) => Math.max(max, item.id), 0) + 1;

    const product = {
      id: nextId,
      name: name.trim(),
      price,
    };

    products.push(product);
    await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2) + '\n', 'utf8');

    invalidateProductsCache();

    return res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    return res.status(500).json({ message: 'Error creating product' });
  }
});

app.listen(port, () => {
  console.log(`Cache workshop server listening on http://localhost:${port}`);
});
