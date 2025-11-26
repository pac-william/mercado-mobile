import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "../../components/layout/header";
import { Order } from "../../domain/orderDomain";
import { getOrders as getOrdersLocal } from "../../domain/order/orderStorage";
import { useSession } from "../../hooks/useSession";
import { SettingsStackParamList } from "../../navigation/types";
import { getOrders } from "../../services/orderService";

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

type OrdersScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList, 'Orders'>;

const ORDERS_CACHE_TTL = 1000 * 60 * 2;

export default function OrdersScreen() {
  const navigation = useNavigation<OrdersScreenNavigationProp>();
  const paperTheme = useTheme();
  const insets = useSafeAreaInsets();
  const { user: sessionUser } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);
  const isFetchingRef = useRef(false);
  const lastFetchRef = useRef<number>(0);
  const lastProcessedUserIdRef = useRef<string | null>(null);

  const loadLocalOrders = useCallback(async (userId: string) => {
    try {
      const localOrders = await getOrdersLocal(userId);
      if (localOrders.length > 0) {
        setOrders(localOrders);
        setLoading(false);
      }
      return localOrders;
    } catch (error) {
      return [];
    }
  }, []);

  const fetchOrders = useCallback(async (userId: string, forceRefresh: boolean = false) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    if (isFetchingRef.current) {
      return;
    }

    const now = Date.now();
    if (!forceRefresh && lastFetchRef.current && now - lastFetchRef.current < ORDERS_CACHE_TTL) {
      return;
    }

    isFetchingRef.current = true;

    try {
      const response = await getOrders(1, 50, { userId });
      setOrders(response.orders);
      setOffline(false);
      lastFetchRef.current = now;
    } catch (error: any) {
      console.warn("⚠️ Erro ao buscar pedidos:", error);
      const localOrders = await loadLocalOrders(userId);
      if (localOrders.length === 0) {
        setOrders([]);
        setOffline(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [loadLocalOrders]);

  useEffect(() => {
    const userId = sessionUser?.id || null;
    
    if (userId) {
      if (userId !== lastProcessedUserIdRef.current) {
        lastFetchRef.current = 0;
        lastProcessedUserIdRef.current = userId;
      }
      
      setLoading(true);
      loadLocalOrders(userId).then((localOrders) => {
        if (localOrders.length > 0) {
          fetchOrders(userId, false);
        } else {
          fetchOrders(userId, true);
        }
      });
    } else {
      setLoading(false);
      setOrders([]);
      lastFetchRef.current = 0;
      lastProcessedUserIdRef.current = null;
    }
  }, [sessionUser?.id, loadLocalOrders, fetchOrders]);

  useFocusEffect(
    useCallback(() => {
      const userId = sessionUser?.id || null;
      if (userId) {
        const now = Date.now();
        if (!lastFetchRef.current || now - lastFetchRef.current >= ORDERS_CACHE_TTL) {
          fetchOrders(userId, false);
        }
      }
    }, [sessionUser?.id, fetchOrders])
  );

  const handleRefresh = useCallback(async () => {
    if (!sessionUser?.id) {
      setRefreshing(false);
      return;
    }
    setRefreshing(true);
    lastFetchRef.current = 0;
    await fetchOrders(sessionUser.id, true);
  }, [sessionUser?.id, fetchOrders]);

  const renderItem = ({ item }: { item: Order }) => {
    const statusColor = getStatusColor(item.status || 'PENDENTE', paperTheme.colors);
    const statusText = getStatusText(item.status || 'PENDENTE');
    
    const totalValue = item.total || item.totalPrice || 0;
    
    return (
      <TouchableOpacity 
        style={[styles.orderCard, { backgroundColor: paperTheme.colors.surface, shadowColor: paperTheme.colors.modalShadow }]} 
        activeOpacity={0.7}
        onPress={() => {
          navigation.navigate('OrderDetail', { orderId: item.id });
        }}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Ionicons name="receipt-outline" size={24} color={paperTheme.colors.tertiary} />
            <View style={styles.orderInfo}>
              <Text style={[styles.orderId, { color: paperTheme.colors.onSurface }]}>
                Pedido #{item.id.slice(0, 8).toUpperCase()}
              </Text>
              <Text style={[styles.orderDate, { color: paperTheme.colors.onSurfaceVariant }]}>
                {new Date(item.createdAt).toLocaleDateString("pt-BR", {
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
        
        <View style={styles.orderBody}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.orderStatus, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
          
          <View style={styles.orderTotalContainer}>
            <Text style={[styles.orderTotalLabel, { color: paperTheme.colors.onSurfaceVariant }]}>Total</Text>
            <Text style={[styles.orderTotal, { color: paperTheme.colors.onSurface }]}>
              R$ {totalValue.toFixed(2)}
            </Text>
          </View>
        </View>
        
        {item.delivererId && (
          <View style={[styles.delivererInfo, { borderTopColor: paperTheme.colors.outline }]}>
            <Ionicons name="bicycle-outline" size={16} color={paperTheme.colors.onSurfaceVariant} />
            <Text style={[styles.delivererText, { color: paperTheme.colors.onSurfaceVariant }]}>
              Entregador atribuído
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Header/>

      {offline && (
        <View style={[styles.offlineBanner, { backgroundColor: paperTheme.colors.errorContainer }]}>
          <Ionicons name="wifi-outline" size={18} color={paperTheme.colors.onErrorContainer} />
          <Text style={[styles.offlineText, { color: paperTheme.colors.onErrorContainer }]}>
            Modo offline: exibindo pedidos salvos localmente
          </Text>
        </View>
      )}

      {loading && orders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
          <Text style={[styles.loadingText, { color: paperTheme.colors.onBackground }]}>
            Carregando pedidos...
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            orders.length === 0 
              ? styles.emptyListContainer 
              : {
                  ...styles.listContainer,
                  paddingBottom: Math.max(insets.bottom + 100, 120), // Espaço para navegação inferior + safe area
                }
          }
          showsVerticalScrollIndicator={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[paperTheme.colors.primary]}
              tintColor={paperTheme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={80} color={paperTheme.colors.onSurfaceVariant} />
              <Text style={[styles.emptyText, { color: paperTheme.colors.onSurface }]}>
                Nenhum pedido encontrado
              </Text>
              <Text style={[styles.emptySubtext, { color: paperTheme.colors.onSurfaceVariant }]}>
                {offline 
                  ? "Conecte-se à internet para sincronizar seus pedidos"
                  : "Seus pedidos aparecerão aqui quando você fizer uma compra"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    // backgroundColor será aplicado dinamicamente via props
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  orderCard: {
    // backgroundColor será aplicado dinamicamente via props
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: { 
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flexDirection: "row", 
    alignItems: "center",
  },
  orderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  orderId: { 
    fontSize: 16, 
    fontWeight: "600",
    // color será aplicado dinamicamente via props
    marginBottom: 4,
  },
  orderDate: { 
    fontSize: 12,
    // color será aplicado dinamicamente via props
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  orderStatus: { 
    fontSize: 12, 
    fontWeight: "600",
  },
  orderTotalContainer: {
    alignItems: 'flex-end',
  },
  orderTotalLabel: {
    fontSize: 11,
    // color será aplicado dinamicamente via props
    marginBottom: 2,
  },
  orderTotal: { 
    fontSize: 18,
    // color será aplicado dinamicamente via props
    fontWeight: "bold" 
  },
  delivererInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    // borderTopColor será aplicado dinamicamente via props
  },
  delivererText: {
    fontSize: 12,
    // color será aplicado dinamicamente via props
    marginLeft: 6,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: { 
    alignItems: "center", 
    justifyContent: "center", 
    marginTop: 100,
    paddingHorizontal: 32,
  },
  emptyText: { 
    fontSize: 18,
    // color será aplicado dinamicamente via props
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    // color será aplicado dinamicamente via props
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: { 
    marginTop: 10,
    // color será aplicado dinamicamente via props
  },
  offlineBanner: {
    // backgroundColor será aplicado dinamicamente via props
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  offlineText: { 
    // color será aplicado dinamicamente via props
    marginLeft: 8, 
    fontSize: 13,
    fontWeight: '500',
  },
});
