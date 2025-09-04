import React from "react";
import { View, Image, TouchableOpacity, StyleSheet,Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"; // ícones

import Logo from "../../assets/logo1.jpg";

interface HeaderProps {
  onPressHistory?: () => void;
  onPressCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onPressHistory, onPressCart }) => {
  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.logo} resizeMode="contain" />
      <Text>Smart Marketing</Text>
      <View style={{ flex: 1 }} />

      {/* Botões à direita */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={onPressHistory}>
          <Ionicons name="time-outline" size={24} color="#0891B2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onPressCart}>
          <Ionicons name="cart-outline" size={24} color="#0891B2" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  logo: {
    width: 100,
    height: 70,
    borderRadius: 25,
  },
  buttonsContainer: {
    flexDirection: "row",
  },
  button: {
    backgroundColor: "#E5E7EB",
    padding: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
});
