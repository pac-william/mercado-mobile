import { Dimensions, ImageBackground, StatusBar, StyleSheet, View } from "react-native";
  import { Button, IconButton, Text, useTheme } from "react-native-paper";
  import { SafeAreaView } from "react-native-safe-area-context";

  import TelaOnboarding2 from "../../assets/tela-onboarding-2.jpg";

  interface OnboardingScreen2Props {
    onNext: () => void;
    onBack: () => void;
  }

  export default function OnboardingScreen2({ onNext, onBack }: OnboardingScreen2Props) {
    const paperTheme = useTheme();

    return (
      <ImageBackground
        source={TelaOnboarding2}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={[styles.overlay, { backgroundColor: paperTheme.colors.modalOverlay }]}>
          <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.content}>
              
              <View style={styles.spacer} /> 

              <View style={styles.textContainer}>
                <Text variant="headlineMedium" style={[styles.title, { color: paperTheme.colors.white, textShadowColor: paperTheme.colors.textShadow }]}>
                  A união da tecnologia e do praticidade
                </Text>
                <Text variant="bodyLarge" style={[styles.description, { color: paperTheme.colors.onPrimary, textShadowColor: paperTheme.colors.textShadow }]}>
                  Unindo tecnologia para te auxiliar e praticidade para você comprar.
                </Text>
              </View>

              <View style={styles.footer}>
                <View style={styles.indicators}>
                  <View style={[styles.indicator, { backgroundColor: paperTheme.colors.outline }]} />
                  <View style={[styles.indicator, { backgroundColor: paperTheme.colors.primary }]} />
                </View>
                
                <View style={styles.buttonContainer}>
                  <IconButton
                    icon="arrow-left"
                    mode="contained"
                    onPress={onBack}
                    style={[styles.backButton, { backgroundColor: paperTheme.colors.primary }]}
                    iconColor={paperTheme.colors.onPrimary}
                  />
                  
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
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    textAlign: "center",
    lineHeight: 24,
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
    buttonContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: 20,
    },
    backButton: {
    },
    nextButton: {
      borderRadius: 25,
      paddingHorizontal: 20,
      flex: 1,
      marginLeft: 20,
    },
    buttonContent: {
      paddingVertical: 8,
    },
    buttonLabel: {
      fontSize: 16,
      fontWeight: "600",
    },
  });