import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Search, MapPin, Briefcase, Download, Filter, ChevronDown, ChevronUp, CreditCard, Globe, ShieldCheck } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchGlobal, getBalance } from '../api/client';

export default function DiscoveryScreen({ navigation }: any) {
  const [userData, setUserData] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [country, setCountry] = useState('Philippines');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchBalance();
    handleSearch();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await getBalance();
      if (res.data.success) {
        setUserData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
        const res = await searchGlobal('', country, keyword, '', 20);
      if (res.data.success) {
        setContacts(res.data.data);
      }
    } catch (e) {
      Alert.alert("Search Error", "Could not fetch procurement pipeline.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('BuyerProfile', { contact: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerInfo}>
            <Text style={styles.title}>{item.title || 'Procurement Manager'}</Text>
            <Text style={styles.companyTeaser}>{item.company_name || 'EximHub Partner'}</Text>
        </View>
        <ShieldCheck size={20} color="#10b981" />
      </View>
      
      <View style={styles.detailRow}>
        <MapPin size={14} color="#64748b" />
        <Text style={styles.detailText}>{item.country || 'Global Market'}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Briefcase size={14} color="#64748b" />
        <Text style={styles.detailText}>{item.industry || 'Multi-Trade'}</Text>
      </View>

      <View style={styles.cardFooter}>
         <View style={styles.tag}>
             <Text style={styles.tagText}>Verified Procurement</Text>
         </View>
         <Text style={styles.revealCTA}>Reveal Details (1 Point) →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
          <View style={styles.creditsDisplay}>
              <CreditCard size={14} color="#3b82f6" />
              <Text style={styles.creditsCount}>{userData?.points_balance || 0} Points</Text>
          </View>
          <TouchableOpacity style={styles.buyBtn} onPress={() => navigation.navigate('Buy Access')}>
              <Text style={styles.buyText}>Refill</Text>
          </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
          <Text style={styles.screenTitle}>Discovery Engine</Text>
          <View style={styles.searchBar}>
            <Search color="#94a3b8" size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products (e.g. Cotton, Milk)..."
              placeholderTextColor="#64748b"
              value={keyword}
              onChangeText={setKeyword}
              onSubmitEditing={handleSearch}
            />
          </View>
          
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(!showFilters)}>
            <Filter size={16} color="#3b82f6" />
            <Text style={styles.filterBtnText}>Filters ({country || 'All Regions'})</Text>
            {showFilters ? <ChevronUp size={16} color="#3b82f6" /> : <ChevronDown size={16} color="#3b82f6" />}
          </TouchableOpacity>
          
          {showFilters && (
            <View style={styles.filterPanel}>
              <View style={styles.filterRow}>
                  <TextInput style={styles.filterInput} placeholder="Target Country" placeholderTextColor="#475569" value={country} onChangeText={setCountry} />
                  <TouchableOpacity style={styles.applyBtn} onPress={handleSearch}>
                      <Text style={styles.applyText}>Apply</Text>
                  </TouchableOpacity>
              </View>
            </View>
          )}
      </View>

      {loading ? (
          <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
          </View>
      ) : (
          <FlatList
            data={contacts}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
                <View style={styles.centerContainer}>
                    <Globe size={48} color="#1e293b" />
                    <Text style={styles.emptyText}>No procurement leads found.</Text>
                </View>
            }
          />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  creditsDisplay: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  creditsCount: { color: '#3b82f6', fontSize: 12, fontWeight: '700' },
  buyBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  buyText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  searchContainer: { padding: 20 },
  screenTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#334155' },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#fff' },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, alignSelf: 'flex-start' },
  filterBtnText: { color: '#3b82f6', fontSize: 14, fontWeight: '600' },
  filterPanel: { backgroundColor: '#1e293b', padding: 12, borderRadius: 12, marginTop: 12, gap: 8 },
  filterRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  filterInput: { flex: 1, backgroundColor: '#0f172a', padding: 10, borderRadius: 8, color: '#fff', fontSize: 13, borderWidth: 1, borderColor: '#334155' },
  applyBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  applyText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  list: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  headerInfo: { flex: 1 },
  title: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 2 },
  companyTeaser: { fontSize: 13, color: '#3b82f6', fontWeight: '600' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  detailText: { color: '#94a3b8', fontSize: 13 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#334155' },
  tag: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { color: '#10b981', fontSize: 11, fontWeight: '700' },
  revealCTA: { color: '#3b82f6', fontSize: 12, fontWeight: 'bold' },
  centerContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#64748b', fontSize: 15, marginTop: 16 },
});
