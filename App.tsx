import React from "react";
import "react-native-gesture-handler";
import { CartProvider } from './src/contexts/CartContext';
import { OnboardingProvider } from './src/contexts/OnboardingContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { RootNavigator } from './src/navigation';
import { InitialLoadingScreen } from './src/views/splash/SplashScreen';

// Re-exporta os tipos de navegação para manter compatibilidade com imports existentes
export type {
  AuthStackParamList, HomeStackParamList, RootStackParamList, SearchStackParamList,
  SettingsStackParamList, TabParamList
} from './src/navigation';

const App: React.FC = () => {
  const [showInitial, setShowInitial] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitial(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (showInitial) {
    return <InitialLoadingScreen />;
  }

  return (
    <ThemeProvider>
      <OnboardingProvider>
        <CartProvider>
          <RootNavigator />
        </CartProvider>
      </OnboardingProvider>
    </ThemeProvider>
  );
};

export default App;