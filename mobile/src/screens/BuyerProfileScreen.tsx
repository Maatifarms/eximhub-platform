import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { Briefcase, MapPin, Target, Users, Unlock, ArrowLeft, CreditCard, ExternalLink, Mail, Phone, ShieldCheck } from 'lucide-react-native';
import { getBalance, revealContact } from '../api/client';

export default function BuyerProfileScreen({ route, navigation }: any) {
  const { contact: initialContact } = route.params;
  const [contact, setContact] = useState(initialContact);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    fetchBalance();
    if (contact.email && !contact.email.includes('•')) {
      setIsRevealed(true);
    }
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

  const handleReveal = async () => {
    if (!userData || (userData.points_balance || 0) < 1) {
        Alert.alert("Points Required", "You need at least 1 point to reveal procurement details.", [
            { text: "Buy Points", onPress: () => navigation.navigate('Buy Access') },
            { text: "Cancel" }
        ]);
        return;
    }

    setIsRevealing(true);
    try {
      const resp = await revealContact(contact.id);
      if (resp.data.success) {
        Alert.alert("Access Granted!", "1 Point deducted. Procurement details are now visible.");
        setIsRevealed(true);
        setContact({ ...contact, ...resp.data.data });
        fetchBalance(); 
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      Alert.alert("Error", msg || "Could not reveal contact.");
    } finally {
      setIsRevealing(false);
    }
  };

  const openLinkedin = () => {
    const url = contact.linkedin;
    if (url) {
      const fullUrl = url.startsWith('http') ? url : `https://www.linkedin.com/in/${url}`;
      Linking.openURL(fullUrl);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.creditsDisplay}>
            <CreditCard size={14} color="#3b82f6" />
            <Text style={styles.creditsCount}>{userData?.points_balance || 0} Points</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <Text style={styles.title}>{contact.title || 'Procurement Manager'}</Text>
          <Text style={styles.companyName}>{contact.company_name || 'Alaska Milk Corporation'}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
                <MapPin size={14} color="#94a3b8" />
                <Text style={styles.metaText}>{contact.country || 'Global Market'}</Text>
            </View>
            <View style={styles.metaBadge}>
                <Briefcase size={14} color="#94a3b8" />
                <Text style={styles.metaText}>{contact.industry || 'Multi-Trade'}</Text>
            </View>
          </View>
          
          <View style={styles.summaryBox}>
              <View style={styles.summaryHeader}>
                <ShieldCheck size={16} color="#10b981" />
                <Text style={styles.summaryTitle}>Verified Procurement Lead</Text>
              </View>
              <Text style={styles.summaryText}>This decision maker is responsible for sourcing and vendor selection. High intent buyer profile.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Procurement Access</Text>

        <View style={styles.contactCard}>
            <View style={styles.contactHeader}>
               <View>
                  <Text style={styles.contactName}>{isRevealed ? (contact.full_name || "Decision Maker") : "Locked Identity"}</Text>
                  <Text style={styles.contactRole}>{contact.title || 'Decision Maker'}</Text>
               </View>
               {isRevealed && (
                   <TouchableOpacity style={styles.linkedinIcon} onPress={openLinkedin}>
                       <ExternalLink size={18} color="#3b82f6" />
                   </TouchableOpacity>
               )}
            </View>
            
            <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                    <Mail size={16} color="#64748b" />
                    <Text style={styles.detailItem}>Email: <Text style={styles.detailValue}>{isRevealed ? (contact.email) : "••••••••@••••.com"}</Text></Text>
                </View>
                <View style={styles.detailRow}>
                    <Phone size={16} color="#64748b" />
                    <Text style={styles.detailItem}>Phone: <Text style={styles.detailValue}>{isRevealed ? (contact.phone) : "+•• ••••••••••"}</Text></Text>
                </View>
            </View>

            {!isRevealed ? (
              <TouchableOpacity 
                style={styles.revealBtn} 
                onPress={handleReveal}
                disabled={isRevealing}
              >
                {isRevealing ? <ActivityIndicator color="#fff" size="small" /> : <Unlock size={16} color="#fff" />}
                <Text style={styles.revealBtnText}>Reveal Full Access (1 Point)</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.unlockedBadge}>
                 <Text style={styles.unlockedText}>✓ ACCESS GRANTED</Text>
              </View>
            )}
        </View>

        <View style={styles.infoNote}>
            <Text style={styles.noteText}>Points are only deducted for the first reveal. Subsequent views are free.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  creditsDisplay: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#3b82f6' },
  creditsCount: { color: '#3b82f6', fontSize: 13, fontWeight: '800' },
  scrollContent: { padding: 20 },
  heroCard: { marginBottom: 32 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  companyName: { fontSize: 18, color: '#3b82f6', fontWeight: '700', marginBottom: 16 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  metaText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  summaryBox: { backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.1)' },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  summaryTitle: { color: '#10b981', fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  summaryText: { color: '#94a3b8', fontSize: 15, lineHeight: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 16 },
  contactCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  contactHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  contactName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  contactRole: { fontSize: 14, color: '#64748b', marginTop: 2 },
  linkedinIcon: { backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 10, borderRadius: 10 },
  detailsList: { marginBottom: 24, gap: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailItem: { color: '#64748b', fontSize: 14, flex: 1 },
  detailValue: { color: '#fff', fontWeight: 'bold', fontFamily: 'monospace' },
  revealBtn: { backgroundColor: '#3b82f6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 14 },
  revealBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  unlockedBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#10b981' },
  unlockedText: { color: '#10b981', fontWeight: '800', fontSize: 15 },
  infoNote: { alignItems: 'center', marginTop: 12 },
  noteText: { color: '#475569', fontSize: 12, textAlign: 'center' }
});
