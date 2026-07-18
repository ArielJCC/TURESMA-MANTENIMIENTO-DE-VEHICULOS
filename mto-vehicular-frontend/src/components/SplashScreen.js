import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Platform, useWindowDimensions } from 'react-native';

export default function SplashScreen({ onFinish }) {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    // Logo se acerca (zoom in)
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 45,
      useNativeDriver: true,
    }).start(() => {
      // Pausa y luego fade out
      setTimeout(() => {
        Animated.timing(fadeOut, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          if (onFinish) onFinish();
        });
      }, 800);
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <Animated.Image
        source={require('../../assets/logo.png')}
        style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    elevation: 99999,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 320,
    height: 120,
  },
});
