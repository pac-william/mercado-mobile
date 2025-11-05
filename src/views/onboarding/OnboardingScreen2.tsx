import { Dimensions, ImageBackground, StyleSheet, View } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import TelaOnboarding2 from "../../assets/tela-onboarding-2.jpg";

interface OnboardingScreen2Props {
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingScreen2({ onNext, onBack }: OnboardingScreen2Props) {
  return (
    <ImageBackground
      source={TelaOnboarding2}
      style={styles.backgroundImage}
      resizeMode="stretch"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          
          <View style={styles.spacer} /> 

          <View style={styles.textContainer}>
            <Text variant="headlineMedium" style={styles.title}>
              A união da tecnologia e do praticidade
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              Unindo tecnologia para te auxiliar e praticidade para você comprar.
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.indicators}>
              <View style={styles.indicator} />
              <View style={[styles.indicator, styles.activeIndicator]} />
            </View>
            
            <View style={styles.buttonContainer}>
              <IconButton
                icon="arrow-left"
                mode="contained"
                onPress={onBack}
                style={styles.backButton}
                iconColor="#fff"
              />
              
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
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: "#2E7D32",
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
    backgroundColor: "#2E7D32",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: "#2E7D32",
  },
  nextButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 25,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 20,
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