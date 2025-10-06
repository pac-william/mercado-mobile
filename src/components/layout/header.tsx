import React from "react";
import { View, Image, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../../App";
import { useCart } from "../../contexts/CartContext";
import { SafeAreaView } from "react-native-safe-area-context";

import Logo from "../../assets/logo1.jpg";

interface HeaderProps {
  onPressHistory?: () => void;
  onPressCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onPressHistory }) => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { state } = useCart();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.container}>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Smart Marketing</Text>
        <View style={{ flex: 1 }} />

        {/* Botões à direita */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={onPressHistory}>
            <Ionicons name="time-outline" size={24} color="#0891B2" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate("Cart")}
          >
            <Ionicons name="cart-outline" size={24} color="#0891B2" />
            {state.itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {state.itemCount > 99 ? '99+' : state.itemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
  },
  container: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 16, 
    paddingVertical: 12 
  },
  logo: { width: 100, height: 70, borderRadius: 25 },
  title: { fontSize: 18, fontWeight: "bold", marginLeft: 8 },
  buttonsContainer: { flexDirection: "row" },
  button: { 
    backgroundColor: "#E5E7EB", 
    padding: 8, 
    borderRadius: 10, 
    marginLeft: 8, 
    position: 'relative' 
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4500',
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
});
