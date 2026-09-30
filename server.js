const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs/promises');

app.use(express.json());

async function readFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    throw err;
  }
}
const cache = new Map();

async function readFileWithDelay(filePath, delay) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    await new Promise(resolve => setTimeout(resolve, delay));

    return JSON.parse(data);
  } catch (err) {
    throw err;
  }
}

app.get("/products", async (req, res) => {
  try {
    let key = req.url;
    let value = cache[key];

    if (value) {
        res.set('X-Cache', 'HIT');
      return res.json(value);
    } else {
      const products = await readFileWithDelay('./db.json', 15000);
      cache[key] = products;
      res.set('X-Cache', 'MISS');
      return res.json(products);
    }
  } catch (err) {
    res.status(500).send('Error reading file');
  }
});

app.get("/products/:id", async (req, res) => {
  let { id } = req.params;
  id = Number(id);

  try {
    const products = await readFile('./db.json');

    const product = products.find(item => item.id === id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).send('Product not found');
    }
  } catch (err) {
    res.status(500).send('Error reading file');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});