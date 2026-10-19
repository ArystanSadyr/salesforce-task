import type { Product, PriceResult } from "./types";

/** Calculate a price from in-stock competitor offers without mutating the product. */
export function calculatePrice(product: Product): PriceResult {
  const inStockPrices = product.competitors
    .filter((competitor) => competitor.inStock)
    .map((competitor) => competitor.price);

  if (inStockPrices.length === 0) {
    return {
      sku: product.sku,
      oldPrice: product.myPrice,
      newPrice: product.maxPrice,
      reason: "NO_COMPETITORS",
    };
  }

  const bestPrice = Math.min(...inStockPrices);
  const candidate = Math.floor(bestPrice - product.step);

  if (candidate < product.minPrice) {
    return { sku: product.sku, oldPrice: product.myPrice, newPrice: product.minPrice, reason: "AT_MIN" };
  }
  if (candidate > product.maxPrice) {
    return { sku: product.sku, oldPrice: product.myPrice, newPrice: product.maxPrice, reason: "AT_MAX" };
  }
  return { sku: product.sku, oldPrice: product.myPrice, newPrice: candidate, reason: "UNDERCUT" };
}
