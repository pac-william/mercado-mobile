import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from "react-native";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../components/layout/header";
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

const getStatusColor = (status: string, colors: any) => {
  switch (status?.toUpperCase()) {
    case 'PENDENTE':
    case 'PENDING':
      return colors.statusPending;
    case 'CONFIRMADO':
    case 'CONFIRMED':
      return colors.statusConfirmed;
    case 'PREPARANDO':
    case 'PREPARING':
      return colors.statusPreparing;
    case 'SAIU_PARA_ENTREGA':
    case 'OUT_FOR_DELIVERY':
      return colors.statusOutForDelivery;
    case 'ENTREGUE':
    case 'DELIVERED':
      return colors.statusDelivered;
    case 'CANCELADO':
    case 'CANCELLED':
      return colors.statusCancelled;
    default:
      return colors.statusDefault;
  }
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'PENDENTE': 'Pendente',
    'PENDING': 'Pendente',
    'CONFIRMADO': 'Confirmado',
    'CONFIRMED': 'Confirmado',
    'PREPARANDO': 'Preparando',
    'PREPARING': 'Preparando',
    'SAIU_PARA_ENTREGA': 'Saiu para entrega',
    'OUT_FOR_DELIVERY': 'Saiu para entrega',
    'ENTREGUE': 'Entregue',
    'DELIVERED': 'Entregue',
    'CANCELADO': 'Cancelado',
    'CANCELLED': 'Cancelado',
  };
  return statusMap[status?.toUpperCase()] || status || 'Pendente';
};

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
    return (
      <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
          <Text style={[styles.loadingText, { color: paperTheme.colors.onBackground }]}>
            Carregando detalhes do pedido...
          </Text>
        </View>
      </View>
    );
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
  const statusColor = getStatusColor(order.status || 'PENDING', paperTheme.colors);
  const statusText = getStatusText(order.status || 'PENDING');

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Header />
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
        <View style={[styles.orderInfoCard, { backgroundColor: paperTheme.colors.surface, shadowColor: paperTheme.colors.modalShadow }]}>
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Ionicons name="receipt-outline" size={ICON_SIZES.xxl + SPACING.xs} color={paperTheme.colors.tertiary} />
              <View style={styles.orderInfo}>
                <Text style={[styles.orderId, { color: paperTheme.colors.onSurface }]}>
                  Pedido #{order.id.slice(0, 8).toUpperCase()}
                </Text>
                <Text style={[styles.orderDate, { color: paperTheme.colors.onSurfaceVariant }]}>
                  {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.statusContainer, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>

          {order.paymentMethod && (
            <View style={styles.paymentInfo}>
              <Ionicons name="card-outline" size={ICON_SIZES.lg} color={paperTheme.colors.onSurfaceVariant} />
              <Text style={[styles.paymentText, { color: paperTheme.colors.onSurfaceVariant }]}>
                Método de pagamento: {order.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : order.paymentMethod}
              </Text>
            </View>
          )}
        </View>

        {/* Lista de itens */}
        <View style={[styles.itemsCard, { backgroundColor: paperTheme.colors.surface, shadowColor: paperTheme.colors.modalShadow }]}>
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
                      R$ {(item.price * item.quantity).toFixed(2)}
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
        </View>

        {/* Resumo do pedido */}
        <View style={[styles.summaryCard, { backgroundColor: paperTheme.colors.surface, shadowColor: paperTheme.colors.modalShadow }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: paperTheme.colors.onSurface }]}>
              Total dos itens
            </Text>
            <Text style={[styles.summaryValue, { color: paperTheme.colors.onSurface }]}>
              R$ {totalValue.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: paperTheme.colors.outline }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: paperTheme.colors.onSurface }]}>
              Total
            </Text>
            <Text style={[styles.totalValue, { color: paperTheme.colors.primary }]}>
              R$ {totalValue.toFixed(2)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZE.lg,
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

