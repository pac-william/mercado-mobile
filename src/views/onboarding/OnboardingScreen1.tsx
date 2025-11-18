import { Dimensions, ImageBackground, StatusBar, StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import RelaOnboarding1 from "../../assets/tela-onboarding-1.jpg";

interface OnboardingScreen1Props {
  onNext: () => void;
}

export default function OnboardingScreen1({ onNext }: OnboardingScreen1Props) {
  const paperTheme = useTheme();

  return (
    <ImageBackground 
      source={RelaOnboarding1} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.content}>
            <View style={styles.spacer} />

            <View style={styles.textContainer}>
              <Text variant="headlineMedium" style={[styles.title, { color: '#FFFFFF' }]}>
                Descubra os melhores produtos e preços incríveis!
              </Text>
              <Text variant="bodyLarge" style={[styles.description, { color: paperTheme.colors.onPrimary }]}>
                Encontre os melhores preços e ofertas especiais, selecionados para você.
                Compre produtos de qualidade a preços imbatíveis!
              </Text>
            </View>

            <View style={styles.footer}>
              <View style={styles.indicators}>
                <View style={[styles.indicator, { backgroundColor: paperTheme.colors.primary }]} />
                <View style={[styles.indicator, { backgroundColor: paperTheme.colors.outline }]} />
              </View>

              <Button
                mode="contained"
                onPress={onNext}
                style={[styles.nextButton, { backgroundColor: paperTheme.colors.primary }]}
                contentStyle={styles.buttonContent}
                labelStyle={[styles.buttonLabel, { color: paperTheme.colors.onPrimary }]}
              >
                Próximo →
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backgroundImage: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
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
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    textAlign: "center",
    lineHeight: 24,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    marginHorizontal: 4,
  },
  nextButton: {
    borderRadius: 25,
    paddingHorizontal: 20,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});