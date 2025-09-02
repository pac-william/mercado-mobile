import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import "./global.css";
import Home from './src/views/home';
import { Header } from './src/components/layout/header';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function App() {
  return (

    <SafeAreaView className="flex-1 bg-white p-4">
      <View className='flex-1'>
        <Header />
        <Home />
      </View>
    </SafeAreaView>
  );
}


