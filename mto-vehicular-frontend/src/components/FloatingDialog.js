import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';

const theme = {
  success: { accent: '#16a34a', bg: '#ecfdf5', border: '#bbf7d0' },
  error: { accent: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  warning: { accent: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  info: { accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  confirm: { accent: '#0f172a', bg: '#ffffff', border: '#cbd5e1' },
};

export default function FloatingDialog({
  visible,
  type = 'info',
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  onClose,
  autoDismissMs,
}) {
  const { width } = useWindowDimensions();
  const compact = width < 768;
  const colors = theme[type] || theme.info;

  useEffect(() => {
    if (!visible || !autoDismissMs || !onClose) return undefined;
    const timer = setTimeout(onClose, autoDismissMs);
    return () => clearTimeout(timer);
  }, [visible, autoDismissMs, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={type === 'confirm' ? () => {} : onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={type === 'confirm' ? undefined : onClose} />
        <View style={[styles.card, compact && styles.cardCompact, { borderColor: colors.border }]}>
          <View style={[styles.iconBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Text style={[styles.iconText, { color: colors.accent }]}>
              {type === 'success' ? '✓' : type === 'error' ? '!' : type === 'warning' ? '!' : 'i'}
            </Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={[styles.actions, type !== 'confirm' && styles.singleAction]}>
            {type === 'confirm' ? (
              <>
                <TouchableOpacity style={styles.secondaryBtn} onPress={onCancel || onClose}>
                  <Text style={styles.secondaryBtnText}>{cancelText}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.accent }]} onPress={onConfirm}>
                  <Text style={styles.primaryBtnText}>{confirmText}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.accent, minWidth: 120 }]} onPress={onClose}>
                <Text style={styles.primaryBtnText}>{confirmText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  backdropPressable: { ...StyleSheet.absoluteFillObject },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 18, padding: 22, borderWidth: 1, elevation: 10, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  cardCompact: { maxWidth: 360 },
  iconBadge: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  iconText: { fontSize: 22, fontWeight: '900' },
  title: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  message: { marginTop: 8, fontSize: 14, lineHeight: 20, color: '#475569' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  singleAction: { justifyContent: 'center' },
  secondaryBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#e2e8f0', marginRight: 10 },
  secondaryBtnText: { color: '#334155', fontWeight: '700' },
  primaryBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
});
