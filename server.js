const express = require('express');
const productRoutes = require('./routes/productRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/products', productRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Cache workshop server listening on http://localhost:${port}`);
  });
}

module.exports = app;
