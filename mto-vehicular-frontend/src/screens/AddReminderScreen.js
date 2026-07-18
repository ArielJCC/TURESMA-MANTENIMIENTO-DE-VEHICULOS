import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Platform, useWindowDimensions, KeyboardAvoidingView, Modal, Pressable } from 'react-native';
import api from '../services/api';
import FloatingDialog from '../components/FloatingDialog';
import AppLayout from '../components/AppLayout';

export default function AddReminderScreen({ route, navigation }) {
  const vehicleId = route.params?.vehicleId;
  const currentMileage = route.params?.currentMileage;
  const [form, setForm] = useState({
    title: '',
    description: '',
    target_mileage: currentMileage !== undefined && currentMileage !== null ? String(currentMileage) : '',
    target_date: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ visible: false, type: 'info', title: '', message: '', autoDismissMs: null, onClose: null });
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  const getDaysGrid = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const grid = [];
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push(null);
    }
    for (let day = 1; day <= totalDays; day++) {
      grid.push(day);
    }
    return grid;
  };

  const handleSelectDay = (day) => {
    if (!day) return;
    const year = calendarDate.getFullYear();
    const month = String(calendarDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    setForm(prev => ({ ...prev, target_date: `${year}-${month}-${dayStr}` }));
    setShowCalendar(false);
  };

  const changeMonth = (offset) => {
    setCalendarDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + offset);
      return next;
    });
  };

  const showDialog = (nextDialog) => {
    setDialog({ visible: true, type: 'info', title: '', message: '', autoDismissMs: null, onClose: null, ...nextDialog });
  };

  const handleSave = async () => {
    const titleStr = form.title ? String(form.title).trim() : '';
    const descriptionStr = form.description ? String(form.description).trim() : '';
    const mileageStr = form.target_mileage ? String(form.target_mileage).trim() : '';
    const dateStr = form.target_date ? String(form.target_date).trim() : '';

    if (!titleStr) {
      return showDialog({ type: 'warning', title: 'Campo requerido', message: 'Por favor, ingresa un título para el recordatorio.' });
    }

    if (!mileageStr && !dateStr) {
      return showDialog({ type: 'warning', title: 'Criterio Requerido', message: 'Debes ingresar al menos un Kilometraje Objetivo o una Fecha Límite para activar el recordatorio.' });
    }

    let mileageNum = null;
    if (mileageStr) {
      mileageNum = parseInt(mileageStr, 10);
      if (isNaN(mileageNum) || mileageNum <= 0 || !/^\d+$/.test(mileageStr)) {
        return showDialog({ type: 'warning', title: 'Kilometraje Inválido', message: 'Por favor, ingresa un número de kilometraje válido y mayor a cero.' });
      }
    }

    if (dateStr && !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return showDialog({ type: 'warning', title: 'Fecha Inválida', message: 'Por favor, ingresa la fecha en formato AAAA-MM-DD.' });
    }

    setSubmitting(true);
    try {
      const payload = {
        title: titleStr,
        description: descriptionStr || null,
        target_mileage: mileageNum,
        target_date: dateStr || null
      };

      await api.post(`/vehicles/${vehicleId}/reminders`, payload);

      showDialog({
        type: 'success',
        title: 'Éxito',
        message: 'Recordatorio programado correctamente.',
        confirmText: 'Continuar',
        autoDismissMs: 1300,
        onClose: () => navigation.goBack(),
      });
    } catch (err) {
      console.error(err);
      let errMsg = 'No se pudo guardar el recordatorio.';
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        if (errors[firstErrorKey] && errors[firstErrorKey][0]) {
          errMsg = errors[firstErrorKey][0];
        }
      }
      showDialog({ type: 'error', title: 'Error', message: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout activeTab="VehicleList" navigation={navigation} title="Agregar Recordatorio" hideTabBarOnMobile={true}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.innerWrapper}>
          <View style={styles.topHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <View style={styles.headerRight} />
          </View>

          <ScrollView style={[styles.scrollBody, isMobile && styles.scrollBodyMobile]} contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.mainTitle, isMobile && styles.mainTitleMobile]}>Nuevo Recordatorio</Text>
            <Text style={styles.subTitle}>Configura un recordatorio personalizado por kilometraje, fecha límite o ambos.</Text>

            <View style={[styles.formContainer, isMobile && styles.formContainerMobile]}>
              <Text style={styles.label}>Título del Recordatorio</Text>
              <TextInput 
                style={[styles.input, isMobile && styles.inputMobile]} 
                value={form.title} 
                placeholder="Ej: Cambio de Bujías, Rotación de Llantas" 
                placeholderTextColor="#94a3b8" 
                onChangeText={t => setForm({ ...form, title: t })} 
              />

              <Text style={styles.label}>Descripción (Opcional)</Text>
              <TextInput 
                style={[styles.input, isMobile && styles.inputMobile]} 
                value={form.description} 
                placeholder="Detalles adicionales del recordatorio..." 
                placeholderTextColor="#94a3b8" 
                onChangeText={t => setForm({ ...form, description: t })} 
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 15 }}>
                  <Text style={styles.label}>Kilometraje Objetivo</Text>
                  <TextInput 
                    style={[styles.input, isMobile && styles.inputMobile]} 
                    value={form.target_mileage} 
                    placeholder="Ej: 55000" 
                    placeholderTextColor="#94a3b8" 
                    keyboardType="numeric" 
                    onChangeText={t => setForm({ ...form, target_mileage: t })} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Fecha Límite</Text>
                  <TouchableOpacity activeOpacity={0.8} onPress={() => setShowCalendar(true)}>
                    <View pointerEvents="none">
                      <TextInput 
                        style={[styles.input, isMobile && styles.inputMobile]} 
                        value={form.target_date} 
                        placeholder="Seleccionar..." 
                        placeholderTextColor="#94a3b8" 
                        editable={false}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.btnActionContainer}>
                <TouchableOpacity style={[styles.btn, submitting && { backgroundColor: '#a0aec0' }]} onPress={handleSave} disabled={submitting}>
                  <Text style={styles.btnText}>{submitting ? "Programando..." : "Guardar Recordatorio"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        <Modal
          visible={showCalendar}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCalendar(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowCalendar(false)}>
            <Pressable style={styles.calendarContainer} onPress={() => {}}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
                  <Text style={styles.navBtnText}>◀</Text>
                </TouchableOpacity>
                <Text style={styles.calendarTitle}>
                  {months[calendarDate.getMonth()]} {calendarDate.getFullYear()}
                </Text>
                <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
                  <Text style={styles.navBtnText}>▶</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.weekRow}>
                {weekDays.map(d => (
                  <Text key={d} style={styles.weekDayText}>{d}</Text>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {getDaysGrid().map((day, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dayCell,
                      day && form.target_date === `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` && styles.selectedDayCell
                    ]}
                    onPress={() => handleSelectDay(day)}
                    disabled={!day}
                  >
                    <Text style={[
                      styles.dayText,
                      !day && styles.emptyDayText,
                      day && form.target_date === `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` && styles.selectedDayText
                    ]}>
                      {day || ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.closeCalBtn} onPress={() => setShowCalendar(false)}>
                <Text style={styles.closeCalBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        <FloatingDialog
          visible={dialog.visible}
          type={dialog.type}
          title={dialog.title}
          message={dialog.message}
          confirmText={dialog.confirmText}
          cancelText={dialog.cancelText}
          onConfirm={() => {
            const fn = dialog.onConfirm;
            setDialog(prev => ({ ...prev, visible: false }));
            if (fn) fn();
          }}
          onCancel={() => {
            const fn = dialog.onCancel;
            setDialog(prev => ({ ...prev, visible: false }));
            if (fn) fn();
          }}
          onClose={() => {
            const fn = dialog.onClose;
            setDialog(prev => ({ ...prev, visible: false }));
            if (fn) fn();
          }}
          autoDismissMs={dialog.autoDismissMs}
        />
      </KeyboardAvoidingView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  innerWrapper: { flex: 1, flexDirection: 'column' },
  topHeader: { height: 70, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30, borderBottomWidth: 1, borderBottomColor: '#edf2f7', zIndex: 10 },
  backBtn: { backgroundColor: '#000000', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  backBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  headerRight: {},
  scrollBody: { padding: 30, flex: 1, backgroundColor: '#f8f9fa' },
  scrollBodyMobile: { padding: 16 },
  scrollContent: { paddingBottom: 40 },
  mainTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  mainTitleMobile: { fontSize: 20 },
  subTitle: { fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 25, fontWeight: '500' },
  formContainer: { backgroundColor: '#fff', padding: 25, borderRadius: 16, borderStyle: 'solid', borderWidth: 1, borderColor: '#edf2f7' },
  formContainerMobile: { padding: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8 },
  input: { height: 48, borderColor: '#cbd5e1', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, marginBottom: 20, fontSize: 14, color: '#0f172a', backgroundColor: '#f8fafc' },
  inputMobile: { height: 44, borderRadius: 8, marginBottom: 15 },
  formRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btnActionContainer: { marginTop: 10 },
  btn: { backgroundColor: '#e52320', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  calendarContainer: { backgroundColor: '#ffffff', width: '100%', maxWidth: 340, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  navBtn: { padding: 10 },
  navBtnText: { fontSize: 16, color: '#334155', fontWeight: 'bold' },
  calendarTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  weekDayText: { width: 36, textAlign: 'center', fontWeight: '700', color: '#94a3b8', fontSize: 12 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  dayCell: { width: 42, height: 40, justifyContent: 'center', alignItems: 'center', marginVertical: 2, borderRadius: 8 },
  selectedDayCell: { backgroundColor: '#e52320' },
  dayText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  emptyDayText: { color: 'transparent' },
  selectedDayText: { color: '#ffffff', fontWeight: '800' },
  closeCalBtn: { marginTop: 15, backgroundColor: '#f1f5f9', height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  closeCalBtnText: { color: '#475569', fontSize: 14, fontWeight: '700' }
});
