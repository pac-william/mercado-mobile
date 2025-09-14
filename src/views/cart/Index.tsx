import React, { useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { CartContext } from "../../contexts/CartContext";

export default function Cart() {
  const { cart, addToCart, removeFromCart } = useContext(CartContext);

  const increaseQty = (id: number) => {
    const item = cart.find(i => i.id === id);
    if (item) addToCart(item);
  };

  const decreaseQty = (id: number) => {
    const item = cart.find(i => i.id === id);
    if (item) {
      if (item.quantity > 1) {
        removeFromCart(id);
        addToCart({ ...item, quantity: item.quantity - 1 });
      } else {
        removeFromCart(id);
      }
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Carrinho</Text>

      {cart.length === 0 ? (
        <Text style={styles.empty}>Seu carrinho está vazio</Text>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.title}>{item.title} ({item.quantity}x)</Text>
              <Text style={styles.price}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
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
      )}

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
  empty: { textAlign: "center", marginTop: 50, fontSize: 18, color: "#666" },
  item: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontSize: 16, flex: 1 },
  price: { fontSize: 16, fontWeight: "bold", marginHorizontal: 10 },
  buttons: { flexDirection: "row" },
  btn: { fontSize: 20, marginHorizontal: 8 },
  footer: { paddingTop: 20, borderTopWidth: 1, borderTopColor: "#eee", marginTop: 16 },
  total: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  checkoutBtn: { backgroundColor: "#4CAF50", padding: 14, borderRadius: 8, alignItems: "center" },
  checkoutText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
