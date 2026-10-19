# SaleScout

A small repricing demo: an Express API calculates a recommended price for each product, and a React + Vite page displays the old and new prices with the reason.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```sh
npm install
```

Start the API and web app in separate terminals:

```sh
npm run dev:server
```

```sh
npm run dev:client
```

Open <http://localhost:5173>. The page loads `data/products.json` and posts the array to `POST /reprice`. Vite proxies that request to the API at `http://localhost:3001`. Set `PORT` to change the API port (and update the Vite proxy if using a different port).

## API

`POST http://localhost:3001/reprice` accepts a JSON array of products and returns a `PriceResult[]` in the same order. A non-array body or product with invalid fields receives HTTP 400. Example:

```sh
curl -X POST http://localhost:3001/reprice \
  -H 'Content-Type: application/json' \
  --data-binary @data/products.json
```

## Price calculation

`src/pricing.ts` exports the pure `calculatePrice(product)` function. It ignores out-of-stock offers, takes the cheapest remaining competitor, subtracts `step`, floors to a whole tenge, then clamps to the seller's `[minPrice, maxPrice]` range. If there is no in-stock competitor, it selects `maxPrice`. `myPrice` is returned as `oldPrice` and does not affect the calculation.

## Checks and build

```sh
npm test
npm run typecheck
npm run build
```

## Project structure

- `src/pricing.ts`, `src/types.ts` — pricing rule and shared types
- `server/index.ts` — Express API and request shape checks
- `client/` — React/Vite dashboard
- `tests/pricing.test.ts` — pricing edge cases
- `data/` — example request and expected response

## Defence notes

Be ready to explain these decisions:

1. **Why is the pricing function pure?** It only uses its argument and returns a result, so it is deterministic, easy to test, and reusable from both API code and other callers.
2. **Why `Math.min` then `Math.floor`?** Only in-stock offers compete. `Math.floor(best - step)` follows the stated rule, including fractional prices; rounding to nearest could leave the result above the intended candidate.
3. **Why clamp after calculating the candidate?** The min/max constraints are seller limits. The reason identifies which branch won: no offers, lower limit, upper limit, or an unconstrained undercut.
4. **Why does `myPrice` not affect the recommendation?** The specification says it is returned only as `oldPrice`; the algorithm responds to competitor prices and seller limits.
5. **What does the API validate?** It validates the request is an array with correctly typed finite numeric fields and competitor entries before calling the domain function. Business inputs are kept out of the pure calculation.

Possible follow-up change: to avoid matching a competitor's price when `step` is zero, require a minimum one-tenge undercut or make `step` at least one. That would change the task's specified behavior and should only be done if product requirements change.
