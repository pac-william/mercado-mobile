import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCustomTheme } from '../../hooks/useCustomTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeStackParamList } from '../../../App';
import { Header } from '../../components/layout/header';
import CustomModal from '../../components/ui/CustomModal';
import Button from '../../components/ui/Button';
import LoadingScreen from '../../components/ui/LoadingScreen';
import EmptyState from '../../components/ui/EmptyState';
import { CartItem, useCart } from '../../contexts/CartContext';
import { useModal } from '../../hooks/useModal';
import { useSession } from '../../hooks/useSession';
import { getCart, mapCartItemResponseToCartItem, removeCartItem, clearCart as clearCartAPI, updateCartItem } from '../../services/cartService';
import { SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZE, ICON_SIZES } from '../../constants/styles';
import { formatCurrency } from '../../utils/format';


type CartScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const CartScreen: React.FC = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { state: cartState, removeItem, updateQuantity, clearCart, addItem } = useCart();
  const { modalState, hideModal, showWarning } = useModal();
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const paperTheme = useCustomTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const isLoadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);
  const cartStateRef = useRef(cartState);
  
  useEffect(() => {
    cartStateRef.current = cartState;
  }, [cartState]);

  const loadCart = useCallback(async (forceReload = false) => {
    if (!isAuthenticated) {
      setLoading(false);
      isLoadingRef.current = false;
      return;
    }

    const now = Date.now();
    if (now - lastLoadTimeRef.current < 1000 && !forceReload) {
      return;
    }

    if (hasLoadedOnce && !forceReload) {
      return;
    }

    if (isLoadingRef.current) {
      return;
    }

    try {
      isLoadingRef.current = true;
      lastLoadTimeRef.current = now;
      setLoading(true);
      const carts = await getCart();
      
      const serverItemsMap = new Map<string, { cartItem: CartItem; quantity: number }>();
      
      for (const cart of carts) {
        for (const item of cart.items ?? []) {
          const cartItem = mapCartItemResponseToCartItem(item, cart.marketName);
          const uniqueKey = `${String(cartItem.id)}_${cartItem.marketId}`;
          
          if (!serverItemsMap.has(uniqueKey)) {
            serverItemsMap.set(uniqueKey, {
              cartItem,
              quantity: item.quantity,
            });
          }
        }
      }
      
      const currentLocalItems = cartStateRef.current.items;
      const localItemsMap = new Map<string, CartItem>();
      
      for (const item of currentLocalItems) {
        const uniqueKey = `${String(item.id)}_${item.marketId}`;
        localItemsMap.set(uniqueKey, item);
      }
      
      const mergedItems: CartItem[] = [];
      const processedKeys = new Set<string>();
      
      for (const [key, { cartItem, quantity }] of serverItemsMap) {
        const localItem = localItemsMap.get(key);
        
        if (localItem) {
          mergedItems.push({
            ...localItem,
            cartItemId: cartItem.cartItemId,
            quantity: quantity,
          });
        } else {
          mergedItems.push({
            ...cartItem,
            quantity: quantity,
          });
        }
        
        processedKeys.add(key);
      }
      
      for (const [key, localItem] of localItemsMap) {
        if (!processedKeys.has(key) && !localItem.cartItemId) {
          mergedItems.push(localItem);
        }
      }
      
      const needsUpdate = mergedItems.length !== localItemsMap.size ||
        mergedItems.some(item => {
          const key = `${String(item.id)}_${item.marketId}`;
          const current = localItemsMap.get(key);
          return !current || 
            current.quantity !== item.quantity || 
            current.cartItemId !== item.cartItemId;
        });
      
      if (needsUpdate) {
        clearCart();
        
        for (const item of mergedItems) {
          addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            marketName: item.marketName,
            marketId: item.marketId,
            cartItemId: item.cartItemId,
          });
          
          if (item.quantity !== 1) {
            updateQuantity(item.id, item.quantity);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
      setHasLoadedOnce(true);
    }
  }, [isAuthenticated, clearCart, addItem, updateQuantity]);

  useEffect(() => {
    if (!sessionLoading && isAuthenticated && !hasLoadedOnce) {
      loadCart();
    } else if (!sessionLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [sessionLoading, isAuthenticated, hasLoadedOnce, loadCart]);

  const loadCartRef = useRef(loadCart);
  
  useEffect(() => {
    loadCartRef.current = loadCart;
  }, [loadCart]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && !sessionLoading && !isLoadingRef.current) {
        const timer = setTimeout(() => {
          if (!isLoadingRef.current) {
            loadCartRef.current(true);
          }
        }, 200);
        return () => clearTimeout(timer);
      }
    }, [isAuthenticated, sessionLoading])
  );



  const handleRemoveItem = async (id: string, name: string) => {
    showWarning(
      'Remover Item',
      `Deseja remover "${name}" do seu carrinho?`,
      {
        text: 'Remover',
        onPress: async () => {
          try {
            const item = cartState.items.find(i => String(i.id) === String(id));
            
            if (isAuthenticated && item?.cartItemId) {
              try {
                await removeCartItem(item.cartItemId);
              } catch (apiError) {
                console.error("Erro ao remover item da API:", apiError);
              }
            }
            
            removeItem(id);
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

  const handleClearCart = async () => {
    showWarning(
      'Limpar Carrinho',
      'Deseja remover todos os itens do seu carrinho? Esta ação não pode ser desfeita.',
      {
        text: 'Limpar Tudo',
        onPress: async () => {
          try {
            if (isAuthenticated) {
              try {
                await clearCartAPI();
              } catch (apiError) {
                console.error("Erro ao limpar carrinho na API:", apiError);
              }
            }
            
            clearCart();
            setHasLoadedOnce(false);
            hideModal();
          } catch (error) {
            console.error("Erro ao limpar carrinho:", error);
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

  const groupedByMarket = useMemo(() => {
    const groups: Record<string, { marketId: string; marketName: string; items: CartItem[]; total: number; itemCount: number }> = {};
    
    cartState.items.forEach((item) => {
      const key = item.marketId;
      if (!groups[key]) {
        groups[key] = {
          marketId: item.marketId,
          marketName: item.marketName,
          items: [],
          total: 0,
          itemCount: 0,
        };
      }
      groups[key].items.push(item);
      groups[key].total += item.price * item.quantity;
      groups[key].itemCount += item.quantity;
    });
    
    return Object.values(groups);
  }, [cartState.items]);

  const handleCheckout = (marketId?: string, items?: CartItem[]) => {
    navigation.navigate('Checkout', { marketId, items } as never);
  };

  if (loading || sessionLoading) {
    return <LoadingScreen message="Carregando carrinho..." />;
  }

  if (cartState.items.length === 0) {
    return (
      <EmptyState
        icon="cart-outline"
        title="Carrinho Vazio"
        message="Adicione alguns produtos ao seu carrinho para começar suas compras"
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Header />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : SPACING.xlBase}
      >
        <View style={styles.scrollContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom + SPACING.jumbo * 4 + SPACING.xlBase, SPACING.jumbo * 4 + SPACING.xlBase) }
            ]}
            showsVerticalScrollIndicator={true}
            bounces={true}
            indicatorStyle={paperTheme.dark ? 'white' : 'default'}
          >
          <View style={[styles.headerCard, { backgroundColor: paperTheme.colors.surface }]}>
            <Text style={[styles.headerTitle, { color: paperTheme.colors.onSurface }]}>
              Meu Carrinho ({cartState.itemCount} {cartState.itemCount === 1 ? 'item' : 'itens'})
            </Text>
            <TouchableOpacity
              onPress={handleClearCart}
              style={[styles.clearButton, { backgroundColor: paperTheme.colors.errorBackground }]}
            >
              <Ionicons name="trash-outline" size={ICON_SIZES.sm} color={paperTheme.colors.errorText} />
              <Text style={[styles.clearButtonText, { color: paperTheme.colors.errorText }]}>
                Limpar
              </Text>
            </TouchableOpacity>
          </View>

          {groupedByMarket.map((group, groupIndex) => (
            <View key={group.marketId} style={[styles.groupContainer, { marginTop: groupIndex > 0 ? SPACING.xl : SPACING.sm }]}>
              <View style={[styles.marketCard, { backgroundColor: paperTheme.colors.surface }]}>
                <View style={styles.marketHeader}>
                  <Ionicons name="storefront" size={ICON_SIZES.lg} color={paperTheme.colors.primary} />
                  <Text style={[styles.marketName, { color: paperTheme.colors.onSurface }]}>
                    {group.marketName}
                  </Text>
                </View>
                <Text style={[styles.marketItemCount, { color: paperTheme.colors.onSurfaceVariant }]}>
                  {group.itemCount} {group.itemCount === 1 ? 'item' : 'itens'}
                </Text>
              </View>

              {group.items.map((item) => (
            <View key={item.id} style={[styles.itemCard, { backgroundColor: paperTheme.colors.surface, shadowColor: paperTheme.colors.modalShadow }]}>
              <View style={styles.itemContent}>
                <View style={styles.itemInfo}>
                  <Image
                    source={{ uri: item.image }}
                    style={[styles.itemImage, { backgroundColor: paperTheme.colors.surfaceVariant }]}
                    resizeMode="contain"
                  />

                  <View style={styles.itemDetails}>
                    <View>
                      <Text style={[styles.itemName, { color: paperTheme.colors.onSurface }]}>
                        {item.name}
                      </Text>

                      <Text style={[styles.itemMarket, { color: paperTheme.colors.onSurface }]}>
                        {item.marketName}
                      </Text>
                    </View>

                    <Text style={[styles.itemPrice, { color: paperTheme.colors.primary }]}>
                      {formatCurrency(item.price)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleRemoveItem(item.id, item.name)}
                  style={[styles.removeButton, { backgroundColor: paperTheme.colors.errorBackground }]}
                >
                  <Ionicons name="close" size={ICON_SIZES.sm + SPACING.micro} color={paperTheme.colors.errorText} />
                </TouchableOpacity>
              </View>

              <View style={styles.quantityContainer}>
                <Text style={[styles.quantityLabel, { color: paperTheme.colors.onSurface }]}>
                  Quantidade
                </Text>

                <View style={[styles.quantityControls, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
                  <TouchableOpacity
                    onPress={async () => {
                      const newQuantity = Math.max(1, item.quantity - 1);
                      updateQuantity(item.id, newQuantity);
                      
                      if (isAuthenticated && item.cartItemId) {
                        try {
                          await updateCartItem(item.cartItemId, newQuantity);
                        } catch (apiError) {
                          console.error("Erro ao atualizar quantidade na API:", apiError);
                        }
                      }
                    }}
                    style={[
                      styles.quantityButton,
                      {
                        backgroundColor: item.quantity <= 1 ? paperTheme.colors.outline : paperTheme.colors.secondary,
                        shadowColor: item.quantity <= 1 ? 'transparent' : paperTheme.colors.secondary,
                        elevation: item.quantity <= 1 ? 0 : 3,
                      }
                    ]}
                    disabled={item.quantity <= 1}
                  >
                    <Ionicons
                      name="remove"
                      size={ICON_SIZES.xlPlus}
                      color={item.quantity <= 1 ? paperTheme.colors.textSecondary : paperTheme.colors.white}
                    />
                  </TouchableOpacity>

                  <View style={styles.quantityValue}>
                    <Text style={[styles.quantityText, { color: paperTheme.colors.onSurface }]}>
                      {item.quantity}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={async () => {
                      const newQuantity = item.quantity + 1;
                      updateQuantity(item.id, newQuantity);
                      
                      if (isAuthenticated && item.cartItemId) {
                        try {
                          await updateCartItem(item.cartItemId, newQuantity);
                        } catch (apiError) {
                          console.error("Erro ao atualizar quantidade na API:", apiError);
                        }
                      }
                    }}
                    style={[styles.quantityButton, { backgroundColor: paperTheme.colors.secondary, shadowColor: paperTheme.colors.secondary }]}
                  >
                    <Ionicons name="add" size={ICON_SIZES.xlPlus} color={paperTheme.colors.white} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.subtotalRow, { borderTopColor: paperTheme.colors.outline, backgroundColor: paperTheme.colors.surfaceVariant }]}>
                <Text style={[styles.subtotalLabel, { color: paperTheme.colors.onSurface }]}>
                  Subtotal
                </Text>
                <Text style={[styles.subtotalValue, { color: paperTheme.colors.primary }]}>
                  {formatCurrency(item.price * item.quantity)}
                </Text>
              </View>
            </View>
              ))}

              <View style={[styles.groupTotalCard, { backgroundColor: paperTheme.colors.surface, shadowColor: paperTheme.colors.modalShadow }]}>
                <View style={styles.groupTotalRow}>
                  <Text style={[styles.groupTotalLabel, { color: paperTheme.colors.onSurface }]}>
                    Subtotal {group.marketName}
                  </Text>
                  <Text style={[styles.groupTotalValue, { color: paperTheme.colors.primary }]}>
                    {formatCurrency(group.total)}
                  </Text>
                </View>

                <Button
                  title="Adicionar mais produtos"
                  onPress={() => navigation.navigate('MarketDetails', { marketId: group.marketId })}
                  variant="ghost"
                  size="medium"
                  icon={{
                    name: "add-circle-outline",
                    position: "left",
                  }}
                  style={{ marginBottom: SPACING.md }}
                />

                <Button
                  title={`Finalizar Pedido - ${group.marketName}`}
                  onPress={() => handleCheckout(group.marketId, group.items)}
                  variant="primary"
                  size="large"
                  icon={{
                    name: "card",
                    position: "left",
                  }}
                  fullWidth
                />
              </View>
            </View>
          ))}

          {groupedByMarket.length > 1 && (
            <View style={[styles.generalTotalCard, { backgroundColor: paperTheme.colors.surface, shadowColor: paperTheme.colors.modalShadow }]}>
              <View style={styles.generalTotalRow}>
                <Text style={[styles.generalTotalLabel, { color: paperTheme.colors.onSurface }]}>
                  Total Geral
                </Text>
                <Text style={[styles.generalTotalValue, { color: paperTheme.colors.primary }]}>
                  {formatCurrency(cartState.total)}
                </Text>
              </View>
              <Text style={[styles.generalTotalSubtext, { color: paperTheme.colors.onSurfaceVariant }]}>
                Você tem {groupedByMarket.length} {groupedByMarket.length === 1 ? 'pedido' : 'pedidos'} separados
              </Text>
            </View>
          )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Modal customizado */}
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
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.smPlus,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.large,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.smPlus,
    paddingVertical: SPACING.micro + SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  clearButtonText: {
    fontSize: FONT_SIZE.sm,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  groupContainer: {
    marginTop: SPACING.sm,
  },
  marketCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.large,
  },
  marketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  marketName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  marketItemCount: {
    fontSize: FONT_SIZE.md,
  },
  itemCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    shadowOffset: { width: 0, height: SPACING.xs },
    shadowOpacity: 0.1,
    shadowRadius: SPACING.md,
    elevation: 6,
    overflow: 'hidden',
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.mdPlus,
    paddingBottom: SPACING.smPlus,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  itemImage: {
    width: SPACING.xxxl + SPACING.xlBase + SPACING.micro,
    height: SPACING.xxxl + SPACING.xlBase + SPACING.micro,
    borderRadius: SPACING.smPlus,
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.smPlus,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: FONT_SIZE.md + SPACING.micro,
    fontWeight: 'bold',
    marginBottom: SPACING.micro + 1,
    lineHeight: SPACING.xlBase,
  },
  itemMarket: {
    fontSize: FONT_SIZE.sm + 1,
    opacity: 0.7,
    marginBottom: SPACING.xs,
  },
  itemPrice: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: 'bold',
  },
  removeButton: {
    width: SPACING.xxxl - SPACING.smPlus,
    height: SPACING.xxxl - SPACING.smPlus,
    borderRadius: SPACING.md + SPACING.micro,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xsPlus,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.mdPlus,
    paddingBottom: SPACING.smPlus,
  },
  quantityLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SPACING.xxxl - SPACING.smPlus,
    paddingHorizontal: SPACING.micro + SPACING.xs,
    paddingVertical: SPACING.micro + 1,
  },
  quantityButton: {
    width: SPACING.xxxl - SPACING.xs,
    height: SPACING.xxxl - SPACING.xs,
    borderRadius: SPACING.lgPlus,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: SPACING.micro },
    shadowOpacity: 0.2,
    shadowRadius: SPACING.xs,
    elevation: 3,
  },
  quantityValue: {
    minWidth: SPACING.xxxl,
    alignItems: 'center',
    marginHorizontal: SPACING.smPlus,
  },
  quantityText: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: 'bold',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.mdPlus,
    paddingBottom: SPACING.mdPlus,
    paddingTop: SPACING.smPlus,
    borderTopWidth: 1,
  },
  subtotalLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  subtotalValue: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: 'bold',
  },
  groupTotalCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.large,
  },
  groupTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  groupTotalLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  groupTotalValue: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: 'bold',
  },
  generalTotalCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.large,
  },
  generalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  generalTotalLabel: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: 'bold',
  },
  generalTotalValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
  },
  generalTotalSubtext: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});