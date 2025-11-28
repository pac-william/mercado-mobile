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
  Platform,
} from "react-native";
import { Text } from "react-native-paper";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeStackParamList } from "../../../App";
import { Header } from "../../components/layout/header";
import Button from "../../components/ui/Button";
import QuantitySelector from "../../components/ui/QuantitySelector";
import CustomModal from "../../components/ui/CustomModal";
import { useModal } from "../../hooks/useModal";
import { getSuggestionById } from "../../services/suggestionService";
import { getProducts, Product } from "../../services/productService";
import { getMarketById } from "../../services/marketService";
import { Suggestion } from "../../types/suggestion";
import { useCart } from "../../contexts/CartContext";
import { useSession } from "../../hooks/useSession";
import { addItemToCart, addMultipleItemsToCart, updateCartItem, removeCartItem } from "../../services/cartService";
import { formatCurrency } from "../../utils/format";
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES, SHADOWS } from "../../constants/styles";
import { getScreenBottomPadding, getTabBarHeight, getTabBarPaddingBottom } from "../../utils/tabBarUtils";

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
  const paperTheme = useCustomTheme();
  const insets = useSafeAreaInsets();
  const { suggestionId, marketId, products: cachedProducts } = route.params as { 
    suggestionId: string; 
    marketId: string; 
    products?: Product[] 
  };
  const { addItem, updateQuantity, removeItem, state: cartState } = useCart();
  const { isAuthenticated } = useSession();
  const { modalState, hideModal, showWarning } = useModal();
  
  const bottomPadding = getScreenBottomPadding(insets);
  const tabBarHeight = getTabBarHeight(insets);
  const tabBarPaddingBottom = getTabBarPaddingBottom(insets);

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
    
    for (const product of products) {
      if (productsMap.has(product.id)) {
        continue;
      }
      
      let mapped = false;
      for (const item of suggestionItems) {
        const normalizedProductName = product.name.toLowerCase();
        const normalizedItemName = item.name.toLowerCase();
        
        if (normalizedProductName.includes(normalizedItemName) || normalizedItemName.includes(normalizedProductName)) {
          productsMap.set(product.id, { categoryId: item.categoryId, type: item.type });
          mapped = true;
          break;
        }
      }
      
      if (!mapped && suggestionItems.length > 0) {
        productsMap.set(product.id, { 
          categoryId: suggestionItems[0].categoryId, 
          type: suggestionItems[0].type 
        });
      }
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
        const cartResponse = await addItemToCart({ productId, quantity });
        const addedItem = cartResponse.items.find(item => item.productId === productId);
        setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, cartItemId: addedItem?.id } : p)));
      }
    } catch {
      const cartItem = cartState.items.find((i) => i.id === productId && i.marketId === marketId);
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity: cartItem?.quantity || quantity, cartItemId: cartItem?.cartItemId } : p)));
    }
  };

  const updateProductQuantity = (product: ProductWithQuantity, newQuantity: number) => {
    const cartItem = cartState.items.find((i) => i.id === product.id && i.marketId === marketId);
    const isInCart = cartItem !== undefined || product.cartItemId !== undefined;
    const previousQuantity = product.quantity;

    if (newQuantity === 0) {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, quantity: 0 } : p)));
      if (isInCart) {
        removeItem(product.id);
        syncCartItem(product.id, 0, product.cartItemId).catch(() => {
          setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, quantity: previousQuantity } : p)));
          addItem({ id: product.id, name: product.name, price: product.price, image: product.image || "", marketName: market?.name || "Mercado", marketId: product.marketId });
          if (previousQuantity > 1) {
            updateQuantity(product.id, previousQuantity);
          }
        });
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, cartItemId: undefined } : p)));
      }
    } else {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, quantity: newQuantity } : p)));
      
      if (isInCart) {
        if (!cartItem) {
          addItem({ id: product.id, name: product.name, price: product.price, image: product.image || "", marketName: market?.name || "Mercado", marketId: product.marketId });
          if (newQuantity > 1) {
            updateQuantity(product.id, newQuantity);
          }
        } else {
          updateQuantity(product.id, newQuantity);
        }
        syncCartItem(product.id, newQuantity, product.cartItemId).catch(() => {
          setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, quantity: previousQuantity } : p)));
          if (cartItem) {
            updateQuantity(product.id, previousQuantity);
          } else {
            removeItem(product.id);
          }
        });
      }
    }
  };

  const handleAddProduct = (product: ProductWithQuantity) => {
    updateProductQuantity(product, product.quantity + 1);
  };

  const handleRemoveProduct = (product: ProductWithQuantity) => {
    updateProductQuantity(product, Math.max(0, product.quantity - 1));
  };

  const handleDeleteProduct = async (product: ProductWithQuantity) => {
    showWarning(
      'Remover Item',
      `Deseja remover "${product.name}" da lista?`,
      {
        text: 'Remover',
        onPress: async () => {
          try {
            const cartItem = cartState.items.find((i) => i.id === product.id && i.marketId === marketId);
            
            if (isAuthenticated && cartItem?.cartItemId) {
              try {
                await removeCartItem(cartItem.cartItemId);
              } catch (apiError) {
                console.error("Erro ao remover item da API:", apiError);
              }
            }
            
            if (cartItem) {
              removeItem(product.id);
            }
            
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
            hideModal();
          } catch (error) {
            console.error("Erro ao remover item:", error);
            hideModal();
          }
        },
        style: 'danger',
      },
      {
        text: 'Cancelar',
        onPress: hideModal,
      }
    );
  };

  const handleAddToCart = async () => {
    const productsToAdd = products.filter((p) => p.quantity > 0);
    const newProducts: ProductWithQuantity[] = [];
    const updateProducts: ProductWithQuantity[] = [];
    
    for (const product of productsToAdd) {
      const cartItem = cartState.items.find((i) => i.id === product.id && i.marketId === marketId);
      
      if (!cartItem) {
        newProducts.push(product);
      } else {
        if (cartItem.quantity !== product.quantity) {
          updateProducts.push(product);
        }
      }
    }
    
    for (const product of newProducts) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "",
        marketName: market?.name || "Mercado",
        marketId: product.marketId,
      });
      
      if (product.quantity > 1) {
        updateQuantity(product.id, product.quantity);
      }
    }
    
    for (const product of updateProducts) {
      updateQuantity(product.id, product.quantity);
    }
    
    if (isAuthenticated) {
      if (newProducts.length > 0) {
        try {
          const itemsToAdd = newProducts.map(p => ({
            productId: p.id,
            quantity: p.quantity
          }));
          
          const cartResponses = await addMultipleItemsToCart({ items: itemsToAdd });
          
          const cartItemIds: Record<string, string | undefined> = {};
          
          for (const cartResponse of cartResponses) {
            for (const item of cartResponse.items) {
              const product = newProducts.find(p => p.id === item.productId);
              if (product) {
                cartItemIds[item.productId] = item.id;
              }
            }
          }
          
          setProducts((prev) => prev.map((p) => 
            cartItemIds[p.id] !== undefined ? { ...p, cartItemId: cartItemIds[p.id] } : p
          ));
        } catch (error) {
          console.warn("Erro ao adicionar múltiplos itens, tentando individualmente:", error);
          
          for (const product of newProducts) {
            try {
              const cartResponse = await addItemToCart({ productId: product.id, quantity: product.quantity });
              const addedItem = cartResponse.items.find(item => item.productId === product.id);
              setProducts((prev) => prev.map((p) => 
                p.id === product.id ? { ...p, cartItemId: addedItem?.id } : p
              ));
            } catch {
              const cartItem = cartState.items.find((i) => i.id === product.id && i.marketId === marketId);
              setProducts((prev) => prev.map((p) => 
                p.id === product.id ? { ...p, cartItemId: cartItem?.cartItemId } : p
              ));
            }
          }
        }
      }
      
      if (updateProducts.length > 0) {
        for (const product of updateProducts) {
          const cartItem = cartState.items.find((i) => i.id === product.id && i.marketId === marketId);
          await syncCartItem(product.id, product.quantity, cartItem?.cartItemId);
        }
      }
    }
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
              .then((cartResponse) => {
                const addedItem = cartResponse.items.find(item => item.productId === newProduct.id);
                setProducts((prevState) => {
                  if (prevState.find((p) => p.id === newProduct.id)) {
                    return prevState.map((p) => (p.id === newProduct.id ? { ...p, cartItemId: addedItem?.id } : p));
                  }
                  return replaceProductInList(prevState, currentProduct.id, { ...newProductWithQuantity, cartItemId: addedItem?.id });
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

  const { total, itemCount, hasSelectedProducts, hasProductsInCart } = useMemo(() => {
    const selected = products.filter((p) => p.quantity > 0);
    const inCart = selected.filter((p) => {
      const cartItem = cartState.items.find((i) => i.id === p.id && i.marketId === marketId);
      return cartItem && cartItem.quantity > 0;
    });
    return {
      total: selected.reduce((sum, p) => sum + p.price * p.quantity, 0),
      itemCount: selected.reduce((sum, p) => sum + p.quantity, 0),
      hasSelectedProducts: selected.length > 0,
      hasProductsInCart: inCart.length > 0,
    };
  }, [products, cartState.items, marketId]);

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
        {renderImage(product.image, SPACING.xxxl + SPACING.xlBase, ICON_SIZES.lg)}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={[styles.productName, { color: paperTheme.colors.onSurface }]} numberOfLines={2}>
              {product.name}
            </Text>
            <View style={styles.productHeaderActions}>
              <TouchableOpacity onPress={() => handleShowAlternatives(product)} style={styles.replaceButton}>
                <Ionicons name="swap-horizontal" size={ICON_SIZES.xlPlus} color={paperTheme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDeleteProduct(product)} 
                style={[styles.deleteButton, { backgroundColor: paperTheme.colors.errorBackground }]}
              >
                <Ionicons name="trash-outline" size={ICON_SIZES.md} color={paperTheme.colors.errorText} />
              </TouchableOpacity>
            </View>
          </View>
          {product.unit && (
            <Text style={[styles.productUnit, { color: paperTheme.colors.onSurfaceVariant }]}>
              {product.unit}
            </Text>
          )}
          <View style={styles.productFooter}>
            <Text style={[styles.productPrice, { color: paperTheme.colors.primary }]}>
              {formatCurrency(product.price)}
            </Text>
            <QuantitySelector
              quantity={product.quantity}
              onIncrease={() => handleAddProduct(product)}
              onDecrease={() => handleRemoveProduct(product)}
              minQuantity={0}
              showLabel={false}
              showSubtotal={false}
              compact={true}
            />
          </View>
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
    <View style={[styles.header, { borderBottomColor: paperTheme.colors.borderLight }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={ICON_SIZES.xl} color={paperTheme.colors.onSurface} />
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
          <Ionicons name="alert-circle-outline" size={ICON_SIZES.xxxl + ICON_SIZES.xl} color={paperTheme.colors.error} />
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
          { paddingBottom: hasSelectedProducts ? tabBarHeight + 140 : bottomPadding },
        ]}
        showsVerticalScrollIndicator={true}
        indicatorStyle={paperTheme.dark ? "white" : "default"}
        keyboardShouldPersistTaps="handled"
      >
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={ICON_SIZES.xxxl + ICON_SIZES.xl} color={paperTheme.colors.onSurfaceVariant} />
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
              paddingBottom: Math.max(insets.bottom, SPACING.md),
              bottom: tabBarHeight - tabBarPaddingBottom,
              shadowColor: paperTheme.colors.modalShadow,
            },
          ]}
        >
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { color: paperTheme.colors.onSurface }]}>
              Total ({itemCount} {itemCount === 1 ? "item" : "itens"})
            </Text>
            <Text style={[styles.totalValue, { color: paperTheme.colors.primary }]}>{formatCurrency(total)}</Text>
          </View>
          <Button
            title="Adicionar mais produtos"
            onPress={() => navigation.navigate('MarketDetails', { marketId: marketId })}
            variant="ghost"
            size="medium"
            icon={{
              name: "add-circle-outline",
              position: "left",
            }}
            style={{ marginBottom: SPACING.md }}
            fullWidth
          />
          {!hasProductsInCart ? (
            <Button
              title="Adicionar ao Carrinho"
              onPress={handleAddToCart}
              variant="primary"
              size="large"
              icon={{
                name: "cart",
                position: "left",
              }}
              fullWidth
            />
          ) : (
            <Button
              title="Ir para Carrinho"
              onPress={() => navigation.navigate("Cart")}
              variant="primary"
              size="large"
              icon={{
                name: "cart",
                position: "left",
              }}
              fullWidth
            />
          )}
        </View>
      )}

      <Modal
        visible={alternativesModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={[styles.modalOverlay, { backgroundColor: paperTheme.colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: paperTheme.colors.surface, paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={[styles.modalHeader, { borderBottomColor: paperTheme.colors.borderLight }]}>
              <Text style={[styles.modalTitle, { color: paperTheme.colors.onSurface }]}>
                Escolher Alternativa
              </Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.modalCloseButton}>
                <Ionicons name="close" size={ICON_SIZES.xl} color={paperTheme.colors.onSurface} />
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
                <Ionicons name="cube-outline" size={SPACING.jumbo} color={paperTheme.colors.onSurfaceVariant} />
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
                    {renderImage(item.image, SPACING.xxxl + SPACING.xlBase, ICON_SIZES.xl)}
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
                        {formatCurrency(item.price)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={ICON_SIZES.lg} color={paperTheme.colors.onSurfaceVariant} />
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

      <CustomModal
        visible={modalState.visible}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        primaryButton={modalState.primaryButton}
        secondaryButton={modalState.secondaryButton}
      />
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  marketLogo: {
    width: SPACING.xxl,
    height: SPACING.xxl,
    borderRadius: BORDER_RADIUS.md,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: "600",
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xxl,
  },
  errorText: {
    fontSize: FONT_SIZE.lg,
    marginTop: SPACING.lg,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: SPACING.jumbo,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
  },
  productCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  productContent: {
    flexDirection: "row",
  },
  imageBase: {
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
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
    marginBottom: SPACING.xs,
  },
  productName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
    flex: 1,
    marginRight: SPACING.xs,
  },
  productHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  replaceButton: {
    padding: SPACING.xs,
  },
  deleteButton: {
    width: SPACING.xxl,
    height: SPACING.xxl,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  productUnit: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  productFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.xs,
  },
  productPrice: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: "bold",
    flex: 1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    ...SHADOWS.large,
    zIndex: 10,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  totalLabel: {
    fontSize: FONT_SIZE.md + 1,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: "600",
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  currentProductCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  currentProductLabel: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  currentProductName: {
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
  },
  modalLoadingContainer: {
    paddingVertical: SPACING.jumbo,
    alignItems: "center",
  },
  modalLoadingText: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.md,
  },
  modalEmptyContainer: {
    paddingVertical: SPACING.jumbo,
    alignItems: "center",
  },
  modalEmptyText: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.md,
  },
  modalListContent: {
    padding: SPACING.lg,
  },
  alternativeCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  alternativeInfo: {
    flex: 1,
  },
  alternativeName: {
    fontSize: FONT_SIZE.md + 1,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  alternativeUnit: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  alternativePrice: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
  },
});

