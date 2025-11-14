import { useState, useCallback } from "react";
import { Suggestion } from "../types/suggestion";
import { Product, getProducts } from "../services/productService";
import { getMarkets } from "../services/marketService";
import { MarketInfo } from "../types/market";

export const useMarketLoader = () => {
  const [markets, setMarkets] = useState<MarketInfo[]>([]);
  const [productsCache, setProductsCache] = useState<Map<string, Product[]>>(new Map());
  const [loading, setLoading] = useState(false);

  const loadMarkets = useCallback(async (suggestionData: Suggestion) => {
    if (suggestionData.data.items.length === 0) {
      setMarkets([]);
      return;
    }

    setLoading(true);
    try {
      const marketsResponse = await getMarkets(1, 100);
      const allMarkets = marketsResponse.markets || [];
      const newProductsCache = new Map<string, Product[]>();

      const marketsInfo = await Promise.all(
        allMarkets.map(async (market): Promise<MarketInfo | null> => {
          try {
            const marketProducts: Product[] = [];

            for (const item of suggestionData.data.items) {
              try {
                const response = await getProducts(1, 50, market.id, item.name, undefined, undefined, item.categoryId);
                if (response.products?.length > 0) {
                  marketProducts.push(...response.products);
                }
              } catch {
                continue;
              }
            }

            const uniqueProducts = marketProducts.filter(
              (product, index, self) =>
                index === self.findIndex((p) => p.id === product.id)
            );

            if (uniqueProducts.length === 0) {
              return null;
            }

            newProductsCache.set(market.id, uniqueProducts);
            const totalPrice = uniqueProducts.reduce((sum, product) => sum + product.price, 0);

            return {
              id: market.id,
              name: market.name,
              address: market.address || "",
              logo: market.profilePicture,
              productCount: uniqueProducts.length,
              totalPrice: totalPrice,
            };
          } catch {
            return null;
          }
        })
      );

      setProductsCache(newProductsCache);
      setMarkets(marketsInfo.filter((m): m is MarketInfo => m !== null));
    } catch {
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    markets,
    productsCache,
    loading,
    loadMarkets,
  };
};
