# Cache Workshop

A small Express.js workshop project that demonstrates how an in-memory cache can reduce repeated file-system work.

## Run

```bash
npm install
npm start
```

The server runs on:

```
http://localhost:3000
```

For development with automatic restarts:

```bash
npm run server
```

## APIs

### GET /products

The first request reads `db.json`, waits briefly to make the loading cost visible, and returns:

```
X-Cache: MISS
```

A repeated request while the cache entry is valid is served from memory:

```
X-Cache: HIT
```

Cache entries expire after 60 seconds.

### GET /products/:id

Returns a single product by numeric id and applies the same in-memory caching behaviour.

### POST /products

Creates a product and invalidates cached `/products` responses so the next GET reads fresh data.

Example:

```json
{
  "name": "Webcam",
  "price": 79.99
}
```

Response status: `201 Created`.

## Example testing

Start the server and run:

```bash
curl -i http://localhost:3000/products
curl -i http://localhost:3000/products
curl -i http://localhost:3000/products/1
curl -i http://localhost:3000/products/1
curl -i -X POST http://localhost:3000/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"Webcam","price":79.99}'
curl -i http://localhost:3000/products
```

The first GET for a cache key should show `X-Cache: MISS`; the repeated GET should show `X-Cache: HIT`.

## Cache concepts demonstrated

- In-memory caching with JavaScript `Map`
- Cache keys based on `req.originalUrl`
- Cache hit/miss response headers
- TTL-based expiration
- Cache invalidation after a write
- Simulated loading delay for observing the benefit of caching
