import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getLeads } from '../api/client';
import { BriefcaseBusiness, Mail } from 'lucide-react-native';

export default function CrmScreen() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await getLeads();
      setLeads(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.companyName}>Company ID: {item.company_id}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.stage}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Mail size={16} color="#4f46e5" />
          <Text style={styles.actionText}>Generate Outreach</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pipeline</Text>
      <FlatList
        data={leads}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  title: { fontSize: 24, fontWeight: 'bold', margin: 16, color: '#1a1a1a' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  companyName: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  badge: { backgroundColor: '#fef08a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#854d0e', fontSize: 12, fontWeight: 'bold' },
  actions: { flexDirection: 'row', marginTop: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef2ff', padding: 8, borderRadius: 8 },
  actionText: { color: '#4f46e5', marginLeft: 6, fontWeight: '600' }
});
