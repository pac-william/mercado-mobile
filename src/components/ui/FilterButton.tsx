import { AntDesign } from '@expo/vector-icons';
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface FilterButtonProps {
  title: string;
  onPress: () => void;
  hasActiveFilters?: boolean;
}

export default function FilterButton({ title, onPress, hasActiveFilters = false }: FilterButtonProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <AntDesign name="filter" size={20} color={colors.primary} />
        <Text style={[styles.text, { color: colors.primary }]}>
          {title}
        </Text>
        {hasActiveFilters && (
          <View style={[styles.badge, { backgroundColor: colors.error }]} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f0f0", // Fundo cinza claro
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});