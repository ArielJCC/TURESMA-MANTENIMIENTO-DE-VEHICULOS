import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

export default function ExitConfirmModal({ visible, onCancel, onConfirm }) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      {/* Overlay oscuro */}
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Divisor rojo */}
          <View style={styles.divider} />

          {/* Texto */}
          <Text style={styles.title}>¿Salir de la aplicación?</Text>
          <Text style={styles.subtitle}>
            ¿Estás seguro que deseas cerrar{'\n'}Turesma Control Vehicular?
          </Text>

          {/* Botones */}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.btnCancel} onPress={onCancel} activeOpacity={0.8}>
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnExit} onPress={onConfirm} activeOpacity={0.8}>
              <Text style={styles.btnExitText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 16, 23, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: '#141c26',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e2a3a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  logoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  logo: {
    width: 180,
    height: 52,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: '#e52320',
    borderRadius: 2,
    marginBottom: 20,
  },
  title: {
    color: '#f7fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#718096',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2d3748',
    alignItems: 'center',
    backgroundColor: '#1a2332',
  },
  btnCancelText: {
    color: '#a0aec0',
    fontWeight: '600',
    fontSize: 14,
  },
  btnExit: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#e52320',
    alignItems: 'center',
  },
  btnExitText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
