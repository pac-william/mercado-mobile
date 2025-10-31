import React from "react";
import { TouchableOpacity, Text, StyleSheet, Image, Dimensions, View } from "react-native";
import { useTheme } from "react-native-paper";

const { width } = Dimensions.get("window");
const cardWidth = (width / 2) - 32;

interface Props {
  name: string;
  image: string;
  subtitle?: string;
  onPress?: () => void;
}

const CategorySmallCard: React.FC<Props> = ({ name, image, onPress, subtitle }) => {
  const paperTheme = useTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        {
          backgroundColor: paperTheme.colors.surface,
          borderWidth: 1,
          borderColor: paperTheme.colors.outline,
        }
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={[styles.text, { color: paperTheme.colors.onSurface }]}>
          {name}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    minHeight: 90,
    // backgroundColor será aplicado dinamicamente via props
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
    elevation: 3,
    // borderWidth e borderColor serão aplicados dinamicamente via props
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
    // color será aplicado dinamicamente via props
  },
  subtitle: {
    fontSize: 12,
    // color será aplicado dinamicamente via props
    marginTop: 4,
  },
});

export default CategorySmallCard;