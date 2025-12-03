import React from "react";
import "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CartProvider } from './src/contexts/CartContext';
import { OnboardingProvider } from './src/contexts/OnboardingContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { UserProfileProvider } from './src/contexts/UserProfileContext';
import { RootNavigator } from './src/navigation';
import { InitialLoadingScreen } from './src/views/splash/SplashScreen';
import { notificationService } from './src/services/notificationService';
import { useSession } from './src/hooks/useSession';

export type {
  AuthStackParamList, HomeStackParamList, RootStackParamList, SearchStackParamList,
  SettingsStackParamList, TabParamList
} from './src/navigation';

const AppContent: React.FC = () => {
  const { isDark } = useTheme();
  const { isAuthenticated, user } = useSession();
  React.useEffect(() => {
    notificationService.initialize();
    console.info('Notificações inicializadas');
  }, []);
  React.useEffect(() => {
    if (isAuthenticated && user?.id) {
      notificationService.associateTokenToUser(user.id);
    } else if (!isAuthenticated) {
      notificationService.unregisterToken();
    }
  }, [isAuthenticated, user?.id]);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <OnboardingProvider>
        <CartProvider>
          <UserProfileProvider>
            <RootNavigator />
          </UserProfileProvider>
        </CartProvider>
      </OnboardingProvider>
    </>
  );
};

const App: React.FC = () => {
  const [showInitial, setShowInitial] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitial(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {showInitial ? (
          <InitialLoadingScreen />
        ) : (
          <AppContent />
        )}
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;