import React from "react";
import { TouchableOpacity, Text, StyleSheet, Image, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const cardWidth = (width / 2) - 32; // 2 cards por linha

interface Props {
  name: string;
  image: string;
  onPress?: () => void;
}

const CategorySmallCard: React.FC<Props> = ({ name, image, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.text}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    height: 60,
    backgroundColor: "#f8f8f8",
    margin: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    elevation: 4,
  },
  image: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    marginRight: 12,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});

export default CategorySmallCard;
