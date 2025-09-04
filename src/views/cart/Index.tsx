import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([
    { id: 1, title: "Pizza Calabresa", price: 49.9, quantity: 1 },
    { id: 2, title: "Hambúrguer", price: 29.9, quantity: 2 },
  ]);

  // Aumentar quantidade
  const increaseQty = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Diminuir quantidade
  const decreaseQty = (id: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Carrinho</Text>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>
              {item.title} ({item.quantity}x)
            </Text>
            <Text style={styles.price}>
              R$ {(item.price * item.quantity).toFixed(2)}
            </Text>
            <View style={styles.buttons}>
              <TouchableOpacity onPress={() => decreaseQty(item.id)}>
                <Text style={styles.btn}>➖</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => increaseQty(item.id)}>
                <Text style={styles.btn}>➕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Total: R$ {total.toFixed(2)}</Text>
        <TouchableOpacity style={styles.checkoutBtn}>
          <Text style={styles.checkoutText}>Finalizar Pedido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 16, flex: 1 },
  price: { fontSize: 16, fontWeight: "bold", marginHorizontal: 10 },
  buttons: { flexDirection: "row" },
  btn: { fontSize: 20, marginHorizontal: 8 },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 16,
  },
  total: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  checkoutBtn: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
