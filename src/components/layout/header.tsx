import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Menu } from "lucide-react-native"; // hamburger icon

interface HeaderProps {
  openDrawer: () => void;
}
import Logo from "../../assets/logo-smart-marketing.png";

export const Header: React.FC<HeaderProps> = ({ openDrawer }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openDrawer} style={styles.hamburger}>
        <Menu color="white" size={28} />
      </TouchableOpacity>

      <Text style={styles.title}>Smart Market</Text>

      <Image source={Logo} style={styles.logo} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0891B2",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  hamburger: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 20,
  },
});
