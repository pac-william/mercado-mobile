import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { getOrders } from "../../services/orderService";
import { Order } from "../../domain/orderDomain";
import { Header } from "../../components/layout/header";
import { Ionicons } from "@expo/vector-icons";

export default function OrdersScreen() {
  const { state } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!state.user) return;

    setLoading(true);
    setOffline(false);

    try {
      const response = await getOrders(1, 20, { userId: state.user.id });
      setOrders(response.orders);
    } catch (error) {
      console.warn("⚠️ Buscando dados locais (offline):", error);
      setOffline(true);

      // @ts-ignore - o getOrders() lida com fallback interno
      const response = await getOrders(1, 20, { userId: state.user.id });
      setOrders(response.orders);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [state.user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Ionicons name="receipt-outline" size={22} color="#FF4500" />
        <Text style={styles.orderId}>Pedido #{item.id.slice(0, 6)}</Text>
      </View>
      <Text style={styles.orderStatus}>
        Status: <Text style={styles.bold}>{item.status || "PENDENTE"}</Text>
      </Text>
      <Text style={styles.orderTotal}>Total: R$ {item.totalPrice?.toFixed(2) || "0.00"}</Text>
      <Text style={styles.orderDate}>
        Feito em {new Date(item.createdAt).toLocaleString("pt-BR")}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header/>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
          <Text style={styles.loadingText}>Carregando pedidos...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#FF4500"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
            </View>
          }
          ListHeaderComponent={
            offline ? (
              <View style={styles.offlineBanner}>
                <Ionicons name="wifi-outline" size={16} color="#fff" />
                <Text style={styles.offlineText}>Modo offline: exibindo pedidos salvos</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  orderCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  orderId: { marginLeft: 8, fontSize: 16, fontWeight: "600", color: "#333" },
  orderStatus: { fontSize: 14, color: "#555" },
  orderTotal: { fontSize: 15, color: "#000", marginVertical: 4, fontWeight: "bold" },
  orderDate: { fontSize: 12, color: "#777" },
  bold: { fontWeight: "bold" },
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyText: { fontSize: 16, color: "#999", marginTop: 10 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#777" },
  offlineBanner: {
    backgroundColor: "#ff9800",
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: 4,
  },
  offlineText: { color: "#fff", marginLeft: 6, fontSize: 13 },
});
