import React, { useEffect, useRef, useState } from 'react';
import { Platform, BackHandler, ToastAndroid } from 'react-native';
import ExitConfirmModal from '../components/ExitConfirmModal';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import api from '../services/api';

import DashboardScreen from '../screens/DashboardScreen';
import VehicleListScreen from '../screens/VehicleListScreen';
import VehicleHistoryScreen from '../screens/VehicleHistoryScreen';
import AddMaintenanceScreen from '../screens/AddMaintenanceScreen';
import AddVehicleScreen from '../screens/AddVehicleScreen';
import AddReminderScreen from '../screens/AddReminderScreen';

const Stack = createStackNavigator();

// Carga condicional de expo-notifications para evitar errores en Expo Go (SDK 53+)
let Notifications = null;
const isExpoGo = Constants.appOwnership === 'expo';

if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.error('Error cargando expo-notifications:', e);
  }
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web' || !Notifications) return null;

  if (!Device.isDevice) {
    console.warn('Debe usar un dispositivo físico para probar las notificaciones push de Expo.');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('¡Permiso de notificaciones push denegado!');
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      console.warn(
        'Aviso: Para recibir notificaciones push en segundo plano, debes vincular tu proyecto a una cuenta de Expo (EAS Project ID en app.json).'
      );
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Expo Push Token obtenido con éxito:', token);
    return token;
  } catch (error) {
    console.error('Error al registrar el Push Token de Expo:', error);
    return null;
  }
}

export default function AppNavigator() {
  const navigationRef = useRef();
  const backPressedOnce = useRef(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Navegación nativa o diálogo de confirmación al pulsar Atrás (Android)
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const backAction = () => {
      // 1. Si podemos ir hacia atrás en la pila de navegación, retrocedemos
      if (navigationRef.current && navigationRef.current.canGoBack()) {
        navigationRef.current.goBack();
        return true;
      }

      // 2. Si estamos en la pantalla raíz (Dashboard) y presionamos por segunda vez rápido
      if (backPressedOnce.current) {
        setShowExitModal(true);
        backPressedOnce.current = false;
        return true;
      }

      // Primera pulsación en la raíz -> Toast informativo
      backPressedOnce.current = true;
      ToastAndroid.show('Presiona atrás de nuevo para salir', ToastAndroid.SHORT);

      // Resetear después de 2 segundos si no hay segunda pulsación
      setTimeout(() => {
        backPressedOnce.current = false;
      }, 2000);

      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // Registro de notificaciones push
  useEffect(() => {
    if (Platform.OS === 'web' || !Notifications) {
      return;
    }

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        api.post('/register-device-token', { token })
          .then(() => console.log('Push Token registrado con éxito en el servidor.'))
          .catch(err => console.error('Error al registrar el Push Token en el servidor:', err));
      }
    });

    // Escuchar notificaciones recibidas con la app abierta (Primer plano)
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación en primer plano recibida:', notification);
    });

    return () => subscription.remove();
  }, []);

  return (
    <>
    <ExitConfirmModal
      visible={showExitModal}
      onCancel={() => setShowExitModal(false)}
      onConfirm={() => {
        setShowExitModal(false);
        BackHandler.exitApp();
      }}
    />
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: '#007aff' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {/* Deshabilitamos animación para pantallas tipo pestaña (Dashboard, Flota, Agregar) */}
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ title: 'Turesma - Panel Principal', animationEnabled: false }} 
        />
        <Stack.Screen 
          name="VehicleList" 
          component={VehicleListScreen} 
          options={{ title: 'Turesma - Mis Vehículos', animationEnabled: false }} 
        />
        <Stack.Screen 
          name="AddVehicle" 
          component={AddVehicleScreen} 
          options={{ title: 'Turesma - Nuevo Vehículo', animationEnabled: false }} 
        />

        {/* Transiciones horizontales premium (iOS style) para pantallas secundarias */}
        <Stack.Screen 
          name="VehicleHistory" 
          component={VehicleHistoryScreen} 
          options={{ 
            title: 'Turesma - Historial',
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} 
        />
        <Stack.Screen 
          name="AddMaintenance" 
          component={AddMaintenanceScreen} 
          options={{ 
            title: 'Turesma - Registrar Trabajo',
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} 
        />
        <Stack.Screen 
          name="AddReminder" 
          component={AddReminderScreen} 
          options={{ 
            title: 'Turesma - Agregar Recordatorio',
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
    </>
  );
}