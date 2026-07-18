import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Platform, useWindowDimensions, KeyboardAvoidingView, Modal, Pressable } from 'react-native';
import api from '../services/api';
import FloatingDialog from '../components/FloatingDialog';
import AppLayout from '../components/AppLayout';

export default function AddMaintenanceScreen({ route, navigation }) {
  const vehicleId = route.params?.vehicleId;
  const maintenance = route.params?.maintenance;
  const isEditing = Boolean(maintenance?.id);
  const [form, setForm] = useState({
    vehicle_id: maintenance?.vehicle_id || vehicleId,
    date: maintenance?.date || new Date().toISOString().split('T')[0],
    type: maintenance?.type || 'preventive',
    description: maintenance?.description || '',
    mileage: maintenance?.mileage !== undefined && maintenance?.mileage !== null 
      ? String(maintenance.mileage) 
      : (route.params?.currentMileage !== undefined && route.params?.currentMileage !== null ? String(route.params.currentMileage) : ''),
    cost: maintenance?.cost !== undefined && maintenance?.cost !== null ? String(maintenance.cost) : '',
    responsible: maintenance?.responsible || '',
    address: maintenance?.address || ''
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
    setForm(prev => ({ ...prev, date: `${year}-${month}-${dayStr}` }));
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
    const mileageStr = form.mileage ? String(form.mileage).trim() : '';
    const costStr = form.cost ? String(form.cost).trim() : '';
    const dateStr = form.date ? String(form.date).trim() : '';
    const responsibleStr = form.responsible ? String(form.responsible).trim() : '';
    const addressStr = form.address ? String(form.address).trim() : '';
    const descriptionStr = form.description ? String(form.description).trim() : '';

    if (!mileageStr) return showDialog({ type: 'warning', title: 'Campo requerido', message: 'Por favor, ingresa el kilometraje.' });
    const mileageNum = parseInt(mileageStr, 10);
    if (isNaN(mileageNum) || mileageNum <= 0 || !/^\d+$/.test(mileageStr)) {
      return showDialog({ type: 'warning', title: 'Kilometraje Inválido', message: 'Por favor, ingresa un número de kilometraje válido y mayor a cero.' });
    }

    if (!costStr) return showDialog({ type: 'warning', title: 'Campo requerido', message: 'Por favor, ingresa el costo.' });
    const costNum = parseFloat(costStr);
    if (isNaN(costNum) || costNum < 0 || !/^\d+(\.\d+)?$/.test(costStr)) {
      return showDialog({ type: 'warning', title: 'Costo Inválido', message: 'Por favor, ingresa un costo válido (debe ser un número mayor o igual a cero).' });
    }

    if (!dateStr) return showDialog({ type: 'warning', title: 'Campo requerido', message: 'Por favor, ingresa la fecha del trabajo.' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return showDialog({ type: 'warning', title: 'Fecha Inválida', message: 'Por favor, ingresa la fecha en formato AAAA-MM-DD.' });
    }

    if (!responsibleStr) return showDialog({ type: 'warning', title: 'Campo requerido', message: 'Por favor, ingresa el encargado.' });
    if (!descriptionStr) return showDialog({ type: 'warning', title: 'Campo requerido', message: 'Por favor, ingresa una descripción.' });

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        vehicle_id: maintenance?.vehicle_id || vehicleId,
        mileage: mileageNum,
        cost: costNum,
        responsible: responsibleStr,
        address: addressStr,
        description: descriptionStr
      };

      if (isEditing) {
        await api.put(`/maintenances/${maintenance.id}`, payload);
      } else {
        await api.post('/maintenances', payload);
      }

      showDialog({
        type: 'success',
        title: 'Éxito',
        message: isEditing ? 'Orden de trabajo actualizada.' : 'Orden de trabajo registrada.',
        confirmText: 'Continuar',
        autoDismissMs: 1300,
        onClose: () => navigation.goBack(),
      });
    } catch (err) {
      console.error(err);
      showDialog({ type: 'error', title: 'Error', message: 'No se pudo guardar el mantenimiento.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout activeTab="VehicleList" navigation={navigation} title={isEditing ? "Editar Trabajo" : "Nueva Orden"} hideTabBarOnMobile={true}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.innerWrapper}>
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Text style={styles.backBtnText}>{isEditing ? 'Cancelar' : 'Cancelar'}</Text></TouchableOpacity>
          <View style={styles.headerRight}>
          </View>
        </View>

        <ScrollView style={[styles.scrollBody, isMobile && styles.scrollBodyMobile]} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.mainTitle, isMobile && styles.mainTitleMobile]}>{isEditing ? 'Editar Orden de Trabajo' : 'Ingreso de Orden de Trabajo'}</Text>
          <Text style={styles.subTitle}>{isEditing ? 'Corrige los datos de esta intervención mecánica.' : 'Registra las modificaciones mecánicas aplicadas a la unidad.'}</Text>

          <View style={[styles.formContainer, isMobile && styles.formContainerMobile]}>
            <Text style={styles.label}>Tipo de Trabajo</Text>
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              <TouchableOpacity style={[styles.typeBtn, form.type === 'preventive' && { backgroundColor: '#000000', borderColor: '#000000' }]} onPress={() => setForm({ ...form, type: 'preventive' })}>
                <Text style={{ color: form.type === 'preventive' ? '#fff' : '#4a5568', fontWeight: '700' }}>Preventivo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeBtn, form.type === 'corrective' && { backgroundColor: '#e52320', borderColor: '#e52320' }]} onPress={() => setForm({ ...form, type: 'corrective' })}>
                <Text style={{ color: form.type === 'corrective' ? '#fff' : '#4a5568', fontWeight: '700' }}>Correctivo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formRow}>
              <View style={{ flex: 1, marginRight: 15 }}>
                <Text style={styles.label}>Kilometraje de Control</Text>
                <TextInput style={[styles.input, isMobile && styles.inputMobile]} value={form.mileage} placeholder="Ej: 45000" placeholderTextColor="#94a3b8" keyboardType="numeric" onChangeText={t => setForm({ ...form, mileage: t })} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Costo Neto ($)</Text>
                <TextInput style={[styles.input, isMobile && styles.inputMobile]} value={form.cost} placeholder="0.00" placeholderTextColor="#94a3b8" keyboardType="numeric" onChangeText={t => setForm({ ...form, cost: t })} />
              </View>
            </View>

            <Text style={styles.label}>Fecha del Trabajo</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setShowCalendar(true)}>
              <View pointerEvents="none">
                <TextInput 
                  style={[styles.input, isMobile && styles.inputMobile]} 
                  value={form.date} 
                  placeholder="Seleccionar..." 
                  placeholderTextColor="#94a3b8" 
                  editable={false}
                />
              </View>
            </TouchableOpacity>

            <Text style={styles.label}>Mecánico / Operador Responsable</Text>
            <TextInput style={[styles.input, isMobile && styles.inputMobile]} value={form.responsible} placeholder="Nombre del taller o encargado" placeholderTextColor="#94a3b8" onChangeText={t => setForm({ ...form, responsible: t })} />

            <Text style={styles.label}>Dirección y lugar del trabajo</Text>
            <TextInput style={[styles.input, isMobile && styles.inputMobile]} value={form.address} placeholder="Ej: Taller Central, Av. Principal 123" placeholderTextColor="#94a3b8" onChangeText={t => setForm({ ...form, address: t })} />

            <Text style={styles.label}>Descripción Detallada del Servicio</Text>
            <TextInput style={[styles.input, isMobile && styles.inputMobile, { height: 90, textAlignVertical: 'top' }]} value={form.description} placeholder="Detalla las reparaciones efectuadas..." placeholderTextColor="#94a3b8" multiline onChangeText={t => setForm({ ...form, description: t })} />

            {/* BOTÓN GUARDAR CORTO */}
            <View style={styles.btnActionContainer}>
              <TouchableOpacity style={[styles.btn, submitting && { backgroundColor: '#a0aec0' }]} onPress={handleSave} disabled={submitting}>
                <Text style={styles.btnText}>{submitting ? "Guardando..." : (isEditing ? "Actualizar" : "Guardar")}</Text>
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
                    day && form.date === `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` && styles.selectedDayCell
                  ]}
                  onPress={() => handleSelectDay(day)}
                  disabled={!day}
                >
                  <Text style={[
                    styles.dayText,
                    !day && styles.emptyDayText,
                    day && form.date === `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` && styles.selectedDayText
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
        confirmText={dialog.confirmText || 'Aceptar'}
        onClose={() => {
          setDialog(prev => ({ ...prev, visible: false }));
          if (dialog.onClose) dialog.onClose();
        }}
        autoDismissMs={dialog.autoDismissMs}
      />
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
  contentArea: { flex: 1, height: Platform.OS === 'web' ? '100vh' : '100%', display: Platform.OS === 'web' ? 'flex' : undefined, flexDirection: 'column', overflow: 'hidden' },
  contentAreaMobile: { flex: 1, height: Platform.OS === 'web' ? 'calc(100vh - 56px)' : '100%', display: Platform.OS === 'web' ? 'flex' : undefined, flexDirection: 'column', overflow: 'hidden' },
  topHeader: { height: 70, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  backBtn: { backgroundColor: '#000000', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  backBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  adminBadge: { alignItems: 'flex-end' },
  adminBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#1a202c' },
  adminSync: { fontSize: 9, color: '#48bb78', fontWeight: '600' },
  scrollBody: { padding: 30, flex: 1 },
  scrollContent: { paddingBottom: 40 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subTitle: { color: '#64748b', fontSize: 14, marginTop: 4 },
  formContainer: { backgroundColor: '#fff', padding: 30, borderRadius: 16, marginTop: 25, borderWidth: 1, borderColor: '#edf2f7' },
  formRow: { flexDirection: 'row' },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 6 },
  input: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 15, color: '#1e293b' },
  typeBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', borderRadius: 8, marginHorizontal: 4, backgroundColor: '#f8fafc' },
  btnActionContainer: { flexDirection: 'row', justifyContent: 'flex-start', marginTop: 5 },
  btn: { backgroundColor: '#e52320', paddingVertical: 12, paddingHorizontal: 35, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minWidth: 130 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
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