import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, Animated } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

export default function SplashScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../../assets/logo-smart-marketing.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Carregando...
        </Text>
        <Text variant="bodyMedium" style={styles.subtitleText}>
          Preparando as melhores ofertas e ajustando sua experiência de compras
        </Text>
      </View>
    </View>
  );
}

export function InitialLoadingScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../../assets/logo-smart-marketing.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Carregando...
        </Text>
        <Text variant="bodyMedium" style={styles.subtitleText}>
          Preparando as melhores ofertas e ajustando sua experiência de compras
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 48,
  },
  logo: {
    width: 200,
    height: 200,
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#2E7D32",
    fontWeight: "600",
  },
  subtitleText: {
    marginTop: 8,
    color: "#6b7280",
    textAlign: "center",
  },
});