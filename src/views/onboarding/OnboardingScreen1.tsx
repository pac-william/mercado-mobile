import { ImageBackground, StatusBar, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { SPACING, BORDER_RADIUS, FONT_SIZE } from "../../constants/styles";

import RelaOnboarding1 from "../../assets/tela-onboarding-1.jpg";

interface OnboardingScreen1Props {
  onNext: () => void;
}

export default function OnboardingScreen1({ onNext }: OnboardingScreen1Props) {
  const paperTheme = useCustomTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.wrapper}>
      <ImageBackground 
        source={RelaOnboarding1} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={[styles.overlay, { backgroundColor: paperTheme.colors.modalOverlay, bottom: insets.bottom }]}>
          <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.content}>
              <View style={styles.spacer} />

              <View style={styles.textContainer}>
                <Text variant="headlineMedium" style={[styles.title, { color: paperTheme.colors.white, textShadowColor: paperTheme.colors.textShadow }]}>
                  Descubra os melhores produtos e preços incríveis!
                </Text>
                <Text variant="bodyLarge" style={[styles.description, { color: paperTheme.colors.onPrimary, textShadowColor: paperTheme.colors.textShadow }]}>
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
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xlBase,
    justifyContent: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  textContainer: {
    paddingHorizontal: SPACING.xlBase,
    marginBottom: SPACING.xxxl,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: SPACING.lg,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: SPACING.micro + 1,
  },
  description: {
    textAlign: "center",
    lineHeight: SPACING.xl,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: SPACING.micro + 1,
  },
  footer: {
    alignItems: "center",
  },
  indicators: {
    flexDirection: "row",
    marginBottom: SPACING.xxxl - SPACING.smPlus,
  },
  indicator: {
    width: SPACING.xs,
    height: SPACING.xs,
    borderRadius: SPACING.xs,
    marginHorizontal: SPACING.xs,
  },
  nextButton: {
    borderRadius: BORDER_RADIUS.xxl + SPACING.micro,
    paddingHorizontal: SPACING.xlBase,
  },
  buttonContent: {
    paddingVertical: SPACING.xs,
  },
  buttonLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "600",
  },
});