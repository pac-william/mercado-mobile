import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from "react-native";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../components/layout/header";
import { ScreenHeader } from "../../components/layout/ScreenHeader";
import LoadingScreen from "../../components/ui/LoadingScreen";
import { getOrderStatusColor, getOrderStatusText } from "../../utils/orderStatus";
import { formatCurrency, formatOrderDate } from "../../utils/format";
import StatusBadge from "../../components/ui/StatusBadge";
import Card from "../../components/ui/Card";
import { getOrderById } from "../../services/orderService";
import { getProductById } from "../../services/productService";
import { Order, OrderItem } from "../../domain/orderDomain";
import { SettingsStackParamList } from "../../navigation/types";
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES, SHADOWS } from "../../constants/styles";

type OrderDetailScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList, 'OrderDetail'>;

interface OrderItemWithProduct extends OrderItem {
  productName?: string;
  productImage?: string;
}


export default function OrderDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation<OrderDetailScreenNavigationProp>();
  const paperTheme = useCustomTheme();
  const insets = useSafeAreaInsets();
  const { orderId } = route.params as { orderId: string };

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(false);
        
        const orderData = await getOrderById(orderId);
        setOrder(orderData);

        if (orderData.items && orderData.items.length > 0) {
          const itemsWithProducts = await Promise.all(
            orderData.items.map(async (item) => {
              try {
                const product = await getProductById(item.productId);
                return {
                  ...item,
                  productName: product.name,
                  productImage: product.image,
                };
              } catch (error) {
                console.warn(`Erro ao buscar produto ${item.productId}:`, error);
                return {
                  ...item,
                  productName: `Produto #${item.productId.slice(0, 8)}`,
                  productImage: undefined,
                };
              }
            })
          );
          setOrderItems(itemsWithProducts);
        } else {
          setOrderItems([]);
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do pedido:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return <LoadingScreen message="Carregando detalhes do pedido..." />;
  }

  if (error || !order) {
    return (
      <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
        <Header />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={ICON_SIZES.xxxl + ICON_SIZES.xl} color={paperTheme.colors.error} />
          <Text style={[styles.errorText, { color: paperTheme.colors.onSurface }]}>
            Erro ao carregar pedido
          </Text>
          <Text style={[styles.errorSubtext, { color: paperTheme.colors.onSurfaceVariant }]}>
            Não foi possível carregar os detalhes do pedido. Tente novamente.
          </Text>
        </View>
      </View>
    );
  }

  const totalValue = order.total || order.totalPrice || 0;

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Header />
      <ScreenHeader title="Detalhes do Pedido" icon="receipt" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + SPACING.xxxl * 2 + SPACING.xlBase, SPACING.xxxl * 3),
          paddingTop: SPACING.smPlus,
        }}
        showsVerticalScrollIndicator={true}
        indicatorStyle={paperTheme.dark ? 'white' : 'default'}
      >
        {/* Card de informações do pedido */}
        <Card style={styles.orderInfoCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Ionicons name="receipt-outline" size={ICON_SIZES.xxl + SPACING.xs} color={paperTheme.colors.tertiary} />
              <View style={styles.orderInfo}>
                <Text style={[styles.orderId, { color: paperTheme.colors.onSurface }]}>
                  Pedido #{order.id.slice(0, 8).toUpperCase()}
                </Text>
                <Text style={[styles.orderDate, { color: paperTheme.colors.onSurfaceVariant }]}>
                  {formatOrderDate(order.createdAt)}
                </Text>
              </View>
            </View>
          </View>

          <StatusBadge status={order.status || 'PENDING'} />

          {order.paymentMethod && (
            <View style={styles.paymentInfo}>
              <Ionicons name="card-outline" size={ICON_SIZES.lg} color={paperTheme.colors.onSurfaceVariant} />
              <Text style={[styles.paymentText, { color: paperTheme.colors.onSurfaceVariant }]}>
                Método de pagamento: {order.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : order.paymentMethod}
              </Text>
            </View>
          )}
        </Card>

        {/* Lista de itens */}
        <Card style={styles.itemsCard}>
          <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>
            Itens do Pedido ({orderItems.length})
          </Text>

          {orderItems.length > 0 ? (
            orderItems.map((item, index) => (
              <View 
                key={item.id || index} 
                style={[
                  styles.itemRow, 
                  { borderBottomColor: paperTheme.colors.outline }
                ]}
              >
                {item.productImage && (
                  <Image
                    source={{ uri: item.productImage }}
                    style={[
                      styles.productImage,
                      { backgroundColor: paperTheme.colors.surfaceVariant }
                    ]}
                    resizeMode="contain"
                  />
                )}
                <View style={styles.itemInfo}>
                  <Text style={[styles.productName, { color: paperTheme.colors.onSurface }]}>
                    {item.productName || `Produto ${index + 1}`}
                  </Text>
                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemQuantity, { color: paperTheme.colors.onSurfaceVariant }]}>
                      Quantidade: {item.quantity}
                    </Text>
                    <Text style={[styles.itemPrice, { color: paperTheme.colors.primary }]}>
                      {formatCurrency(item.price * item.quantity)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.noItemsText, { color: paperTheme.colors.onSurfaceVariant }]}>
              Nenhum item encontrado
            </Text>
          )}
        </Card>

        {/* Resumo do pedido */}
        <View style={[styles.summaryCard, { backgroundColor: paperTheme.colors.surface, shadowColor: paperTheme.colors.modalShadow }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: paperTheme.colors.onSurface }]}>
              Total dos itens
            </Text>
            <Text style={[styles.summaryValue, { color: paperTheme.colors.onSurface }]}>
              {formatCurrency(totalValue)}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: paperTheme.colors.outline }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: paperTheme.colors.onSurface }]}>
              Total
            </Text>
            <Text style={[styles.totalValue, { color: paperTheme.colors.primary }]}>
              {formatCurrency(totalValue)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  errorText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    marginTop: SPACING.lg,
  },
  errorSubtext: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  orderInfoCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xlBase,
    ...SHADOWS.large,
  },
  orderHeader: {
    marginBottom: SPACING.lg,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  orderId: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  orderDate: {
    fontSize: FONT_SIZE.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  statusDot: {
    width: SPACING.smPlus,
    height: SPACING.smPlus,
    borderRadius: SPACING.xs + 1,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  paymentText: {
    fontSize: FONT_SIZE.md,
    marginLeft: SPACING.xs,
  },
  itemsCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xlBase,
    ...SHADOWS.large,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lgPlus,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
  },
  productImage: {
    width: SPACING.xxxl + SPACING.xlBase,
    height: SPACING.xxxl + SPACING.xlBase,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
  },
  itemInfo: {
    flex: 1,
  },
  productName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: FONT_SIZE.md,
  },
  itemPrice: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  noItemsText: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    paddingVertical: SPACING.xlBase,
  },
  summaryCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xlBase,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xlBase,
    ...SHADOWS.large,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.lg,
  },
  summaryValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
  },
});

