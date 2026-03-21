import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDrawerNavigator } from '@react-navigation/drawer';
/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-ignore
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Globe, Briefcase, Upload, Library, BookOpen, MessageSquare, UserCircle, LineChart, CreditCard, ShoppingCart, LogOut } from 'lucide-react-native';
import { setTier } from '../api/client';

import DiscoveryScreen from '../screens/DiscoveryScreen';
import CrmScreen from '../screens/CrmScreen';
import UploadScreen from '../screens/UploadScreen';
import TradeLibraryScreen from '../screens/TradeLibraryScreen';
import DatasetPreviewScreen from '../screens/DatasetPreviewScreen';
import InquiriesScreen from '../screens/InquiriesScreen';
import LearningHubScreen from '../screens/LearningHubScreen';
import IntelligenceScreen from '../screens/IntelligenceScreen';
import BuyerProfileScreen from '../screens/BuyerProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import PricingScreen from '../screens/PricingScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function LibraryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="LibraryHome" component={TradeLibraryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DatasetPreview" component={DatasetPreviewScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function DiscoveryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DiscoveryHome" component={DiscoveryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BuyerProfile" component={BuyerProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function CustomDrawerContent(props: any) {
  const { userData, onLogout } = props;
  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={styles.profileSection}>
        <UserCircle size={60} color="#3b82f6" />
        <Text style={styles.profileName}>{userData?.name || 'Globetrotter'}</Text>
        <Text style={styles.profileEmail}>{userData?.email || 'info@eximhub.pro'}</Text>
        
        <View style={styles.creditsBadge}>
            <Text style={styles.creditsLabel}>Master Points</Text>
            <Text style={styles.creditsValue}>{userData?.points_balance || 0} Points</Text>
        </View>
      </View>

      <View style={{ marginTop: 10, flex: 1 }}>
        {props.state.routes.map((route: any, index: number) => {
          const focused = index === props.state.index;
          const { options } = props.descriptors[route.key];
          const label = options.title !== undefined ? options.title : options.drawerLabel !== undefined ? options.drawerLabel : route.name;

          return (
            <TouchableOpacity 
              key={route.key} 
              style={[styles.drawerItem, focused && styles.drawerItemActive]} 
              onPress={() => props.navigation.navigate(route.name)}
            >
              <View style={styles.drawerItemHeader}>
                {options.drawerIcon && options.drawerIcon({ color: focused ? '#3b82f6' : '#94a3b8', size: 22 })}
                <Text style={[styles.drawerLabel, focused && styles.drawerLabelActive]}>{label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AppNavigator() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('exim_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserData(parsed);
        setTier(parsed.subscription_tier);
      } else {
        setUserData(null);
        setTier('Free');
      }
    } catch (error) {
      console.error('MOBILE_SESSION_LOAD_ERROR:', error);
      setUserData(null);
      setTier('Free');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['exim_token', 'exim_user']);
    setUserData(null);
    setTier('Free');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#fff', marginTop: 12 }}>Initializing EximHub...</Text>
      </View>
    );
  }

  if (!userData) {
    return <LoginScreen onAuthSuccess={loadSession} />;
  }

  return (
    <NavigationContainer>
      <Drawer.Navigator 
        drawerContent={(props) => <CustomDrawerContent {...props} userData={userData} onLogout={handleLogout} />}
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          drawerStyle: { width: 300 },
        }}
      >
        <Drawer.Screen name="Discovery" component={DiscoveryStack} options={{ drawerIcon: ({color, size}) => <Globe color={color} size={size} />, title: 'Buyer Discovery' }} />
        <Drawer.Screen name="Intelligence" component={IntelligenceScreen} options={{ drawerIcon: ({color, size}) => <LineChart color={color} size={size} />, title: 'Market Intelligence' }} />
        <Drawer.Screen name="Trade Library" component={LibraryStack} options={{ drawerIcon: ({color, size}) => <Library color={color} size={size} /> }} />
        <Drawer.Screen name="Learning Hub" component={LearningHubScreen} options={{ drawerIcon: ({color, size}) => <BookOpen color={color} size={size} /> }} />
        
        {/* Placeholder screens for Store & Pricing */}
        <Drawer.Screen name="Digital Store" component={TradeLibraryScreen} options={{ drawerIcon: ({color, size}) => <ShoppingCart color={color} size={size} /> }} />
        <Drawer.Screen name="Buy Access" component={PricingScreen} options={{ drawerIcon: ({color, size}) => <CreditCard color={color} size={size} /> }} />
        
        <Drawer.Screen name="CRM" component={CrmScreen} options={{ drawerIcon: ({color, size}) => <Briefcase color={color} size={size} />, title: 'CRM Pipeline' }} />
        <Drawer.Screen name="Inquiries" component={InquiriesScreen} options={{ drawerIcon: ({color, size}) => <MessageSquare color={color} size={size} />, title: 'Sample Inquiries' }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  profileSection: { padding: 24, alignItems: 'center', borderBottomWidth: 1, borderColor: '#1e293b', marginBottom: 8 },
  profileName: { fontSize: 20, fontWeight: '800', marginTop: 12, color: '#fff' },
  profileEmail: { fontSize: 13, color: '#64748b', marginTop: 2 },
  creditsBadge: { marginTop: 20, backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#3b82f6', alignItems: 'center', width: '100%' },
  creditsLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  creditsValue: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  drawerItem: { paddingVertical: 12, paddingHorizontal: 16, marginHorizontal: 8, marginVertical: 2, borderRadius: 8 },
  drawerItemActive: { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  drawerItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  drawerLabel: { fontSize: 15, color: '#94a3b8', fontWeight: '500' },
  drawerLabelActive: { color: '#3b82f6', fontWeight: '700' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, borderTopWidth: 1, borderColor: '#1e293b' },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 }
});
