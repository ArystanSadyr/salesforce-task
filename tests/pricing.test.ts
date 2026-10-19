import { describe, expect, it } from "vitest";
import { calculatePrice } from "../src/pricing";
import type { Product } from "../src/types";

function product(overrides: Partial<Product> = {}): Product {
  return {
    sku: "SKU-1", name: "Test product", myPrice: 400, minPrice: 100, maxPrice: 500, step: 10,
    competitors: [{ seller: "A", price: 300, inStock: true }],
    ...overrides,
  };
}

describe("calculatePrice", () => {
  it("undercuts the cheapest in-stock competitor and floors fractional prices", () => {
    expect(calculatePrice(product({ step: 0.5, competitors: [
      { seller: "A", price: 349999.9, inStock: true },
      { seller: "B", price: 340000, inStock: false },
    ], minPrice: 330000, maxPrice: 380000 }))).toEqual({ sku: "SKU-1", oldPrice: 400, newPrice: 349999, reason: "UNDERCUT" });
  });

  it("chooses the minimum in-stock price and clamps at the seller's floor", () => {
    expect(calculatePrice(product({ minPrice: 295, competitors: [
      { seller: "A", price: 400, inStock: true }, { seller: "B", price: 300, inStock: true },
    ] }))).toEqual({ sku: "SKU-1", oldPrice: 400, newPrice: 295, reason: "AT_MIN" });
  });

  it("clamps above the seller's ceiling", () => {
    expect(calculatePrice(product({ maxPrice: 200, competitors: [{ seller: "A", price: 300, inStock: true }] })))
      .toEqual({ sku: "SKU-1", oldPrice: 400, newPrice: 200, reason: "AT_MAX" });
  });

  it("uses the maximum price when no competitor is in stock", () => {
    expect(calculatePrice(product({ maxPrice: 500, competitors: [{ seller: "A", price: 1, inStock: false }] })))
      .toEqual({ sku: "SKU-1", oldPrice: 400, newPrice: 500, reason: "NO_COMPETITORS" });
  });

  it("does not use myPrice to influence the recommendation", () => {
    expect(calculatePrice(product({ myPrice: 10 })).newPrice).toBe(290);
  });

  it("accepts candidates exactly on either limit as an undercut result", () => {
    expect(calculatePrice(product({ minPrice: 290 })).reason).toBe("UNDERCUT");
    expect(calculatePrice(product({ maxPrice: 290 })).reason).toBe("UNDERCUT");
  });
});
