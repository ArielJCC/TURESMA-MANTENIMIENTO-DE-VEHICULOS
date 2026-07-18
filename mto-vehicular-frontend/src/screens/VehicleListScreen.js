import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Image, Platform, useWindowDimensions, RefreshControl } from 'react-native';
import api from '../services/api';
import AppLayout from '../components/AppLayout';

export default function VehicleListScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const loadVehicles = (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    api.get('/vehicles')
      .then(res => { setVehicles(res.data); setLoading(false); setRefreshing(false); })
      .catch(err => { console.error(err); setLoading(false); setRefreshing(false); });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVehicles(true);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadVehicles);
    return unsubscribe;
  }, [navigation]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#e52320" /></View>;

  return (
    <AppLayout activeTab="VehicleList" navigation={navigation} title="Mis Vehículos" onTabRefresh={onRefresh}>
      <View style={styles.innerWrapper}>
        <View style={[styles.scrollBody, isMobile && styles.scrollBodyMobile]}>
          <Text style={[styles.mainTitle, isMobile && styles.mainTitleMobile]}>Flota Registrada</Text>
          <Text style={styles.subTitle}>Listado completo de unidades activas bajo seguimiento mecánico.</Text>

          <FlatList
            data={vehicles}
            style={{ marginTop: 25 }}
            keyExtractor={(item) => item.id.toString()}
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
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🚗</Text>
                <Text style={styles.emptyTitle}>Sin vehículos registrados</Text>
                <Text style={styles.emptySubtitle}>Agrega tu primer vehículo para comenzar el seguimiento.</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('AddVehicle')}>
                  <Text style={styles.emptyBtnText}>+ Agregar Vehículo</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.listCard, isMobile && styles.listCardMobile]}
                onPress={() => navigation.navigate('VehicleHistory', { vehicleId: item.id })}
                activeOpacity={0.8}
              >
                <View style={styles.cardLeftSection}>
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={[styles.rowVehicleImage, isMobile && styles.rowVehicleImageMobile]} resizeMode="cover" />
                  ) : (
                    <View style={[styles.noImagePlaceholder, isMobile && styles.noImagePlaceholderMobile]}>
                      <Text style={{ fontSize: isMobile ? 18 : 22 }}>🚘</Text>
                    </View>
                  )}
                  <View style={styles.infoWrapper}>
                    <Text style={[styles.plate, isMobile && styles.plateMobile]}>{item.plate}</Text>
                    <Text style={[styles.details, isMobile && styles.detailsMobile]}>{item.brand} {item.model} • Año {item.year}</Text>
                  </View>
                </View>
                <View style={styles.mileageContainer}>
                  <Text style={styles.mileage}>{item.current_mileage.toLocaleString()} km</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  innerWrapper: { flex: 1, flexDirection: 'column', overflow: 'hidden' },
  scrollBodyMobile: { padding: 16 },
  mainTitleMobile: { fontSize: 24 },
  listCardMobile: { padding: 12 },
  plateMobile: { fontSize: 16 },
  detailsMobile: { fontSize: 11 },
  rowVehicleImageMobile: { width: 50, height: 50, marginRight: 10 },
  noImagePlaceholderMobile: { width: 50, height: 50, marginRight: 10 },
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
  scrollBody: { padding: 30, flex: 1 },
  scrollContent: { paddingBottom: 40 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subTitle: { color: '#64748b', fontSize: 14, marginTop: 4 },

  // Tarjeta simple y clickeable entera
  listCard: { backgroundColor: '#fff', padding: 15, borderRadius: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#edf2f7', elevation: 1 },
  cardLeftSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowVehicleImage: { width: 65, height: 65, borderRadius: 10, marginRight: 15 },
  noImagePlaceholder: { width: 65, height: 65, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  infoWrapper: { flex: 1, justifyContent: 'center' },
  plate: { fontSize: 18, fontWeight: '800', color: '#1e293b', letterSpacing: 0.5 },
  details: { fontSize: 13, color: '#64748b', marginTop: 3, fontWeight: '500' },
  mileageContainer: { backgroundColor: '#edf2f7', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginLeft: 10 },
  mileage: { fontSize: 13, fontWeight: '700', color: '#4a5568' },

  // Estado vacío
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  emptyBtn: { backgroundColor: '#e52320', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 },
  emptyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
