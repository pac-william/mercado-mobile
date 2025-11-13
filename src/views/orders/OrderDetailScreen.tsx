import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from "react-native";
import { useTheme } from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../components/layout/header";
import { getOrderById } from "../../services/orderService";
import { getProductById } from "../../services/productService";
import { Order, OrderItem } from "../../domain/orderDomain";
import { SettingsStackParamList } from "../../navigation/types";

type OrderDetailScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList, 'OrderDetail'>;

interface OrderItemWithProduct extends OrderItem {
  productName?: string;
  productImage?: string;
}

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDENTE':
    case 'PENDING':
      return '#FF9800';
    case 'CONFIRMADO':
    case 'CONFIRMED':
      return '#2196F3';
    case 'PREPARANDO':
    case 'PREPARING':
      return '#9C27B0';
    case 'SAIU_PARA_ENTREGA':
    case 'OUT_FOR_DELIVERY':
      return '#FF5722';
    case 'ENTREGUE':
    case 'DELIVERED':
      return '#4CAF50';
    case 'CANCELADO':
    case 'CANCELLED':
      return '#F44336';
    default:
      return '#757575';
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
  const paperTheme = useTheme();
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

        // Buscar detalhes dos produtos para cada item
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
          <Ionicons name="alert-circle-outline" size={64} color={paperTheme.colors.error} />
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
  const statusColor = getStatusColor(order.status || 'PENDING');
  const statusText = getStatusText(order.status || 'PENDING');

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Header />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 100, 120),
          paddingTop: 10,
        }}
        showsVerticalScrollIndicator={true}
        indicatorStyle={paperTheme.dark ? 'white' : 'default'}
      >
        {/* Card de informações do pedido */}
        <View style={[styles.orderInfoCard, { backgroundColor: paperTheme.colors.surface }]}>
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Ionicons name="receipt-outline" size={32} color={paperTheme.colors.tertiary} />
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
              <Ionicons name="card-outline" size={20} color={paperTheme.colors.onSurfaceVariant} />
              <Text style={[styles.paymentText, { color: paperTheme.colors.onSurfaceVariant }]}>
                Método de pagamento: {order.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : order.paymentMethod}
              </Text>
            </View>
          )}
        </View>

        {/* Lista de itens */}
        <View style={[styles.itemsCard, { backgroundColor: paperTheme.colors.surface }]}>
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
        <View style={[styles.summaryCard, { backgroundColor: paperTheme.colors.surface }]}>
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
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  orderInfoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    marginBottom: 16,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  orderId: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  paymentText: {
    fontSize: 14,
    marginLeft: 8,
  },
  itemsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noItemsText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

