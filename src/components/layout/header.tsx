import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme as usePaperTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "../../contexts/CartContext";
import { ProfileButton } from "../ui/ProfileButton";

import Logo from "../../assets/logo1.jpg";

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
            <Ionicons name="time-outline" size={24} color={paperTheme.colors.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: paperTheme.colors.surfaceVariant }]}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Ionicons name="notifications-outline" size={24} color={paperTheme.colors.tertiary} />
            <View style={[styles.notificationBadge, { backgroundColor: paperTheme.colors.primary }]}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: paperTheme.colors.surfaceVariant }]}
            onPress={() => navigation.navigate("Cart")}
          >
            <Ionicons name="cart-outline" size={24} color={paperTheme.colors.tertiary} />
            {cartState.itemCount > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: paperTheme.colors.primary }]}>
                <Text style={styles.cartBadgeText}>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60
  },
  logo: { width: 80, height: 50, borderRadius: 20 },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    flexShrink: 1
  },
  buttonsContainer: { flexDirection: "row" },
  button: {
    padding: 8,
    borderRadius: 10,
    marginLeft: 8,
    position: 'relative'
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});