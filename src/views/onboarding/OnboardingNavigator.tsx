import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import OnboardingScreen1 from "./OnboardingScreen1";
import OnboardingScreen2 from "./OnboardingScreen2";

interface OnboardingNavigatorProps {
  onComplete: () => void;
}

export default function OnboardingNavigator({ onComplete }: OnboardingNavigatorProps) {
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
      {currentScreen === 1 && <OnboardingScreen1 onNext={handleNext} />}
      {currentScreen === 2 && (
        <OnboardingScreen2 onNext={handleNext} onBack={handleBack} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});