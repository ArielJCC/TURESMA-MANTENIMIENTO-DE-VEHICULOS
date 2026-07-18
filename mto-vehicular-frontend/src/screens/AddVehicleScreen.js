import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, Platform, useWindowDimensions, Modal, Pressable, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import FloatingDialog from '../components/FloatingDialog';
import AppLayout from '../components/AppLayout';

export default function AddVehicleScreen({ navigation }) {
  const [form, setForm] = useState({ plate: '', brand: '', model: '', year: '', current_mileage: '' });
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ visible: false, type: 'info', title: '', message: '', autoDismissMs: null, onClose: null });
  const [photoMenuVisible, setPhotoMenuVisible] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const openPhotoMenu = () => setPhotoMenuVisible(true);
  const closePhotoMenu = () => setPhotoMenuVisible(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showDialog({
        type: 'warning',
        title: 'Permiso Denegado',
        message: 'Se requiere permiso de acceso a la galería para seleccionar una foto.',
      });
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1.0,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showDialog({
        type: 'warning',
        title: 'Permiso Denegado',
        message: 'Se requiere permiso de acceso a la cámara para tomar una fotografía.',
      });
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1.0,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const showDialog = (nextDialog) => {
    setDialog({ visible: true, type: 'info', title: '', message: '', autoDismissMs: null, onClose: null, ...nextDialog });
  };

  const handleSave = async () => {
    if (!form.plate.trim()) return showDialog({ type: 'warning', title: 'Campo requerido', message: 'Por favor, ingresa la placa.' });
    if (!form.brand.trim()) return showDialog({ type: 'warning', title: 'Campo requerido', message: 'Por favor, ingresa la marca.' });
    if (!form.model.trim()) return showDialog({ type: 'warning', title: 'Campo requerido', message: 'Por favor, ingresa el modelo.' });
    if (!form.year.trim()) return showDialog({ type: 'warning', title: 'Campo requerido', message: 'Por favor, ingresa el año.' });
    if (!form.current_mileage.trim()) return showDialog({ type: 'warning', title: 'Campo requerido', message: 'Por favor, ingresa el kilometraje.' });

    setSubmitting(true);

    const formData = new FormData();
    formData.append('plate', form.plate.trim().toUpperCase());
    formData.append('brand', form.brand.trim());
    formData.append('model', form.model.trim());
    formData.append('year', form.year.toString().trim());
    formData.append('current_mileage', form.current_mileage.toString().trim());

    if (image) {
      try {
        if (Platform.OS === 'web') {
          const response = await fetch(image.uri);
          const blob = await response.blob();
          formData.append('image_file', blob, 'vehicle.jpg');
        } else {
          formData.append('image_file', {
            uri: image.uri,
            name: 'vehicle.jpg',
            type: 'image/jpeg',
          });
        }
      } catch (error) {
        setSubmitting(false);
        return showDialog({ type: 'error', title: 'Error de Imagen', message: 'No se pudo procesar la foto seleccionada.' });
      }
    }

    try {
      const res = await api.post('/vehicles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });

      if (res.status === 201 || res.status === 200) {
        showDialog({
          type: 'success',
          title: '¡Éxito!',
          message: 'Vehículo registrado correctamente.',
          confirmText: 'Continuar',
          autoDismissMs: 1300,
          onClose: () => navigation.navigate('VehicleList'),
        });
      }
    } catch (err) {
      console.error("Detalle del error capturado:", err.response?.data || err.message);
      if (err.response?.data?.errors?.plate) {
        showDialog({ type: 'error', title: 'Placa Duplicada', message: 'Esta matrícula ya está registrada en el sistema.' });
      } else {
        showDialog({ type: 'error', title: 'Error 422', message: 'El servidor rechazó los datos.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout activeTab="AddVehicle" navigation={navigation} title="Nuevo Vehículo">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.innerWrapper}>
        <ScrollView style={[styles.scrollBody, isMobile && styles.scrollBodyMobile]} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.mainTitle, isMobile && styles.mainTitleMobile]}>Ingreso de Nuevas Unidades</Text>
          <Text style={styles.subTitle}>Sube un vehículo al ecosistema digital para empezar a trackear sus mantenimientos.</Text>

          <View style={[styles.formContainer, isMobile && styles.formContainerMobile]}>

            <Text style={styles.label}>Placa</Text>
            <TextInput style={[styles.input, isMobile && styles.inputMobile]} placeholder="Ej: ABC-1234" placeholderTextColor="#94a3b8" autoCapitalize="characters" onChangeText={t => setForm({ ...form, plate: t })} />

            <View style={styles.formRow}>
              <View style={{ flex: 1, marginRight: 15 }}>
                <Text style={styles.label}>Marca</Text>
                <TextInput style={[styles.input, isMobile && styles.inputMobile]} placeholder="Ej: Toyota" placeholderTextColor="#94a3b8" onChangeText={t => setForm({ ...form, brand: t })} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Modelo</Text>
                <TextInput style={[styles.input, isMobile && styles.inputMobile]} placeholder="Ej: Hilux" placeholderTextColor="#94a3b8" onChangeText={t => setForm({ ...form, model: t })} />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={{ flex: 1, marginRight: 15 }}>
                <Text style={styles.label}>Año de Fabricación</Text>
                <TextInput style={[styles.input, isMobile && styles.inputMobile]} placeholder="Ej: 2023" placeholderTextColor="#94a3b8" keyboardType="numeric" onChangeText={t => setForm({ ...form, year: t })} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Kilometraje Inicial</Text>
                <TextInput style={[styles.input, isMobile && styles.inputMobile]} placeholder="Ej: 15000" placeholderTextColor="#94a3b8" keyboardType="numeric" onChangeText={t => setForm({ ...form, current_mileage: t })} />
              </View>
            </View>

            <View style={styles.divider} />

            {/* SECCIÓN DE FOTOGRAFÍA */}
            <Text style={styles.label}>Fotografía Identificativa</Text>
            <View style={styles.elegantPhotoContainer}>
              <View style={styles.photoPreviewWrapper}>
                {image ? (
                  <Image source={{ uri: image.uri }} style={styles.elegantPreview} resizeMode="cover" />
                ) : (
                  <Text style={styles.noPhotoText}>Sin foto asignada</Text>
                )}
              </View>

              <TouchableOpacity style={styles.selectPhotoRowBtn} onPress={openPhotoMenu}>
                <Text style={styles.selectPhotoRowText}>
                  {image ? "Cambiar Fotografía" : "Seleccionar Imagen del Auto"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* BOTÓN GUARDAR */}
            <View style={styles.btnActionContainer}>
              <TouchableOpacity
                style={[styles.btn, submitting && { backgroundColor: '#a0aec0' }]}
                onPress={handleSave}
                disabled={submitting}
              >
                <Text style={styles.btnText}>{submitting ? "Guardando..." : "Guardar"}</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </View>
      <FloatingDialog
        visible={dialog.visible}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText || 'Aceptar'}
        onClose={() => {
          setDialog(prev => ({ ...prev, visible: false }));
          if (dialog.onClose) dialog.onClose();
        }}
        autoDismissMs={dialog.autoDismissMs}
      />

      <Modal
        visible={photoMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={closePhotoMenu}
      >
        <Pressable style={styles.sheetBackdrop} onPress={closePhotoMenu}>
          <Pressable style={styles.sheetContainer} onPress={() => { }}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Subir Fotografía</Text>
            <Text style={styles.sheetSubtitle}>Selecciona el origen de la foto del vehículo</Text>

            <TouchableOpacity
              style={styles.sheetAction}
              onPress={() => {
                closePhotoMenu();
                setTimeout(() => {
                  takePhoto();
                }, 350);
              }}
            >
              <Text style={styles.sheetActionText}>Tomar Foto con Cámara</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetAction}
              onPress={() => {
                closePhotoMenu();
                setTimeout(() => {
                  pickImage();
                }, 350);
              }}
            >
              <Text style={styles.sheetActionText}>Seleccionar de la Galería</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetCancel} onPress={closePhotoMenu}>
              <Text style={styles.sheetCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
      </KeyboardAvoidingView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  innerWrapper: { flex: 1, flexDirection: 'column', overflow: 'hidden' },
  scrollBodyMobile: { padding: 16 },
  mainTitleMobile: { fontSize: 24 },
  formContainerMobile: { padding: 16, marginTop: 15 },
  inputMobile: { padding: 10, marginBottom: 15, fontSize: 14 },
  mainWrapper: { flex: 1, flexDirection: 'row', backgroundColor: '#f8f9fa', height: Platform.OS === 'web' ? '100vh' : '100%', overflow: 'hidden' },
  mainWrapperMobile: { flex: 1, flexDirection: 'column', backgroundColor: '#f8f9fa', height: Platform.OS === 'web' ? '100vh' : '100%', overflow: 'hidden' },
  sidebar: { width: 240, backgroundColor: '#0c1017', padding: 20 },
  sidebarMobile: { width: '100%', backgroundColor: '#0c1017', paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  brandIcon: { width: 36, height: 36, backgroundColor: '#e52320', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  brandName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  brandSub: { color: '#718096', fontSize: 10, fontWeight: '600' },
  sidebarSectionTitle: { color: '#4a5568', fontSize: 11, fontWeight: '700', marginBottom: 15, letterSpacing: 1 },
  navContainer: {},
  navContainerMobile: { flexDirection: 'row', alignItems: 'center' },
  sidebarBtn: { paddingVertical: 12, paddingHorizontal: 15, borderRadius: 8, marginBottom: 5 },
  sidebarBtnMobile: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginLeft: 8 },
  sidebarBtnText: { color: '#a0aec0', fontSize: 14, fontWeight: '500' },
  sidebarBtnTextMobile: { color: '#a0aec0', fontSize: 13, fontWeight: '600' },
  sidebarBtnActive: { backgroundColor: '#e52320', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 10, marginBottom: 5 },
  sidebarBtnActiveMobile: { backgroundColor: '#e52320', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginLeft: 8 },
  sidebarBtnTextActive: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  sidebarBtnTextActiveMobile: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  // MODIFICADO: Forzamos al área de contenido a calcular su altura restando el header para el desbordamiento
  contentArea: { flex: 1, height: Platform.OS === 'web' ? '100vh' : '100%', display: Platform.OS === 'web' ? 'flex' : undefined, flexDirection: 'column', overflow: 'hidden' },
  contentAreaMobile: { flex: 1, height: Platform.OS === 'web' ? 'calc(100vh - 56px)' : '100%', display: Platform.OS === 'web' ? 'flex' : undefined, flexDirection: 'column', overflow: 'hidden' },
  topHeader: { height: 70, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  headerRight: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  adminBadge: { alignItems: 'flex-end' },
  adminBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#1a202c' },
  adminSync: { fontSize: 9, color: '#48bb78', fontWeight: '600' },

  // MODIFICADO: El contenedor del scroll ahora tiene permitido desbordarse con scrollbar si el formulario es alto
  scrollBody: { padding: 30, flex: 1 },
  scrollContent: { paddingBottom: 40 }, // Da un margen extra abajo para que el botón "Guardar" respire

  mainTitle: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subTitle: { color: '#64748b', fontSize: 14, marginTop: 4 },
  formContainer: { backgroundColor: '#fff', padding: 30, borderRadius: 16, marginTop: 25, borderWidth: 1, borderColor: '#edf2f7' },
  formRow: { flexDirection: 'row' },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 5 },
  input: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 15, color: '#1e293b' },
  divider: { height: 1, backgroundColor: '#edf2f7', marginVertical: 15 },
  elegantPhotoContainer: { flexDirection: 'column', alignItems: 'flex-start', marginBottom: 25, marginTop: 10 },
  photoPreviewWrapper: { width: '100%', maxWidth: 360, aspectRatio: 16 / 9, borderRadius: 14, backgroundColor: '#f1f5f9', borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 12 },
  elegantPreview: { width: '100%', height: '100%' },
  selectPhotoRowBtn: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  selectPhotoRowText: { color: '#4a5568', fontWeight: '600', fontSize: 13 },
  noPhotoText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  btnActionContainer: { flexDirection: 'row', justifyContent: 'flex-start', marginTop: 5 },
  btn: { backgroundColor: '#e52320', paddingVertical: 12, paddingHorizontal: 35, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minWidth: 130 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, elevation: 18 },
  sheetHandle: { alignSelf: 'center', width: 46, height: 5, borderRadius: 999, backgroundColor: '#cbd5e1', marginBottom: 16 },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  sheetSubtitle: { marginTop: 4, marginBottom: 18, fontSize: 13, color: '#64748b' },
  sheetAction: { minHeight: 52, borderRadius: 14, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  sheetActionText: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
  sheetCancel: { minHeight: 52, borderRadius: 14, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
  sheetCancelText: { fontSize: 15, fontWeight: '800', color: '#475569' }
});