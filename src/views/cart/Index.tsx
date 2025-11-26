import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useCart } from "../../contexts/CartContext";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { SPACING, FONT_SIZE, BORDER_RADIUS } from "../../constants/styles";

export default function Cart() {
  const { state, addItem, removeItem, updateQuantity } = useCart();
  const { styles, theme: paperTheme } = useThemedStyles((theme) => ({
    container: { flex: 1, padding: SPACING.lg, backgroundColor: theme.colors.white },
    header: { fontSize: FONT_SIZE.xxl, fontWeight: "bold", marginBottom: SPACING.lg },
    empty: {
      textAlign: "center",
      marginTop: SPACING.jumbo + SPACING.micro,
      fontSize: FONT_SIZE.xl,
      color: theme.colors.textSecondary,
    },
    item: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    title: { fontSize: FONT_SIZE.lg, flex: 1 },
    price: { fontSize: FONT_SIZE.lg, fontWeight: "bold", marginHorizontal: SPACING.smPlus },
    buttons: { flexDirection: "row" },
    btn: { fontSize: FONT_SIZE.xl, marginHorizontal: SPACING.xsPlus },
    footer: { paddingTop: SPACING.xlBase, borderTopWidth: 1, borderTopColor: theme.colors.outline, marginTop: SPACING.lg },
    total: { fontSize: FONT_SIZE.xxl, fontWeight: "bold", marginBottom: SPACING.md },
    checkoutBtn: {
      padding: SPACING.mdPlus,
      borderRadius: BORDER_RADIUS.md,
      alignItems: "center",
      backgroundColor: theme.colors.buttonSuccess,
    },
    checkoutText: { fontSize: FONT_SIZE.xl, fontWeight: "bold", color: theme.colors.white },
  }));

  const increaseQty = (id: string) => {
    const item = state.items.find((i) => i.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  const decreaseQty = (id: string) => {
    const item = state.items.find((i) => i.id === id);
    if (item) {
      if (item.quantity > 1) {
        updateQuantity(id, item.quantity - 1);
      } else {
        removeItem(id);
      }
    }
  };

  const total = state.items.reduce((sum: number, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Carrinho</Text>

      {state.items.length === 0 ? (
        <Text style={styles.empty}>Seu carrinho está vazio</Text>
      ) : (
        <FlatList
          data={state.items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.title}>{item.name} ({item.quantity}x)</Text>
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
