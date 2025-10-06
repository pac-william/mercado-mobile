import React from "react";
import { TouchableOpacity, Text, StyleSheet, Image, Dimensions, View } from "react-native";

const { width } = Dimensions.get("window");
const cardWidth = (width / 2) - 32;

interface Props {
  name: string;
  image: string;
  subtitle?: string;
  onPress?: () => void;
}

const CategorySmallCard: React.FC<Props> = ({ name, image, onPress, subtitle }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.text}>{name}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    minHeight: 90, 
    backgroundColor: "#f8f8f8",
    margin: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    flexShrink: 1, 
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default CategorySmallCard;