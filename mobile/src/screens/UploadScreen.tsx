import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../api/firebase';
import { UploadCloud, FileSpreadsheet } from 'lucide-react-native';

export default function UploadScreen() {
  const [status, setStatus] = useState<string>('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Buyers');
  const [access, setAccess] = useState('Free');

  const pickAndUpload = async () => {
    if (!title) {
        Alert.alert("Error", "Please provide a dataset title first.");
        return;
    }
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv'],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setStatus('Uploading and parsing...');
        
        // Emulate file fetch for Expo
        const resp = await fetch(file.uri);
        const blob = await resp.blob();

        const storageRef = ref(storage, `datasets/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on('state_changed', 
          (snapshot) => {
            const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setStatus(`Uploading: ${Math.round(p)}%`);
          }, 
          (error) => {
            console.error(error);
            setStatus('Failed to upload file.');
          },
          () => {
            setStatus('Upload successful! Background ingestion triggered automatically.');
          }
        );
      }
    } catch (err) {
      console.error(err);
      setStatus('Failed to upload file.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={styles.card}>
        <UploadCloud size={64} color="#3b82f6" style={{ alignSelf: 'center' }} />
        <Text style={styles.title}>Admin Data Upload</Text>
        <Text style={styles.subtitle}>Upload CSV files to create a new Trade Dataset.</Text>
        
        <View style={styles.formGroup}>
            <Text style={styles.label}>Dataset Title</Text>
            <TextInput style={styles.input} placeholder="e.g. European Ceramic Importers" value={title} onChangeText={setTitle} />
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Data Category</Text>
            <View style={styles.row}>
                <TouchableOpacity style={[styles.pill, category==='Buyers' && styles.pillActive]} onPress={()=>setCategory('Buyers')}><Text style={category==='Buyers'?styles.pillTextActive:styles.pillText}>Buyers</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.pill, category==='Suppliers' && styles.pillActive]} onPress={()=>setCategory('Suppliers')}><Text style={category==='Suppliers'?styles.pillTextActive:styles.pillText}>Suppliers</Text></TouchableOpacity>
            </View>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Access Level</Text>
            <View style={styles.row}>
                <TouchableOpacity style={[styles.pill, access==='Free' && styles.pillActive]} onPress={()=>setAccess('Free')}><Text style={access==='Free'?styles.pillTextActive:styles.pillText}>Free Preview</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.pill, access==='Paid' && styles.pillActive]} onPress={()=>setAccess('Paid')}><Text style={access==='Paid'?styles.pillTextActive:styles.pillText}>Paid Only</Text></TouchableOpacity>
            </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={pickAndUpload}>
          <FileSpreadsheet size={20} color="#fff" style={{marginRight: 8}} />
          <Text style={styles.buttonText}>Select CSV File</Text>
        </TouchableOpacity>
        
        {status ? <Text style={styles.status}>{status}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 32, elevation: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 8 },
  input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, fontSize: 16 },
  row: { flexDirection: 'row', gap: 12 },
  pill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#f1f5f9' },
  pillActive: { backgroundColor: '#2563eb' },
  pillText: { color: '#64748b', fontWeight: 'bold' },
  pillTextActive: { color: '#fff', fontWeight: 'bold' },
  button: { flexDirection: 'row', backgroundColor: '#3b82f6', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  status: { marginTop: 24, color: '#10b981', fontWeight: 'bold', textAlign: 'center' }
});
