import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, TouchableOpacity, Image, Platform, useWindowDimensions, Modal, Pressable, Linking } from 'react-native';
import api from '../services/api';
import FloatingDialog from '../components/FloatingDialog';
import AppLayout from '../components/AppLayout';

export default function VehicleHistoryScreen({ route, navigation }) {
  const vehicleId = route.params?.vehicleId; 
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingMaintenanceId, setDeletingMaintenanceId] = useState(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [dialog, setDialog] = useState({ visible: false, type: 'info', title: '', message: '', confirmText: 'Aceptar', cancelText: 'Cancelar', onConfirm: null, onCancel: null, autoDismissMs: null });
  const [vehicleImageRatio, setVehicleImageRatio] = useState(16 / 9);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const getMaintenanceTypeLabel = (type) => {
    if (type === 'corrective') return 'CORRECTIVO';
    if (type === 'preventive') return 'PREVENTIVO';
    return type ? String(type).toUpperCase() : '';
  };

  const loadHistory = () => {
    setLoading(true);
    api.get(`/vehicles/${vehicleId}/history`)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    loadHistory();
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation, vehicleId]);

  if (loading || !data) return <View style={styles.center}><ActivityIndicator size="large" color="#e52320" /></View>;

  const { vehicle, total_spent, maintentances } = data;
  const trabajos = maintentances || data.maintenances || [];

  const doDelete = () => {
    setDeleting(true);
    api.delete(`/vehicles/${vehicleId}`)
      .then(() => {
        setDeleting(false);
        navigation.navigate('VehicleList');
      })
      .catch(err => {
        console.error(err);
        setDeleting(false);
        setDialog({
          visible: true,
          type: 'error',
          title: 'Error',
          message: 'No se pudo eliminar el vehículo.',
          confirmText: 'Cerrar',
          onConfirm: null,
          onCancel: null,
          autoDismissMs: null,
        });
      });
  };

  const doDeleteMaintenance = (maintenance) => {
    setDeletingMaintenanceId(maintenance.id);
    api.delete(`/maintenances/${maintenance.id}`)
      .then(() => {
        setDeletingMaintenanceId(null);
        loadHistory();
        setDialog({
          visible: true,
          type: 'success',
          title: 'Éxito',
          message: 'El trabajo de mantenimiento ha sido eliminado correctamente.',
          confirmText: 'Aceptar',
          onConfirm: null,
          onCancel: null,
          autoDismissMs: 2000,
        });
      })
      .catch(err => {
        console.error(err);
        setDeletingMaintenanceId(null);
        setDialog({
          visible: true,
          type: 'error',
          title: 'Error',
          message: 'No se pudo eliminar el trabajo.',
          confirmText: 'Cerrar',
          onConfirm: null,
          onCancel: null,
          autoDismissMs: null,
        });
      });
  };

  const confirmDeleteMaintenance = (maintenance) => {
    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Eliminar trabajo',
      message: '¿Seguro que deseas eliminar este trabajo? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => doDeleteMaintenance(maintenance),
      onCancel: () => setDialog(prev => ({ ...prev, visible: false })),
      autoDismissMs: null,
    });
  };

  const openEditMaintenance = (maintenance) => {
    navigation.navigate('AddMaintenance', {
      vehicleId: vehicle.id,
      maintenance,
    });
  };

  const closeMaintenanceMenu = () => {
    setSelectedMaintenance(null);
  };

  const toggleMaintenanceMenu = (item) => {
    if (selectedMaintenance && selectedMaintenance.id === item.id) {
      closeMaintenanceMenu();
      return;
    }
    setSelectedMaintenance(item);
  };

  const handleDownloadVehicleReport = () => {
    const baseURL = api.defaults.baseURL;
    const reportURL = `${baseURL}/vehicles/${vehicleId}/report`;
    if (Platform.OS === 'web') {
      window.open(reportURL, '_blank');
    } else {
      Linking.openURL(reportURL);
    }
  };

  const handleDeleteReminder = (reminderId) => {
    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Eliminar recordatorio',
      message: '¿Seguro que deseas eliminar este recordatorio/alerta? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        api.delete(`/reminders/${reminderId}`)
          .then(() => {
            loadHistory();
            setDialog({
              visible: true,
              type: 'success',
              title: 'Éxito',
              message: 'El recordatorio ha sido eliminado correctamente.',
              confirmText: 'Aceptar',
              onConfirm: null,
              onCancel: null,
              autoDismissMs: 2000,
            });
          })
          .catch(err => {
            console.error(err);
            setDialog({
              visible: true,
              type: 'error',
              title: 'Error',
              message: 'No se pudo eliminar el recordatorio.',
              confirmText: 'Cerrar',
              onConfirm: null,
              onCancel: null,
              autoDismissMs: null,
            });
          });
      },
      onCancel: () => setDialog(prev => ({ ...prev, visible: false })),
      autoDismissMs: null,
    });
  };

  const openVehicleDeleteConfirm = () => {
    setDialog({
      visible: true,
      type: 'confirm',
      title: 'Eliminar vehículo',
      message: '¿Seguro que deseas eliminar este vehículo? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: doDelete,
      onCancel: () => setDialog(prev => ({ ...prev, visible: false })),
      autoDismissMs: null,
    });
  };

  const handleChangeStatus = (newStatus) => {
    api.patch(`/vehicles/${vehicleId}/status`, { status: newStatus })
      .then(() => {
        loadHistory();
        setDialog({
          visible: true,
          type: 'success',
          title: 'Éxito',
          message: 'Estado del vehículo actualizado correctamente.',
          confirmText: 'Aceptar',
          onConfirm: null,
          onCancel: null,
          autoDismissMs: 2000,
        });
      })
      .catch(err => {
        console.error(err);
        setDialog({
          visible: true,
          type: 'error',
          title: 'Error',
          message: 'No se pudo actualizar el estado del vehículo.',
          confirmText: 'Cerrar',
          onConfirm: null,
          onCancel: null,
          autoDismissMs: null,
        });
      });
  };

  return (
    <AppLayout activeTab="VehicleList" navigation={navigation} title="Detalle Vehículo" hideTabBarOnMobile={true}>
      <View style={styles.innerWrapper}>
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Text style={styles.backBtnText}>Volver</Text></TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.deleteVehicleBtn} onPress={openVehicleDeleteConfirm}>
              <Text style={styles.deleteVehicleBtnText}>Eliminar Vehículo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={[styles.scrollBody, isMobile && styles.scrollBodyMobile]} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.mainCard, isMobile && styles.mainCardMobile]}>
            {vehicle.image_url && (
              <Image
                source={{ uri: vehicle.image_url }}
                style={[
                  styles.vehicleImage,
                  isMobile ? styles.vehicleImageMobile : styles.vehicleImageWeb,
                  { aspectRatio: vehicleImageRatio }
                ]}
                resizeMode="contain"
                onLoad={(event) => {
                  const source = event.nativeEvent && event.nativeEvent.source ? event.nativeEvent.source : null;
                  if (source && source.width && source.height) {
                    setVehicleImageRatio(source.width / source.height);
                  }
                }}
              />
            )}
            <Text style={[styles.plateText, isMobile && styles.plateTextMobile]}>Ficha: {vehicle.plate}</Text>
            <Text style={[styles.infoText, isMobile && styles.infoTextMobile]}>{vehicle.brand} {vehicle.model} ({vehicle.year}) • Kilometraje: {vehicle.current_mileage.toLocaleString()} km</Text>
            
            <View style={styles.statusSection}>
              <Text style={styles.statusSectionLabel}>Estado del Vehículo:</Text>
              <View style={styles.statusBadgeGroup}>
                <TouchableOpacity 
                  style={[
                    styles.statusBadge, 
                    vehicle.status === 'active' ? styles.statusBadgeActive : styles.statusBadgeInactiveStyle
                  ]}
                  onPress={() => handleChangeStatus('active')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.statusBadgeText, 
                    vehicle.status === 'active' ? styles.statusBadgeTextActive : styles.statusBadgeTextInactiveStyle
                  ]}>🟢 Activo</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.statusBadge, 
                    vehicle.status === 'workshop' ? styles.statusBadgeWorkshop : styles.statusBadgeInactiveStyle
                  ]}
                  onPress={() => handleChangeStatus('workshop')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.statusBadgeText, 
                    vehicle.status === 'workshop' ? styles.statusBadgeTextWorkshop : styles.statusBadgeTextInactiveStyle
                  ]}>🛠️ En Taller</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.statusBadge, 
                    vehicle.status === 'inactive' ? styles.statusBadgeInactive : styles.statusBadgeInactiveStyle
                  ]}
                  onPress={() => handleChangeStatus('inactive')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.statusBadgeText, 
                    vehicle.status === 'inactive' ? styles.statusBadgeTextInactive : styles.statusBadgeTextInactiveStyle
                  ]}>🔴 Inactivo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* SECCIÓN DE ALERTAS ACTIVAS DEL VEHÍCULO */}
          {data.active_alerts && data.active_alerts.length > 0 && (
            <View style={styles.activeAlertsSection}>
              {data.active_alerts.map((alert) => {
                const isExpired = alert.alert_status === 'expired';
                
                let statusDetails = "";
                if (alert.target_mileage) {
                  const remaining = alert.target_mileage - vehicle.current_mileage;
                  if (remaining <= 0) {
                    statusDetails += `📍 Kilometraje objetivo (${alert.target_mileage.toLocaleString()} km) excedido por ${Math.abs(remaining).toLocaleString()} km. `;
                  } else {
                    statusDetails += `📍 Kilometraje objetivo (${alert.target_mileage.toLocaleString()} km): faltan ${remaining.toLocaleString()} km. `;
                  }
                }
                if (alert.target_date) {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const limitDate = new Date(alert.target_date);
                  limitDate.setHours(0, 0, 0, 0);
                  const diffTime = limitDate - today;
                  const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));

                  if (daysLeft < 0) {
                    statusDetails += `📅 Fecha límite (${alert.target_date}) vencida hace ${Math.abs(daysLeft)} días.`;
                  } else if (daysLeft === 0) {
                    statusDetails += `📅 Fecha límite (${alert.target_date}) vence HOY.`;
                  } else {
                    statusDetails += `📅 Fecha límite (${alert.target_date}) vence en ${daysLeft} días.`;
                  }
                }

                return (
                  <View
                    key={alert.id}
                    style={[
                      styles.alertDetailCard,
                      isExpired ? styles.alertDetailCardExpired : styles.alertDetailCardUpcoming
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={[styles.alertDetailBadge, { color: isExpired ? '#e52320' : '#b88600' }]}>
                          {isExpired ? '🚨 ALERTA CRÍTICA' : '⚠️ ATENCIÓN REQUERIDA'}
                        </Text>
                        <Text style={styles.alertDetailTitle}>{alert.title}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.dismissAlertBtn} 
                        onPress={() => handleDeleteReminder(alert.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dismissAlertBtnText}>✕ Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                    {alert.description ? (
                      <Text style={styles.alertDetailDesc}>{alert.description}</Text>
                    ) : null}
                    <Text style={styles.alertDetailStatusText}>{statusDetails}</Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={[styles.spentCard, isMobile && styles.spentCardMobile]}>
            <Text style={{ color: '#94a3b8', fontWeight: '600', fontSize: isMobile ? 12 : 14 }}>Inversión Histórica en Mantenimientos</Text>
            <Text style={{ color: '#fff', fontSize: isMobile ? 22 : 26, fontWeight: '800', marginTop: 4 }}>${parseFloat(total_spent).toFixed(2)}</Text>
          </View>

          <View style={{ marginTop: 25, marginBottom: 15 }}>
            <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>Historial de Trabajos</Text>
          </View>

          <TouchableOpacity style={styles.redActionBtn} onPress={handleDownloadVehicleReport} activeOpacity={0.8}>
            <Text style={styles.redActionBtnText}>Descargar Reporte de Historial (PDF)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.blackActionBtn, { marginTop: 10 }]} onPress={() => navigation.navigate('AddMaintenance', { vehicleId: vehicle.id, currentMileage: vehicle.current_mileage })} activeOpacity={0.8}>
            <Text style={styles.blackActionBtnText}>Registrar Trabajo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.redActionBtn, { marginTop: 10, marginBottom: 15 }]} onPress={() => navigation.navigate('AddReminder', { vehicleId: vehicle.id, currentMileage: vehicle.current_mileage })} activeOpacity={0.8}>
            <Text style={styles.redActionBtnText}>Agregar Recordatorio</Text>
          </TouchableOpacity>

          {trabajos.length === 0 ? (
            <View style={styles.noDataCard}>
              <Text style={{ color: '#64748b', fontStyle: 'italic', fontSize: isMobile ? 12 : 14 }}>Esta unidad no registra órdenes mecánicas aún.</Text>
            </View>
          ) : (
            trabajos.map(item => (
              <View key={item.id} style={[styles.maintenanceCard, isMobile && styles.maintenanceCardMobile]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontWeight: '800', color: item.type === 'corrective' ? '#e52320' : '#1a73e8', fontSize: isMobile ? 12 : 14 }}>
                      {getMaintenanceTypeLabel(item.type)}
                    </Text>
                    <Text style={{ color: '#64748b', fontSize: isMobile ? 11 : 13, fontWeight: '500', marginTop: 2 }}>📅 {item.date}</Text>
                  </View>
                  <View style={styles.menuWrapper}>
                    <TouchableOpacity
                      style={styles.menuTrigger}
                      onPress={() => toggleMaintenanceMenu(item)}
                    >
                      <Text style={styles.menuTriggerText}>⋮</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={{ marginVertical: 8, color: '#334155', fontSize: isMobile ? 13 : 14 }}>{item.description}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 }}>
                  <Text style={{ fontWeight: '500', color: '#64748b', fontSize: isMobile ? 12 : 13 }}>👤 Operador: {item.responsible}</Text>
                  <Text style={{ fontWeight: '800', color: '#38a169', fontSize: isMobile ? 13 : 14 }}>${parseFloat(item.cost).toFixed(2)}</Text>
                </View>
                {item.address ? (
                  <Text style={styles.addressText}>📍 {item.address}</Text>
                ) : null}
              </View>
            ))
          )}
        </ScrollView>
        <Modal
          visible={Boolean(selectedMaintenance)}
          transparent
          animationType="slide"
          onRequestClose={closeMaintenanceMenu}
        >
          <Pressable style={styles.sheetBackdrop} onPress={closeMaintenanceMenu}>
            <Pressable style={styles.sheetContainer} onPress={() => {}}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Opciones del trabajo</Text>
              <Text style={styles.sheetSubtitle}>{selectedMaintenance ? selectedMaintenance.description : ''}</Text>
              <TouchableOpacity
                style={styles.sheetAction}
                onPress={() => {
                  const maintenance = selectedMaintenance;
                  closeMaintenanceMenu();
                  if (maintenance) openEditMaintenance(maintenance);
                }}
              >
                <Text style={styles.sheetActionText}>Editar trabajo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetAction, styles.sheetActionDanger]}
                onPress={() => {
                  const maintenance = selectedMaintenance;
                  closeMaintenanceMenu();
                  if (maintenance) confirmDeleteMaintenance(maintenance);
                }}
                disabled={selectedMaintenance ? deletingMaintenanceId === selectedMaintenance.id : false}
              >
                <Text style={styles.sheetActionDangerText}>
                  {selectedMaintenance && deletingMaintenanceId === selectedMaintenance.id ? 'Eliminando...' : 'Eliminar trabajo'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetCancel} onPress={closeMaintenanceMenu}>
                <Text style={styles.sheetCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
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
        onClose={() => setDialog(prev => ({ ...prev, visible: false }))}
        autoDismissMs={dialog.autoDismissMs}
      />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  innerWrapper: { flex: 1, flexDirection: 'column', overflow: 'hidden' },
  scrollBodyMobile: { padding: 16 },
  mainCardMobile: { padding: 16, marginBottom: 10 },
  plateTextMobile: { fontSize: 20 },
  infoTextMobile: { fontSize: 13 },
  spentCardMobile: { padding: 16 },
  sectionTitleMobile: { fontSize: 18 },
  maintenanceCardMobile: { padding: 16 },
  mainWrapper: { flex: 1, flexDirection: 'row', backgroundColor: '#f8f9fa', height: Platform.OS === 'web' ? '100vh' : '100%', overflow: 'hidden' },
  mainWrapperMobile: { flex: 1, flexDirection: 'column', backgroundColor: '#f8f9fa', height: Platform.OS === 'web' ? '100vh' : '100%', overflow: 'hidden' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  topHeader: { height: 70, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30, borderBottomWidth: 1, borderBottomColor: '#edf2f7', zIndex: 10 },
  backBtn: { backgroundColor: '#000000', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  backBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  deleteVehicleBtn: { backgroundColor: '#dc2626', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  deleteVehicleBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  confirmBtn: { backgroundColor: '#dc2626', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginRight: 6 },
  confirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  cancelConfirmBtn: { backgroundColor: '#e2e8f0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  cancelConfirmBtnText: { color: '#475569', fontWeight: 'bold', fontSize: 13 },
  adminBadge: { alignItems: 'flex-end' },
  adminBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#1a202c' },
  adminSync: { fontSize: 9, color: '#48bb78', fontWeight: '600' },
  scrollBody: { padding: 30, flex: 1 },
  scrollContent: { paddingBottom: 40 },
  mainCard: { backgroundColor: '#fff', padding: 25, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#edf2f7' },
  plateText: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  infoText: { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: '500' },
  spentCard: { backgroundColor: '#0c1017', padding: 20, borderRadius: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  maintenanceCard: { backgroundColor: '#fff', padding: 20, borderRadius: 14, marginTop: 12, borderWidth: 1, borderColor: '#edf2f7', elevation: 1, overflow: 'visible' },
  menuWrapper: { position: 'relative', alignItems: 'flex-end', overflow: 'visible' },
  menuTrigger: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  menuTriggerText: { color: '#475569', fontSize: 16, fontWeight: '900', marginTop: -2 },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, elevation: 18 },
  sheetHandle: { alignSelf: 'center', width: 46, height: 5, borderRadius: 999, backgroundColor: '#cbd5e1', marginBottom: 16 },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  sheetSubtitle: { marginTop: 4, marginBottom: 18, fontSize: 13, color: '#64748b' },
  sheetAction: { minHeight: 52, borderRadius: 14, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  sheetActionText: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
  sheetActionDanger: { backgroundColor: '#fee2e2' },
  sheetActionDangerText: { fontSize: 15, fontWeight: '800', color: '#dc2626' },
  sheetCancel: { minHeight: 52, borderRadius: 14, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
  sheetCancelText: { fontSize: 15, fontWeight: '800', color: '#475569' },
  addressText: { marginTop: 8, color: '#475569', fontSize: 13, fontWeight: '500' },
  noDataCard: { backgroundColor: '#fff', padding: 20, borderRadius: 14, borderWidth: 1, borderColor: '#edf2f7', alignItems: 'center', marginTop: 10 },
  vehicleImage: { alignSelf: 'center', borderRadius: 12, marginBottom: 20, backgroundColor: '#f1f5f9' },
  vehicleImageWeb: { width: '100%', maxWidth: 560 },
  vehicleImageMobile: { width: '100%', maxWidth: 340 },
  activeAlertsSection: { marginBottom: 20 },
  alertDetailCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  alertDetailCardExpired: { borderColor: '#fed7d7', borderLeftWidth: 6, borderLeftColor: '#e52320' },
  alertDetailCardUpcoming: { borderColor: '#fde68a', borderLeftWidth: 6, borderLeftColor: '#ffcc00' },
  alertDetailBadge: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  alertDetailTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  alertDetailDesc: { fontSize: 13, color: '#64748b', marginBottom: 8, fontStyle: 'italic' },
  alertDetailStatusText: { fontSize: 12, color: '#334155', fontWeight: '600', lineHeight: 18 },
  blackActionBtn: { backgroundColor: '#000000', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  blackActionBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  redActionBtn: { backgroundColor: '#e52320', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  redActionBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  statusSection: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12 },
  statusSectionLabel: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 8 },
  statusBadgeGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  statusBadgeInactiveStyle: { backgroundColor: '#f8fafc', borderColor: '#cbd5e1' },
  statusBadgeActive: { backgroundColor: '#e2fbe8', borderColor: '#86efac' },
  statusBadgeWorkshop: { backgroundColor: '#fef3c7', borderColor: '#fde047' },
  statusBadgeInactive: { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
  statusBadgeText: { fontSize: 13, fontWeight: '700' },
  statusBadgeTextInactiveStyle: { color: '#64748b' },
  statusBadgeTextActive: { color: '#15803d' },
  statusBadgeTextWorkshop: { color: '#a16207' },
  statusBadgeTextInactive: { color: '#b91c1c' },
  blueActionBtn: { backgroundColor: '#1a73e8', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  blueActionBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  dismissAlertBtn: { backgroundColor: '#fee2e2', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: '#fca5a5' },
  dismissAlertBtnText: { color: '#dc2626', fontSize: 11, fontWeight: '700' }
});