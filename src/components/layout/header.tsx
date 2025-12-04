import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useState, useCallback } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "../../contexts/CartContext";
import { ProfileButton } from "../ui/ProfileButton";
import { SPACING, BORDER_RADIUS, FONT_SIZE, ICON_SIZES } from "../../constants/styles";
import { notificationService } from "../../services/notificationService";
import { useSession } from "../../hooks/useSession";

const Logo = require("../../../assets/logotipo.png");

export const Header: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state: cartState } = useCart();
  const paperTheme = useCustomTheme();
  const { isAuthenticated } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erro ao carregar contador de notificações:', error);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Atualiza o contador quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      loadUnreadCount();
    }, [loadUnreadCount])
  );

  // Atualiza o contador quando o usuário faz login/logout
  React.useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: paperTheme.colors.surface }]}>
      <View style={styles.container}>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
        <View style={styles.titleContainer}>
          <Text style={[styles.titleLine, { color: paperTheme.colors.onSurface }]}>Smart</Text>
          <Text style={[styles.titleLine, { color: paperTheme.colors.onSurface }]}>Market</Text>
        </View>
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
            {unreadCount > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: paperTheme.colors.primary }]}>
                <Text style={[styles.notificationBadgeText, { color: paperTheme.colors.onPrimary }]}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
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
    minHeight: SPACING.xxxl + SPACING.xlBase
  },
  logo: { 
    width: SPACING.xxxl * 2, 
    height: SPACING.xxxl + SPACING.xlBase, 
    borderRadius: BORDER_RADIUS.full 
  },
  titleContainer: {
    marginLeft: SPACING.sm,
    justifyContent: 'center',
  },
  titleLine: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
    lineHeight: FONT_SIZE.lg * 1.2,
  },
  buttonsContainer: { flexDirection: "row" },
  button: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.mdPlus,
    marginLeft: SPACING.sm,
    position: 'relative'
  },
  cartBadge: {
    position: 'absolute',
    top: -SPACING.xs,
    right: -SPACING.xs,
    borderRadius: BORDER_RADIUS.mdPlus,
    minWidth: SPACING.xlBase,
    height: SPACING.xlBase,
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
    borderRadius: BORDER_RADIUS.mdPlus,
    minWidth: SPACING.lgPlus,
    height: SPACING.lgPlus,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  notificationBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: 'bold',
  },
});