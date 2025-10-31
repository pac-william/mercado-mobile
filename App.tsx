import "react-native-gesture-handler";
import React from "react";
import { CartProvider } from './src/contexts/CartContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { OnboardingProvider } from './src/contexts/OnboardingContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { InitialLoadingScreen } from './src/views/splash/SplashScreen';
import { RootNavigator } from './src/navigation';

// Re-exporta os tipos de navegação para manter compatibilidade com imports existentes
export type {
  HomeStackParamList,
  SearchStackParamList,
  SettingsStackParamList,
  AuthStackParamList,
  TabParamList,
  RootStackParamList,
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
        <AuthProvider>
          <CartProvider>
            <RootNavigator />
          </CartProvider>
        </AuthProvider>
      </OnboardingProvider>
    </ThemeProvider>
  );
};

export default App;