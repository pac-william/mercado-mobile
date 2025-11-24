import { useEffect, useState } from "react";
import { Animated, Image, Platform, StatusBar, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import { useTheme as useAppTheme } from "../../contexts/ThemeContext";

export default function SplashScreen() {
  const paperTheme = useTheme();
  const { isDark } = useAppTheme();
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
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={paperTheme.colors.background}
        translucent={Platform.OS === 'android'}
      />
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
          source={require("../../../assets/logotipo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text variant="bodyLarge" style={[styles.loadingText, { color: paperTheme.colors.primary }]}>
          Carregando...
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitleText, { color: isDark ? '#FFFFFF' : paperTheme.colors.primary }]}>
          Preparando as melhores ofertas e ajustando sua experiência de compras
        </Text>
      </View>
    </View>
  );
}

export function InitialLoadingScreen() {
  const paperTheme = useTheme();
  const { isDark } = useAppTheme();
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
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={paperTheme.colors.background}
        translucent={Platform.OS === 'android'}
      />
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
          source={require("../../../assets/logotipo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text variant="bodyLarge" style={[styles.loadingText, { color: paperTheme.colors.primary }]}>
          Carregando...
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitleText, { color: isDark ? '#FFFFFF' : paperTheme.colors.primary }]}>
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
    fontWeight: "600",
  },
  subtitleText: {
    marginTop: 8,
    textAlign: "center",
  },
});