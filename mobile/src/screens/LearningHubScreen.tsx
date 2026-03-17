import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { BookOpen, Target, Globe, Bot } from 'lucide-react-native';

export default function LearningHubScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <BookOpen size={32} color="#2563eb" />
        <Text style={styles.title}>Export Success Hub</Text>
        <Text style={styles.subtitle}>Master international trade and find global buyers automatically using EximHub's AI.</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.iconBox}><Target color="#fff" size={24} /></View>
        <Text style={styles.secTitle}>How Export Lead Generation Works</Text>
        <Text style={styles.secText}>
          Successful exporters don't just wait for buyers on B2B portals. They actively mine global customs data, exhibitor lists, and shipping manifests. EximHub takes complex Excel manifests and turns them into a structured CRM pipeline within seconds.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={[styles.iconBox, {backgroundColor: '#10b981'}]}><Globe color="#fff" size={24} /></View>
        <Text style={styles.secTitle}>Finding International Buyers</Text>
        <Text style={styles.secText}>
          Use our "Trade Data Library" to browse curated lists of vetted importers worldwide. As a free user, you can sample 10-20 records. Upgrading unlocks the full database and direct contact information.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={[styles.iconBox, {backgroundColor: '#8b5cf6'}]}><Bot color="#fff" size={24} /></View>
        <Text style={styles.secTitle}>Automating Outreach with AI</Text>
        <Text style={styles.secText}>
          Once you add a lead to your CRM Pipeline, click "Generate Outreach". Our AI analyzes the buyer's industry and generates a highly personalized, ready-to-send email or WhatsApp message designed to convert.
        </Text>
      </View>

      <TouchableOpacity style={styles.upgradeBtn} onPress={() => Alert.alert("Upgrade", "Redirecting to subscription page.")}>
        <Text style={styles.upgradeText}>Ready to Export? Upgrade to Paid</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginTop: 12 },
  subtitle: { textAlign: 'center', color: '#64748b', marginTop: 8, marginHorizontal: 16, lineHeight: 22 },
  section: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 16, elevation: 1 },
  iconBox: { backgroundColor: '#3b82f6', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  secTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  secText: { color: '#475569', lineHeight: 24 },
  upgradeBtn: { backgroundColor: '#0f172a', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 32 },
  upgradeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
