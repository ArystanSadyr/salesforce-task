import express from "express";
import { calculatePrice } from "../src/pricing";
import type { Product } from "../src/types";

const app = express();
const port = Number(process.env.PORT ?? 3001);
app.use(express.json());

function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) return false;
  const product = value as Record<string, unknown>;
  return typeof product.sku === "string" && typeof product.name === "string"
    && typeof product.myPrice === "number" && Number.isFinite(product.myPrice)
    && typeof product.minPrice === "number" && Number.isFinite(product.minPrice)
    && typeof product.maxPrice === "number" && Number.isFinite(product.maxPrice)
    && typeof product.step === "number" && Number.isFinite(product.step)
    && Array.isArray(product.competitors)
    && product.competitors.every((item: unknown) => {
      if (typeof item !== "object" || item === null) return false;
      const competitor = item as Record<string, unknown>;
      return typeof competitor.seller === "string" && typeof competitor.price === "number"
        && Number.isFinite(competitor.price) && typeof competitor.inStock === "boolean";
    });
}

app.post("/reprice", (request, response) => {
  if (!Array.isArray(request.body)) {
    response.status(400).json({ error: "Request body must be an array of products." });
    return;
  }
  if (!request.body.every(isProduct)) {
    response.status(400).json({ error: "Each product must contain valid product fields and competitors." });
    return;
  }
  response.json((request.body as Product[]).map(calculatePrice));
});

app.listen(port, () => console.log(`SaleScout API listening on http://localhost:${port}`));
