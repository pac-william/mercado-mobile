import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme as usePaperTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "../../contexts/CartContext";
import { ProfileButton } from "../ui/ProfileButton";
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES } from "../../constants/styles";

const Logo = require("../../../assets/logotipo.png");

export const Header: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state: cartState } = useCart();
  const paperTheme = usePaperTheme();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: paperTheme.colors.surface }]}>
      <View style={styles.container}>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.title, { color: paperTheme.colors.onSurface }]}>Smart Marketing</Text>
        <View style={{ flex: 1 }} />

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: paperTheme.colors.surfaceVariant }]}
            onPress={() => navigation.navigate("History")}
          >
            <Ionicons name="time-outline" size={ICON_SIZES.xl} color={paperTheme.colors.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: paperTheme.colors.surfaceVariant }]}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Ionicons name="notifications-outline" size={ICON_SIZES.xl} color={paperTheme.colors.tertiary} />
            <View style={[styles.notificationBadge, { backgroundColor: paperTheme.colors.primary }]}>
              <Text style={[styles.notificationBadgeText, { color: paperTheme.colors.onPrimary }]}>2</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: paperTheme.colors.surfaceVariant }]}
            onPress={() => navigation.navigate("Cart")}
          >
            <Ionicons name="cart-outline" size={ICON_SIZES.xl} color={paperTheme.colors.tertiary} />
            {cartState.itemCount > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: paperTheme.colors.primary }]}>
                <Text style={[styles.cartBadgeText, { color: paperTheme.colors.onPrimary }]}>
                  {cartState.itemCount > 99 ? '99+' : cartState.itemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <ProfileButton buttonStyle={styles.button} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {},
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 60
  },
  logo: { width: 80, height: 50, borderRadius: BORDER_RADIUS.full },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
    marginLeft: SPACING.sm,
    flexShrink: 1
  },
  buttonsContainer: { flexDirection: "row" },
  button: {
    padding: SPACING.sm,
    borderRadius: 10,
    marginLeft: SPACING.sm,
    position: 'relative'
  },
  cartBadge: {
    position: 'absolute',
    top: -SPACING.xs,
    right: -SPACING.xs,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  cartBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
  },
  notificationBadge: {
    position: 'absolute',
    top: -SPACING.xs,
    right: -SPACING.xs,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  notificationBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: 'bold',
  },
});