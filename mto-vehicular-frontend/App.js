import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/SplashScreen';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <SafeAreaProvider>
      <AppNavigator />
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
    </SafeAreaProvider>
  );
}