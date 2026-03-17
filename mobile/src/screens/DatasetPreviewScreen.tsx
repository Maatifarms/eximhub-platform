import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { getDatasetPreview } from '../api/client';
import { Lock, Download, ChevronLeft } from 'lucide-react-native';

export default function DatasetPreviewScreen({ route, navigation }: any) {
  const { datasetId } = route.params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreview();
  }, [datasetId]);

  const fetchPreview = async () => {
    try {
      const resp = await getDatasetPreview(datasetId);
      setData(resp.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <Text style={styles.loading}>Loading Preview...</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{data.dataset.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>{data.dataset.description || 'No description provided.'}</Text>
        
        {data.upgrade_required && (
          <View style={styles.paywallBanner}>
            <Lock size={20} color="#b45309" />
            <Text style={styles.paywallText}>
              Emails and Phone Numbers are hidden for Free users. 
              Showing only 10 sample records.
            </Text>
            <TouchableOpacity style={styles.upgradeBtn} onPress={() => Alert.alert("Upgrade", "Redirecting to Upgrade Page...")}>
              <Text style={styles.upgradeBtnText}>Upgrade Plan</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Preview Data ({data.preview_data.length} records)</Text>
        
        {data.preview_data.map((comp: any) => (
          <View key={comp.id} style={styles.rowCard}>
            <Text style={styles.compName}>{comp.name}</Text>
            <Text style={styles.compDetail}>{comp.country} • {comp.industry}</Text>
            <Text style={styles.compDetail}>Web: {comp.website}</Text>
            
            {comp.contacts.map((contact: any, idx: number) => (
              <View key={idx} style={styles.contactRow}>
                <Text style={styles.contactRef}>{contact.name} ({contact.role})</Text>
                <Text style={[styles.redacted, data.upgrade_required && styles.redactedBlur]}>
                  {contact.email}
                </Text>
                <Text style={[styles.redacted, data.upgrade_required && styles.redactedBlur]}>
                  {contact.phone}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      
      {!data.upgrade_required && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.downloadBtn} onPress={() => Alert.alert("Download", "Downloading Full CSV...")}>
            <Download size={20} color="#fff" />
            <Text style={styles.downloadBtnText}> Download Full Dataset</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 18, fontWeight: 'bold', marginLeft: 16, color: '#0f172a', flex: 1 },
  loading: { padding: 40, textAlign: 'center', color: '#64748b' },
  content: { padding: 16 },
  description: { fontSize: 16, color: '#475569', marginBottom: 24, lineHeight: 24 },
  paywallBanner: { backgroundColor: '#fef3c7', padding: 16, borderRadius: 12, marginBottom: 24, borderLeftWidth: 4, borderColor: '#f59e0b' },
  paywallText: { color: '#92400e', marginTop: 8, marginBottom: 12, lineHeight: 20 },
  upgradeBtn: { backgroundColor: '#d97706', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  upgradeBtnText: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  rowCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  compName: { fontWeight: 'bold', fontSize: 16, color: '#0f172a' },
  compDetail: { color: '#64748b', marginTop: 4 },
  contactRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#f1f5f9' },
  contactRef: { fontWeight: '600', color: '#334155' },
  redacted: { color: '#64748b', marginTop: 4, fontFamily: 'monospace' },
  redactedBlur: { color: '#ef4444' }, // Just hardcode visual distinction for redaction
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e2e8f0' },
  downloadBtn: { flexDirection: 'row', backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  downloadBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
