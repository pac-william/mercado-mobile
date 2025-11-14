import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
} from "react-native";
import { Text, useTheme, Button } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeStackParamList } from "../../../App";
import { Header } from "../../components/layout/header";
import { getSuggestionById } from "../../services/suggestionService";
import { getProducts, Product } from "../../services/productService";
import { getMarketById } from "../../services/marketService";
import { Suggestion } from "../../types/suggestion";
import { useCart } from "../../contexts/CartContext";
import { useSession } from "../../hooks/useSession";
import { addItemToCart, updateCartItem, removeCartItem } from "../../services/cartService";

type MarketProductsScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

interface ProductWithQuantity extends Product {
  quantity: number;
  cartItemId?: string;
  categoryId?: string;
  type?: "essential" | "common" | "utensil";
}

export default function MarketProductsScreen() {
  const navigation = useNavigation<MarketProductsScreenNavigationProp>();
  const route = useRoute();
  const paperTheme = useTheme();
  const insets = useSafeAreaInsets();
  const { suggestionId, marketId, products: cachedProducts } = route.params as { 
    suggestionId: string; 
    marketId: string; 
    products?: Product[] 
  };
  const { addItem, updateQuantity, removeItem, state: cartState } = useCart();
  const { isAuthenticated } = useSession();

  const [market, setMarket] = useState<{ name: string; logo?: string } | null>(null);
  const [products, setProducts] = useState<ProductWithQuantity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alternativesModalVisible, setAlternativesModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductWithQuantity | null>(null);
  const [alternatives, setAlternatives] = useState<Product[]>([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);

  useEffect(() => {
    loadData();
  }, [suggestionId, marketId]);

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);

      const [suggestionData, marketData] = await Promise.all([
        getSuggestionById(suggestionId),
        getMarketById(marketId),
      ]);

      setMarket({
        name: marketData.name,
        logo: marketData.profilePicture,
      });

      if (cachedProducts && cachedProducts.length > 0) {
        await loadProductsFromCache(suggestionData, cachedProducts, marketId, marketData.name);
      } else {
        await loadProducts(suggestionData, marketId, marketData.name);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const buildProductsMap = (suggestionItems: Suggestion["data"]["items"], products: Product[]) => {
    const productsMap = new Map<string, { categoryId: string; type: "essential" | "common" | "utensil" }>();
    for (const item of suggestionItems) {
      products.forEach((p) => {
        if (!productsMap.has(p.id) && p.name.toLowerCase().includes(item.name.toLowerCase())) {
          productsMap.set(p.id, { categoryId: item.categoryId, type: item.type });
        }
      });
    }
    return productsMap;
  };

  const mapProductsWithQuantity = (
    products: Product[],
    productsMap: Map<string, { categoryId: string; type: "essential" | "common" | "utensil" }>,
    targetMarketId: string
  ): ProductWithQuantity[] => {
    return products.map((p) => {
      const cartItem = cartState.items.find((i) => i.id === p.id && i.marketId === targetMarketId);
      const productInfo = productsMap.get(p.id);
      const initialQuantity = cartItem?.quantity || 1;
      return {
        ...p,
        quantity: initialQuantity,
        cartItemId: cartItem?.cartItemId,
        categoryId: productInfo?.categoryId,
        type: productInfo?.type,
      };
    });
  };

  const removeSuggestionProductsFromOtherMarkets = async (suggestionProducts: Product[], currentMarketId: string) => {
    const suggestionProductIds = new Set(suggestionProducts.map((p) => p.id));
    
    const itemsToRemove = cartState.items.filter(
      (item) => suggestionProductIds.has(item.id) && item.marketId !== currentMarketId
    );

    for (const item of itemsToRemove) {
      removeItem(item.id);
      if (isAuthenticated && item.cartItemId) {
        try {
          await removeCartItem(item.cartItemId);
        } catch {
          continue;
        }
      }
    }
  };

  const addProductsToCart = async (products: ProductWithQuantity[], targetMarketId: string, marketName: string) => {
    for (const product of products) {
      if (!cartState.items.find((i) => i.id === product.id && i.marketId === targetMarketId)) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || "",
          marketName: marketName,
          marketId: product.marketId,
        });
        if (isAuthenticated) {
          addItemToCart({ productId: product.id, quantity: 1 })
            .then((response) => {
              setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, cartItemId: response.id } : p)));
            })
            .catch(() => {
              setProducts((prev) => prev.map((p) => {
                const cartItem = cartState.items.find((i) => i.id === p.id && i.marketId === targetMarketId);
                return p.id === product.id ? { ...p, quantity: cartItem?.quantity || 1, cartItemId: cartItem?.cartItemId } : p;
              }));
            });
        }
      }
    }
  };

  const loadProductsFromCache = async (
    suggestionData: Suggestion,
    cachedProducts: Product[],
    targetMarketId: string,
    marketName: string
  ) => {
    try {
      await removeSuggestionProductsFromOtherMarkets(cachedProducts, targetMarketId);
      const productsMap = buildProductsMap(suggestionData.data.items, cachedProducts);
      const productsWithQuantity = mapProductsWithQuantity(cachedProducts, productsMap, targetMarketId);
      await addProductsToCart(productsWithQuantity, targetMarketId, marketName);
      setProducts(productsWithQuantity);
    } catch {
      setProducts([]);
    }
  };

  const loadProducts = async (suggestionData: Suggestion, targetMarketId: string, marketName: string) => {
    try {
      const allProducts: Product[] = [];
      const productsMap = new Map<string, { categoryId: string; type: "essential" | "common" | "utensil" }>();

      for (const item of suggestionData.data.items) {
        try {
          const response = await getProducts(1, 50, targetMarketId, item.name, undefined, undefined, item.categoryId);
          if (response.products?.length > 0) {
            allProducts.push(...response.products);
            response.products.forEach((p) => {
              if (!productsMap.has(p.id)) {
                productsMap.set(p.id, { categoryId: item.categoryId, type: item.type });
              }
            });
          }
        } catch {
          continue;
        }
      }

      const uniqueProducts = allProducts.filter((p, i, self) => i === self.findIndex((x) => x.id === p.id));
      await removeSuggestionProductsFromOtherMarkets(uniqueProducts, targetMarketId);
      const productsWithQuantity = mapProductsWithQuantity(uniqueProducts, productsMap, targetMarketId);
      await addProductsToCart(productsWithQuantity, targetMarketId, marketName);
      setProducts(productsWithQuantity);
    } catch {
      setProducts([]);
    }
  };

  const syncCartItem = async (productId: string, quantity: number, cartItemId?: string) => {
    if (!isAuthenticated) return;
    try {
      if (quantity === 0 && cartItemId) {
        await removeCartItem(cartItemId);
      } else if (cartItemId) {
        await updateCartItem(cartItemId, quantity);
      } else if (quantity > 0) {
        const response = await addItemToCart({ productId, quantity });
        setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, cartItemId: response.id } : p)));
      }
    } catch {
      const cartItem = cartState.items.find((i) => i.id === productId && i.marketId === marketId);
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity: cartItem?.quantity || quantity, cartItemId: cartItem?.cartItemId } : p)));
    }
  };

  const updateProductQuantity = async (product: ProductWithQuantity, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(product.id);
      await syncCartItem(product.id, 0, product.cartItemId);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, quantity: 0, cartItemId: undefined } : p)));
    } else {
      if (product.quantity === 0) {
        addItem({ id: product.id, name: product.name, price: product.price, image: product.image || "", marketName: market?.name || "Mercado", marketId: product.marketId });
        await syncCartItem(product.id, newQuantity, product.cartItemId);
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, quantity: newQuantity } : p)));
      } else {
        updateQuantity(product.id, newQuantity);
        await syncCartItem(product.id, newQuantity, product.cartItemId);
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, quantity: newQuantity } : p)));
      }
    }
  };

  const handleAddProduct = async (product: ProductWithQuantity) => {
    await updateProductQuantity(product, product.quantity + 1);
  };

  const handleRemoveProduct = async (product: ProductWithQuantity) => {
    await updateProductQuantity(product, Math.max(0, product.quantity - 1));
  };

  const handleCloseModal = () => {
    setAlternativesModalVisible(false);
    setCurrentProduct(null);
    setAlternatives([]);
  };

  const handleShowAlternatives = async (product: ProductWithQuantity) => {
    setCurrentProduct(product);
    setAlternativesModalVisible(true);
    setLoadingAlternatives(true);
    try {
      const searchTerm = product.name.split(" ")[0];
      const response = await getProducts(1, 50, marketId, searchTerm, undefined, undefined, product.categoryId);
      setAlternatives(response.products.filter((p) => p.id !== product.id));
    } catch {
      setAlternatives([]);
    } finally {
      setLoadingAlternatives(false);
    }
  };

  const replaceProductInList = (prev: ProductWithQuantity[], oldId: string, newProduct: ProductWithQuantity) => {
    const oldIndex = prev.findIndex((p) => p.id === oldId);
    const existingIndex = prev.findIndex((p) => p.id === newProduct.id);
    const newArray = [...prev];

    if (existingIndex !== -1 && existingIndex !== oldIndex) {
      const existing = newArray[existingIndex];
      const updatedExisting = { ...existing, quantity: existing.quantity + newProduct.quantity };
      newArray.splice(Math.max(existingIndex, oldIndex), 1);
      newArray.splice(Math.min(existingIndex, oldIndex), 1);
      newArray.splice(oldIndex - (existingIndex < oldIndex ? 1 : 0), 0, updatedExisting);
      return newArray;
    } else if (existingIndex === oldIndex) {
      return prev;
    } else {
      newArray.splice(oldIndex, 1, newProduct);
      return newArray;
    }
  };

  const handleReplaceProduct = async (newProduct: Product) => {
    if (!currentProduct) return;

    const oldQuantity = currentProduct.quantity;
    const oldCartItemId = currentProduct.cartItemId;
    const newProductWithQuantity: ProductWithQuantity = {
      ...newProduct,
      quantity: oldQuantity,
      categoryId: currentProduct.categoryId,
      type: currentProduct.type,
    };

    if (oldQuantity > 0) {
      removeItem(currentProduct.id);
      if (isAuthenticated && oldCartItemId) {
        try {
          await removeCartItem(oldCartItemId);
        } catch {
        }
      }

      setProducts((prev) => {
        const existingIndex = prev.findIndex((p) => p.id === newProduct.id);
        if (existingIndex !== -1) {
          const existing = prev[existingIndex];
          const newTotalQuantity = existing.quantity + oldQuantity;
          updateQuantity(newProduct.id, newTotalQuantity);
          if (isAuthenticated && existing.cartItemId) {
            updateCartItem(existing.cartItemId, newTotalQuantity).catch(() => {});
          }
          return replaceProductInList(prev, currentProduct.id, { ...existing, quantity: newTotalQuantity });
        } else {
          addItem({
            id: newProduct.id,
            name: newProduct.name,
            price: newProduct.price,
            image: newProduct.image || "",
            marketName: market?.name || "Mercado",
            marketId: newProduct.marketId,
          });

          if (isAuthenticated) {
            addItemToCart({ productId: newProduct.id, quantity: oldQuantity })
              .then((response) => {
                setProducts((prevState) => {
                  if (prevState.find((p) => p.id === newProduct.id)) {
                    return prevState.map((p) => (p.id === newProduct.id ? { ...p, cartItemId: response.id } : p));
                  }
                  return replaceProductInList(prevState, currentProduct.id, { ...newProductWithQuantity, cartItemId: response.id });
                });
              })
              .catch(() => {
                setProducts((prevState) => {
                  if (prevState.find((p) => p.id === newProduct.id)) return prevState;
                  return replaceProductInList(prevState, currentProduct.id, newProductWithQuantity);
                });
              });
          }

          return replaceProductInList(prev, currentProduct.id, newProductWithQuantity);
        }
      });
    } else {
      setProducts((prev) => replaceProductInList(prev, currentProduct.id, newProductWithQuantity));
    }

    handleCloseModal();
  };

  const groupedProducts = useMemo(() => {
    const essential: ProductWithQuantity[] = [];
    const common: ProductWithQuantity[] = [];
    const utensil: ProductWithQuantity[] = [];

    products.forEach((product) => {
      if (product.type === "essential") {
        essential.push(product);
      } else if (product.type === "common") {
        common.push(product);
      } else if (product.type === "utensil") {
        utensil.push(product);
      }
    });

    return { essential, common, utensil };
  }, [products]);

  const { total, itemCount, hasSelectedProducts } = useMemo(() => {
    const selected = products.filter((p) => p.quantity > 0);
    return {
      total: selected.reduce((sum, p) => sum + p.price * p.quantity, 0),
      itemCount: selected.reduce((sum, p) => sum + p.quantity, 0),
      hasSelectedProducts: selected.length > 0,
    };
  }, [products]);

  const renderImage = (image: string | undefined, size: number, iconSize: number) => (
    image ? (
      <Image source={{ uri: image }} style={[styles.imageBase, { width: size, height: size }]} />
    ) : (
      <View style={[styles.imageBase, styles.imagePlaceholder, { width: size, height: size, backgroundColor: paperTheme.colors.surfaceVariant }]}>
        <Ionicons name="cube-outline" size={iconSize} color={paperTheme.colors.onSurfaceVariant} />
      </View>
    )
  );

  const renderProductCard = (product: ProductWithQuantity) => (
    <View
      key={product.id}
      style={[
        styles.productCard,
        { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outline },
      ]}
    >
      <View style={styles.productContent}>
        {renderImage(product.image, 80, 24)}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={[styles.productName, { color: paperTheme.colors.onSurface }]} numberOfLines={2}>
              {product.name}
            </Text>
            <TouchableOpacity onPress={() => handleShowAlternatives(product)} style={styles.replaceButton}>
              <Ionicons name="swap-horizontal" size={18} color={paperTheme.colors.primary} />
            </TouchableOpacity>
          </View>
          {product.unit && (
            <Text style={[styles.productUnit, { color: paperTheme.colors.onSurfaceVariant }]}>
              {product.unit}
            </Text>
          )}
          <Text style={[styles.productPrice, { color: paperTheme.colors.primary }]}>
            R$ {product.price.toFixed(2)}
          </Text>
        </View>
      </View>
      <View style={styles.quantityContainer}>
        <Text style={[styles.quantityLabel, { color: paperTheme.colors.onSurface }]}>Quantidade</Text>
        <View style={[styles.quantityControls, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
          <TouchableOpacity
            onPress={() => handleRemoveProduct(product)}
            disabled={product.quantity === 0}
            style={[styles.quantityButton, { backgroundColor: product.quantity === 0 ? paperTheme.colors.surfaceVariant : paperTheme.colors.primary }]}
          >
            <Ionicons name="remove" size={18} color={product.quantity === 0 ? paperTheme.colors.onSurfaceVariant : "white"} />
          </TouchableOpacity>
          <View style={styles.quantityValue}>
            <Text style={[styles.quantityText, { color: paperTheme.colors.onSurface }]}>{product.quantity}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleAddProduct(product)}
            style={[styles.quantityButton, { backgroundColor: paperTheme.colors.primary }]}
          >
            <Ionicons name="add" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSection = (title: string, productsList: ProductWithQuantity[]) => {
    if (productsList.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={[styles.sectionHeader, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
          <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>{title}</Text>
        </View>
        {productsList.map((product) => renderProductCard(product))}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={paperTheme.colors.onSurface} />
      </TouchableOpacity>
      {market && (
        <View style={styles.headerContent}>
          {market.logo && <Image source={{ uri: market.logo }} style={styles.marketLogo} />}
          <Text style={[styles.headerTitle, { color: paperTheme.colors.onSurface }]} numberOfLines={1}>
            {market.name}
          </Text>
        </View>
      )}
      {!market && <Text style={[styles.headerTitle, { color: paperTheme.colors.onSurface }]}>Produtos</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
          <Text style={{ color: paperTheme.colors.onBackground, marginTop: 10 }}>Carregando produtos...</Text>
        </View>
      </View>
    );
  }

  if (error || !market) {
    return (
      <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
        <Header />
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={paperTheme.colors.error} />
          <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>{error || "Erro ao carregar produtos"}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Header />
      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 200, 220) },
        ]}
        showsVerticalScrollIndicator={true}
        indicatorStyle={paperTheme.dark ? "white" : "default"}
      >
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={paperTheme.colors.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}>
              Nenhum produto encontrado
            </Text>
          </View>
        ) : (
          <>
            {renderSection("Produtos Essenciais", groupedProducts.essential)}
            {renderSection("Produtos Comuns", groupedProducts.common)}
            {renderSection("Utensílios", groupedProducts.utensil)}
          </>
        )}
      </ScrollView>

      {hasSelectedProducts && (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: paperTheme.colors.surface,
              borderTopColor: paperTheme.colors.outline,
              paddingBottom: Math.max(insets.bottom + 50, 70),
            },
          ]}
        >
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { color: paperTheme.colors.onSurface }]}>
              Total ({itemCount} {itemCount === 1 ? "item" : "itens"})
            </Text>
            <Text style={[styles.totalValue, { color: paperTheme.colors.primary }]}>R$ {total.toFixed(2)}</Text>
          </View>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("Checkout")}
            style={[styles.checkoutButton, { backgroundColor: paperTheme.colors.primary }]}
            contentStyle={styles.checkoutButtonContent}
            labelStyle={[styles.checkoutButtonLabel, { color: paperTheme.colors.onPrimary }]}
            icon={() => <Ionicons name="cart" size={19} color={paperTheme.colors.onPrimary} />}
          >
            Finalizar Compra
          </Button>
        </View>
      )}

      <Modal
        visible={alternativesModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: paperTheme.colors.surface, paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: paperTheme.colors.onSurface }]}>
                Escolher Alternativa
              </Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color={paperTheme.colors.onSurface} />
              </TouchableOpacity>
            </View>
            {currentProduct && (
              <View style={[styles.currentProductCard, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
                <Text style={[styles.currentProductLabel, { color: paperTheme.colors.onSurfaceVariant }]}>
                  Produto atual:
                </Text>
                <Text style={[styles.currentProductName, { color: paperTheme.colors.onSurface }]}>
                  {currentProduct.name}
                </Text>
              </View>
            )}
            {loadingAlternatives ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color={paperTheme.colors.primary} />
                <Text style={[styles.modalLoadingText, { color: paperTheme.colors.onSurfaceVariant }]}>
                  Carregando alternativas...
                </Text>
              </View>
            ) : alternatives.length === 0 ? (
              <View style={styles.modalEmptyContainer}>
                <Ionicons name="cube-outline" size={48} color={paperTheme.colors.onSurfaceVariant} />
                <Text style={[styles.modalEmptyText, { color: paperTheme.colors.onSurfaceVariant }]}>
                  Nenhuma alternativa encontrada
                </Text>
              </View>
            ) : (
              <FlatList
                data={alternatives}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.alternativeCard,
                      { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outline },
                    ]}
                    onPress={() => handleReplaceProduct(item)}
                  >
                    {renderImage(item.image, 60, 20)}
                    <View style={styles.alternativeInfo}>
                      <Text style={[styles.alternativeName, { color: paperTheme.colors.onSurface }]} numberOfLines={2}>
                        {item.name}
                      </Text>
                      {item.unit && (
                        <Text style={[styles.alternativeUnit, { color: paperTheme.colors.onSurfaceVariant }]}>
                          {item.unit}
                        </Text>
                      )}
                      <Text style={[styles.alternativePrice, { color: paperTheme.colors.primary }]}>
                        R$ {item.price.toFixed(2)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={paperTheme.colors.onSurfaceVariant} />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.modalListContent}
                showsVerticalScrollIndicator={true}
                indicatorStyle={paperTheme.dark ? "white" : "default"}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  marketLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  productCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  productContent: {
    flexDirection: "row",
    marginBottom: 16,
  },
  imageBase: {
    borderRadius: 12,
    marginRight: 12,
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  replaceButton: {
    padding: 4,
  },
  productUnit: {
    fontSize: 12,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityValue: {
    minWidth: 40,
    alignItems: "center",
    marginHorizontal: 10,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  checkoutButton: {
    borderRadius: 12,
  },
  checkoutButtonContent: {
    paddingVertical: 10,
  },
  checkoutButtonLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalCloseButton: {
    padding: 4,
  },
  currentProductCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  currentProductLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  currentProductName: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalLoadingContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },
  modalLoadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  modalEmptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },
  modalEmptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  modalListContent: {
    padding: 16,
  },
  alternativeCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  alternativeInfo: {
    flex: 1,
  },
  alternativeName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  alternativeUnit: {
    fontSize: 12,
    marginBottom: 4,
  },
  alternativePrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

