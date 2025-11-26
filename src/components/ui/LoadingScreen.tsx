import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { Header } from "../layout/header";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { SPACING, FONT_SIZE } from "../../constants/styles";

interface LoadingScreenProps {
  message?: string;
  showHeader?: boolean;
}

export default function LoadingScreen({ 
  message = "Carregando...", 
  showHeader = true 
}: LoadingScreenProps) {
  const theme = useCustomTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {showHeader && <Header />}
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZE.lg,
    opacity: 0.7,
  },
});

