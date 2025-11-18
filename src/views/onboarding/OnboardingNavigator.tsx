import React, { useState } from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme as useAppTheme } from "../../contexts/ThemeContext";
import OnboardingScreen1 from "./OnboardingScreen1";
import OnboardingScreen2 from "./OnboardingScreen2";

interface OnboardingNavigatorProps {
  onComplete: () => void;
}

export default function OnboardingNavigator({ onComplete }: OnboardingNavigatorProps) {
  const paperTheme = useTheme();
  const { isDark } = useAppTheme();
  const [currentScreen, setCurrentScreen] = useState(1);

  const handleNext = () => {
    if (currentScreen === 1) {
      setCurrentScreen(2);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentScreen === 2) {
      setCurrentScreen(1);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      <SafeAreaView style={styles.safeArea} edges={[]}>
        {currentScreen === 1 && <OnboardingScreen1 onNext={handleNext} />}
        {currentScreen === 2 && (
          <OnboardingScreen2 onNext={handleNext} onBack={handleBack} />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});