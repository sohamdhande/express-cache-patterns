# Cache Workshop

Express.js cache workshop implementing the required layered architecture:

**Route → Middleware → Controller → Service → Database**

## Project structure

```
cache_workshop/
├── controllers/
│   └── productController.js
├── database/
│   └── productDatabase.js
├── middleware/
│   ├── cacheMiddleware.js
│   ├── errorMiddleware.js
│   └── invalidateCacheMiddleware.js
├── routes/
│   └── productRoutes.js
├── services/
│   └── productService.js
├── db.json
├── server.js
├── package.json
└── .gitignore
```

## Cache behaviour

Both GET endpoints use the cache middleware:

- `GET /products`
- `GET /products/:id`

Every cache entry stores:

- the cached value
- the time at which the entry was created

The TTL is **1 minute**.

For every GET request:

- `X-Cache: MISS` means the data was fetched from the database layer.
- `X-Cache: HIT` means the valid cached value was returned.
- After 1 minute, an entry is treated as expired and fresh data is fetched and cached again.

The cache key is the request URL (`req.originalUrl`), so different product URLs have separate cache entries.

## Cache invalidation

Successful data-changing requests invalidate all cached product data:

- `POST /products`
- `PUT /products/:id`
- `PATCH /products/:id`
- `DELETE /products/:id`

Invalidation happens after the response completes successfully. Failed writes do not clear the cache.

## APIs

### Get all products

```
GET /products
```

### Get one product

```
GET /products/:id
```

### Create a product

```
POST /products
Content-Type: application/json

{
  "name": "Webcam",
  "price": 79.99
}
```

### Update a product

Both PUT and PATCH are supported:

```
PATCH /products/1
Content-Type: application/json

{
  "price": 54.99
}
```

### Delete a product

```
DELETE /products/1
```

## Run

```bash
npm install
npm start
```

For development:

```bash
npm run server
```

The application runs on:

```
http://localhost:3000
```

## Test caching

Run the same GET request twice:

```bash
curl -i http://localhost:3000/products
curl -i http://localhost:3000/products
```

The first request should return `X-Cache: MISS`; the second should return `X-Cache: HIT`.

For a single product:

```bash
curl -i http://localhost:3000/products/1
curl -i http://localhost:3000/products/1
```

Then modify the data:

```bash
curl -i -X PATCH http://localhost:3000/products/1 \
  -H 'Content-Type: application/json' \
  -d '{"price":54.99}'
```

The next GET should be a `MISS`, because the successful update invalidated the old cache entry.
