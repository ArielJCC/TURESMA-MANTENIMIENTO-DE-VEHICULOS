import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, RefreshControl, useWindowDimensions, Platform, TouchableOpacity, Image, Linking } from 'react-native';
import api from '../services/api';
import AppLayout from '../components/AppLayout';

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleDownloadReport = () => {
    const baseURL = api.defaults.baseURL;
    const reportURL = `${baseURL}/dashboard/report`;
    if (Platform.OS === 'web') {
      window.open(reportURL, '_blank');
    } else {
      Linking.openURL(reportURL);
    }
  };

  const fetchData = useCallback((isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(false);
    api.get('/dashboard')
      .then(response => { setData(response.data); setLoading(false); setRefreshing(false); })
      .catch(err => { console.error(err); setLoading(false); setRefreshing(false); setError(true); });
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener('focus', () => fetchData());
    return unsubscribe;
  }, [navigation, fetchData]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#e52320" /></View>;

  if (error || !data) return (
    <View style={styles.center}>
      <Text style={{ fontSize: 40, marginBottom: 16 }}>⚠️</Text>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 8 }}>Sin conexión al servidor</Text>
      <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginHorizontal: 40, marginBottom: 24 }}>
        No se pudo conectar con el servidor. Verifica que el backend esté encendido y que tu dispositivo esté en la misma red.
      </Text>
      <TouchableOpacity
        onPress={() => { setLoading(true); setError(false); api.get('/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => { setLoading(false); setError(true); }); }}
        style={{ backgroundColor: '#e52320', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 }}
        activeOpacity={0.8}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>🔄 Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <AppLayout activeTab="Dashboard" navigation={navigation} title="Control General" onTabRefresh={onRefresh}>
      <View style={styles.innerWrapper}>
        
        {/* TOPBAR BLANCA (Solo visible en Desktop/Web) */}
        {!isMobile && (
          <View style={styles.topHeader}>
            <Text style={styles.headerTitle}>Panel de Control Administrativo</Text>
            <View style={styles.headerRight}>
              <View style={styles.adminBadge}>
              </View>
            </View>
          </View>
        )}

        <ScrollView
          style={[styles.scrollBody, isMobile && styles.scrollBodyMobile]}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            Platform.OS !== 'web' ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#e52320']}
                tintColor="#e52320"
              />
            ) : undefined
          }
        >
          <View style={[styles.titleRow, isMobile && { flexDirection: 'column', alignItems: 'flex-start' }]}>
            <View style={{ flex: 1, marginRight: isMobile ? 0 : 10 }}>
              <Text style={[styles.mainTitle, isMobile && styles.mainTitleMobile]}>Dashboard de Inteligencia</Text>
              <Text style={styles.subTitle}>Análisis de la operación y desempeño vehicular</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: isMobile ? 12 : 0 }}>
              <TouchableOpacity style={styles.downloadReportBtn} onPress={handleDownloadReport} activeOpacity={0.8}>
                <Text style={styles.downloadReportBtnText}>Descargar Reporte (PDF)</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.metricsTitle}>Métricas Clave</Text>

          {data.alerts.expired > 0 && (
            <View style={[styles.actionRequiredBadge, { alignSelf: 'flex-start', marginTop: -5, marginBottom: 15 }]}>
              <Text style={styles.actionRequiredText}>Requiere acción</Text>
            </View>
          )}

          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, isMobile && styles.metricCardMobile, { width: isMobile ? '48%' : '23%', marginBottom: 15, backgroundColor: '#edf2f7', borderColor: '#cbd5e0' }]}>
              <Text style={styles.metricLabel}>FLOTA TOTAL</Text>
              <Text style={[styles.metricValue, isMobile && styles.metricValueMobile, { color: '#2b6cb0' }]}>{data.vehicles.total}</Text>
              <Text style={styles.metricSub}>{data.vehicles.active} Activos / {data.vehicles.workshop} Taller</Text>
            </View>

            <View style={[styles.metricCard, isMobile && styles.metricCardMobile, { width: isMobile ? '48%' : '23%', marginBottom: 15, backgroundColor: '#fff9e6', borderColor: '#ffcc00' }]}>
              <Text style={styles.metricLabel}>ALERTAS PRÓXIMAS</Text>
              <Text style={[styles.metricValue, isMobile && styles.metricValueMobile, { color: '#b88600' }]}>{data.alerts.upcoming}</Text>
              <Text style={styles.metricSub}>Mantenimientos cercanos</Text>
            </View>

            <View style={[styles.metricCard, isMobile && styles.metricCardMobile, { width: isMobile ? '48%' : '23%', marginBottom: 15, backgroundColor: '#f0fff4', borderColor: '#c6f6d5' }]}>
              <Text style={styles.metricLabel}>GASTOS DEL MES</Text>
              <Text style={[styles.metricValue, isMobile && styles.metricValueMobile, { color: '#38a169' }]}>${parseFloat(data.monthly_expenses).toFixed(2)}</Text>
              <Text style={styles.metricSub}>Inversión realizada</Text>
            </View>

            <View style={[styles.metricCard, isMobile && styles.metricCardMobile, { width: isMobile ? '48%' : '23%', marginBottom: 15, backgroundColor: '#fff5f5', borderColor: '#fed7d7' }]}>
              <Text style={styles.metricLabel}>CRÍTICOS VENCIDOS</Text>
              <Text style={[styles.metricValue, isMobile && styles.metricValueMobile, { color: '#e53e3e' }]}>{data.alerts.expired}</Text>
              <Text style={styles.metricSub}>🔴 Corrección urgente</Text>
            </View>
          </View>

          {/* SECCIÓN INTERACTIVA DE ALERTAS ACTIVAS */}
          <Text style={styles.alertsSectionTitle}>Vehículos que Requieren Atención</Text>
          
          {data.alerts?.list && data.alerts.list.length > 0 ? (
            <View style={styles.alertsListContainer}>
              {data.alerts.list.map((vehicle) => {
                const isExpired = vehicle.action_status === 'expired';
                return (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[
                      styles.vehicleAlertCard,
                      isExpired ? styles.vehicleAlertCardExpired : styles.vehicleAlertCardUpcoming
                    ]}
                    onPress={() => navigation.navigate('VehicleHistory', { vehicleId: vehicle.id })}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cardLeftSection}>
                      {vehicle.image_url ? (
                        <Image source={{ uri: vehicle.image_url }} style={styles.rowVehicleImage} resizeMode="cover" />
                      ) : (
                        <View style={styles.noImagePlaceholder}>
                          <Text style={{ fontSize: 22 }}>🚘</Text>
                        </View>
                      )}
                      <View style={styles.infoWrapper}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.plate}>{vehicle.plate}</Text>
                          <View style={[
                            styles.statusDot,
                            { backgroundColor: isExpired ? '#e52320' : '#ffcc00' }
                          ]} />
                        </View>
                        <Text style={styles.details}>{vehicle.brand} {vehicle.model} • Año {vehicle.year}</Text>
                      </View>
                    </View>
                    <View style={styles.mileageContainer}>
                      <Text style={styles.mileage}>{vehicle.current_mileage.toLocaleString()} km</Text>
                      <Text style={[styles.statusText, { color: isExpired ? '#e52320' : '#b88600' }]}>
                        {isExpired ? 'CRÍTICO' : 'PRÓXIMO'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.noAlertsCard}>
              <Text style={styles.noAlertsIcon}>✅</Text>
              <Text style={styles.noAlertsText}>Toda la flota al día. No hay alertas pendientes de atención.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </AppLayout>
  );
}

// Estilos globales compartidos
const styles = StyleSheet.create({
  innerWrapper: { flex: 1, flexDirection: 'column', overflow: 'hidden' },
  scrollBodyMobile: { padding: 16 },
  mainTitleMobile: { fontSize: 24 },
  metricCardMobile: { padding: 12 },
  metricValueMobile: { fontSize: 26 },
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
  topHeader: { height: 70, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#4a5568' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  adminBadge: { alignItems: 'flex-end', marginRight: 10 },
  adminBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#1a202c' },
  adminSync: { fontSize: 9, color: '#48bb78', fontWeight: '600' },
  scrollBody: { padding: 30, flex: 1 },
  scrollContent: { paddingBottom: 40 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, flexWrap: 'wrap' },
  mainTitle: { fontSize: 32, fontWeight: '800', color: '#0f172a' },
  subTitle: { color: '#64748b', fontSize: 14, marginTop: 4 },
  actionRequiredBadge: { backgroundColor: '#fff5f5', borderColor: '#fed7d7', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, marginTop: 10 },
  actionRequiredText: { color: '#e53e3e', fontWeight: 'bold', fontSize: 13 },
  metricsTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 15 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  metricCard: { padding: 20, borderRadius: 16, borderWidth: 1 },
  metricLabel: { fontSize: 11, fontWeight: '700', color: '#475569', letterSpacing: 0.5 },
  metricValue: { fontSize: 36, fontWeight: '800', marginVertical: 5 },
  metricSub: { fontSize: 11, color: '#64748b' },
  alertsSectionTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginTop: 15, marginBottom: 15 },
  alertsListContainer: { marginTop: 5, marginBottom: 30 },
  vehicleAlertCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#edf2f7', elevation: 1 },
  vehicleAlertCardExpired: { borderLeftWidth: 6, borderLeftColor: '#e52320' },
  vehicleAlertCardUpcoming: { borderLeftWidth: 6, borderLeftColor: '#ffcc00' },
  cardLeftSection: { flexDirection: 'row', alignItems: 'center' },
  rowVehicleImage: { width: 60, height: 60, borderRadius: 10, marginRight: 15 },
  noImagePlaceholder: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  infoWrapper: {},
  plate: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 },
  details: { fontSize: 13, color: '#64748b', marginTop: 2, fontWeight: '500' },
  mileageContainer: { alignItems: 'flex-end' },
  mileage: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  statusText: { fontSize: 11, fontWeight: '700', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  noAlertsCard: { backgroundColor: '#fff', padding: 25, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', marginTop: 5, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  noAlertsIcon: { fontSize: 32, marginBottom: 8 },
  noAlertsText: { color: '#475569', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  downloadReportBtn: { backgroundColor: '#e52320', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#e52320' },
  downloadReportBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 }
});