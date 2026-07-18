import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, useWindowDimensions, Image } from 'react-native';

let globalSidebarCollapsed = false;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AppLayout({ children, activeTab, navigation, title, hideTabBarOnMobile = false, onTabRefresh }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(globalSidebarCollapsed);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    globalSidebarCollapsed = newState;
  };

  if (isMobile) {
    return (
      <View style={[styles.mobileContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Top Header */}
        <View style={styles.mobileHeader}>
          <View style={styles.brandRow}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logoImageMobile} 
              resizeMode="contain" 
            />
          </View>
          {title && <Text style={styles.mobileHeaderTitle}>{title}</Text>}
        </View>

        {/* Content */}
        <View style={styles.mobileContent}>
          {children}
        </View>

        {/* Bottom Tab Bar (Only if not hidden on mobile) */}
        {!hideTabBarOnMobile && (
          <View style={styles.bottomTabBar}>
            <TouchableOpacity 
              style={styles.tabBtn} 
              onPress={() => {
                if (activeTab === 'Dashboard' && onTabRefresh) onTabRefresh();
                else navigation.navigate('Dashboard');
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={activeTab === 'Dashboard' ? 'stats-chart' : 'stats-chart-outline'} 
                size={22} 
                color={activeTab === 'Dashboard' ? '#e52320' : '#a0aec0'} 
              />
              <Text style={[styles.tabLabel, activeTab === 'Dashboard' && styles.tabLabelActive]}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.tabBtn} 
              onPress={() => {
                if (activeTab === 'VehicleList' && onTabRefresh) onTabRefresh();
                else navigation.navigate('VehicleList');
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={activeTab === 'VehicleList' ? 'car' : 'car-outline'} 
                size={24} 
                color={activeTab === 'VehicleList' ? '#e52320' : '#a0aec0'} 
              />
              <Text style={[styles.tabLabel, activeTab === 'VehicleList' && styles.tabLabelActive]}>Mi Flota</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.tabBtn} 
              onPress={() => {
                if (activeTab === 'AddVehicle' && onTabRefresh) onTabRefresh();
                else navigation.navigate('AddVehicle');
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={activeTab === 'AddVehicle' ? 'add-circle' : 'add-circle-outline'} 
                size={24} 
                color={activeTab === 'AddVehicle' ? '#e52320' : '#a0aec0'} 
              />
              <Text style={[styles.tabLabel, activeTab === 'AddVehicle' && styles.tabLabelActive]}>Agregar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Desktop / Web Layout
  return (
    <View style={styles.desktopContainer}>
      {/* Sidebar */}
      <View style={[styles.sidebar, sidebarCollapsed && styles.sidebarCollapsed]}>
        <View style={!sidebarCollapsed ? styles.brandContainer : styles.brandContainerCollapsed}>
          {!sidebarCollapsed ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              <TouchableOpacity onPress={toggleSidebar} style={[styles.collapseToggleBtn, { marginRight: 8 }]} activeOpacity={0.7}>
                <Ionicons name="menu" size={24} color="#0c1017" />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Image 
                  source={require('../../assets/logo.png')} 
                  style={styles.logoImage} 
                  resizeMode="contain" 
                />
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={toggleSidebar} style={styles.expandToggleBtn} activeOpacity={0.7}>
              <Ionicons name="menu" size={24} color="#a0aec0" />
            </TouchableOpacity>
          )}
        </View>

        {!sidebarCollapsed && <Text style={styles.sidebarSectionTitle}>NAVEGACIÓN</Text>}

        <View style={styles.navContainer}>
          <TouchableOpacity 
            style={[
              activeTab === 'Dashboard' ? styles.sidebarBtnActive : styles.sidebarBtn,
              sidebarCollapsed && styles.sidebarBtnCollapsed
            ]} 
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Ionicons 
              name={activeTab === 'Dashboard' ? 'stats-chart' : 'stats-chart-outline'} 
              size={20} 
              color={activeTab === 'Dashboard' ? '#fff' : '#a0aec0'} 
            />
            {!sidebarCollapsed && (
              <Text style={[
                activeTab === 'Dashboard' ? styles.sidebarBtnTextActive : styles.sidebarBtnText,
                { marginLeft: 10 }
              ]}>
                Dashboard
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              activeTab === 'VehicleList' ? styles.sidebarBtnActive : styles.sidebarBtn,
              sidebarCollapsed && styles.sidebarBtnCollapsed
            ]} 
            onPress={() => navigation.navigate('VehicleList')}
          >
            <Ionicons 
              name={activeTab === 'VehicleList' ? 'car' : 'car-outline'} 
              size={20} 
              color={activeTab === 'VehicleList' ? '#fff' : '#a0aec0'} 
            />
            {!sidebarCollapsed && (
              <Text style={[
                activeTab === 'VehicleList' ? styles.sidebarBtnTextActive : styles.sidebarBtnText,
                { marginLeft: 10 }
              ]}>
                Ver Mi Flota
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              activeTab === 'AddVehicle' ? styles.sidebarBtnActive : styles.sidebarBtn,
              sidebarCollapsed && styles.sidebarBtnCollapsed
            ]} 
            onPress={() => navigation.navigate('AddVehicle')}
          >
            <Ionicons 
              name={activeTab === 'AddVehicle' ? 'add-circle' : 'add-circle-outline'} 
              size={20} 
              color={activeTab === 'AddVehicle' ? '#fff' : '#a0aec0'} 
            />
            {!sidebarCollapsed && (
              <Text style={[
                activeTab === 'AddVehicle' ? styles.sidebarBtnTextActive : styles.sidebarBtnText,
                { marginLeft: 10 }
              ]}>
                Agregar Auto
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.desktopContent}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Mobile Styles
  mobileContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mobileHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#0c1017',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  mobileHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a0aec0',
  },
  brandNameMobile: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  mobileContent: {
    flex: 1,
  },
  bottomTabBar: {
    height: 62,
    flexDirection: 'row',
    backgroundColor: '#0c1017',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: '#a0aec0',
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#e52320',
    fontWeight: '700',
  },

  // Desktop Styles
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    height: Platform.OS === 'web' ? '100vh' : '100%',
    overflow: 'hidden',
  },
  sidebar: {
    width: 240,
    backgroundColor: '#0c1017',
    padding: 20,
  },
  sidebarCollapsed: {
    width: 70,
    padding: 10,
    alignItems: 'center',
  },
  brandContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  brandContainerCollapsed: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 10,
    width: '100%',
  },
  collapseToggleBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  expandToggleBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#141c26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#e52320',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  brandName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  brandSub: {
    color: '#718096',
    fontSize: 10,
    fontWeight: '600',
  },
  sidebarSectionTitle: {
    color: '#4a5568',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 15,
    letterSpacing: 1,
  },
  navContainer: {},
  sidebarBtn: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidebarBtnCollapsed: {
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  sidebarBtnText: {
    color: '#a0aec0',
    fontSize: 14,
    fontWeight: '500',
  },
  sidebarBtnActive: {
    backgroundColor: '#e52320',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidebarBtnTextActive: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  desktopContent: {
    flex: 1,
    height: Platform.OS === 'web' ? '100vh' : '100%',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: 70,
  },
  logoImageMobile: {
    width: 120,
    height: 36,
  },
});
