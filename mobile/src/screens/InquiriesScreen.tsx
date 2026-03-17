import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { getSampleInquiries, currentUserTier } from '../api/client';
import { MessageSquare, Lock, Crown } from 'lucide-react-native';

export default function InquiriesScreen() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, [currentUserTier]); // Re-fetch if tier changes

  const fetchInquiries = async () => {
    try {
      const resp = await getSampleInquiries();
      setInquiries(resp.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.product}>{item.product}</Text>
        <Text style={styles.date}>{new Date(item.inquiry_date).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.detail}>Quantity: {item.quantity}</Text>
      <Text style={styles.detail}>Destination: {item.destination_country}</Text>
      <Text style={styles.detail}>Type: {item.buyer_type}</Text>
      
      <TouchableOpacity 
        style={[styles.btn, currentUserTier === 'Free' ? styles.btnLocked : styles.btnOpen]}
        onPress={() => {
          if (currentUserTier === 'Free') {
            Alert.alert("Upgrade Required", "Sign up for a Paid plan to view full contact details.");
          } else {
            Alert.alert("Contact Info", "Buyer Email: buyer@example.com\nPhone: +1 234 567 890");
          }
        }}
      >
        {currentUserTier === 'Free' ? <Lock size={16} color="#d97706" /> : <MessageSquare size={16} color="#4f46e5" />}
        <Text style={[styles.btnText, { color: currentUserTier === 'Free' ? '#d97706' : '#4f46e5' }]}>
          {currentUserTier === 'Free' ? ' Unlock Buyer Contact' : ' View Contact Request'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {currentUserTier === 'Free' && (
        <View style={styles.upsell}>
          <Crown color="#eab308" size={24} />
          <Text style={styles.upsellText}>Free users can only see {inquiries.length} sample records. Upgrade to see thousands of active buyer inquiries.</Text>
        </View>
      )}
      <FlatList 
        data={inquiries}
        keyExtractor={i => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  upsell: { flexDirection: 'row', backgroundColor: '#fef9c3', padding: 16, borderBottomWidth: 1, borderColor: '#fde047', alignItems: 'center' },
  upsellText: { flex: 1, marginLeft: 12, color: '#854d0e', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1, borderWidth: 1, borderColor: '#e2e8f0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  product: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  date: { color: '#94a3b8', fontSize: 12 },
  detail: { color: '#475569', marginBottom: 4 },
  btn: { flexDirection: 'row', marginTop: 12, paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  btnLocked: { backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fcd34d' },
  btnOpen: { backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#c7d2fe' },
  btnText: { fontWeight: 'bold', marginLeft: 6 }
});
