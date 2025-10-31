import React from "react";
import { View, Image, TouchableOpacity, StyleSheet, Text } from "react-native";
import { useTheme as usePaperTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../../App";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

import Logo from "../../assets/logo1.jpg";

interface HeaderProps {
  onPressHistory?: () => void;
  onPressCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onPressHistory }) => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { state: cartState } = useCart();
  const { state: authState } = useAuth();
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
            onPress={onPressHistory}
          >
            <Ionicons name="time-outline" size={24} color={paperTheme.colors.tertiary} />
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

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: paperTheme.colors.surfaceVariant }]} 
            onPress={() => {
              if (authState.isAuthenticated) {
                const parentNav = navigation.getParent();
                if (parentNav) {
                  parentNav.navigate('SettingsStack' as never);
                }
              } else {
                navigation.navigate("Login");
              }
            }}
          >
            {authState.isAuthenticated && authState.user ? (
              <View style={[styles.userAvatar, { backgroundColor: paperTheme.colors.primary }]}>
                <Text style={styles.userAvatarText}>
                  {authState.user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            ) : (
              <Ionicons name="person-outline" size={24} color={paperTheme.colors.tertiary} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    // backgroundColor será aplicado dinamicamente via props
  },
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
    // color será aplicado dinamicamente via props
  },
  buttonsContainer: { flexDirection: "row" },
  button: { 
    padding: 8, 
    borderRadius: 10, 
    marginLeft: 8, 
    position: 'relative' 
    // backgroundColor será aplicado dinamicamente via props
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
    // backgroundColor será aplicado dinamicamente via props
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor será aplicado dinamicamente via props
  },
  userAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});