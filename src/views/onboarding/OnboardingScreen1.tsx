import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface OnboardingScreen1Props {
  onNext: () => void;
}

export default function OnboardingScreen1({ onNext }: OnboardingScreen1Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.spacer} />

        <View style={styles.textContainer}>
          <Text variant="headlineMedium" style={styles.title}>
            Descubra os melhores produtos e preços incríveis!
          </Text>
          <Text variant="bodyLarge" style={styles.description}>
            Encontre os melhores preços e ofertas especiais, selecionados para você.
            Compre produtos de qualidade a preços imbatíveis!
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.indicators}>
            <View style={[styles.indicator, styles.activeIndicator]} />
            <View style={styles.indicator} />
          </View>

          <Button
            mode="contained"
            onPress={onNext}
            style={styles.nextButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Próximo →
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f6f0",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  textContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  title: {
    color: "#E65100",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    alignItems: "center",
  },
  indicators: {
    flexDirection: "row",
    marginBottom: 30,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#E65100",
  },
  nextButton: {
    backgroundColor: "#E65100",
    borderRadius: 25,
    paddingHorizontal: 20,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});