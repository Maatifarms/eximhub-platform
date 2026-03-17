import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { CheckCircle, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react-native';
import { db, auth, functions } from '../api/firebase';
import { httpsCallable } from 'firebase/functions';

export default function PricingScreen({ navigation }: any) {
  const handleUpgrade = async (planId: string, planName: string) => {
    Alert.alert(
      "Upgrade Program",
      `Would you like to upgrade to ${planName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: async () => {
             try {
                const buySub = httpsCallable(functions, 'buySubscription');
                const result: any = await buySub({ planId });
                if (result.data.success) {
                    Alert.alert("Success", `You are now on ${planName}!`);
                    navigation.navigate('Discovery');
                }
             } catch (e: any) {
                Alert.alert("Error", e.message);
             }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Trade Expansion Programs</Text>
        <Text style={styles.subtitle}>Investment for high-growth exporters.</Text>
      </View>

      <PricingCard 
        title="Program 1" 
        price="₹25,000" 
        features={["500 Procurement Points", "Market Intelligence Access", "Standard Support"]} 
        onPress={() => handleUpgrade('program_1', 'Program 1')}
      />

      <PricingCard 
        title="Program 2" 
        price="₹45,000" 
        highlight={true}
        features={["1,200 Procurement Points", "Priority AI Discovery", "Global Sales Partner Status"]} 
        onPress={() => handleUpgrade('program_2', 'Program 2')}
      />

      <PricingCard 
        title="Enterprise" 
        price="Custom" 
        features={["Unlimited Points", "Bespoke Sourcing Strategy", "Dedicated Trade Consultant"]} 
        onPress={() => Alert.alert("Contact Sales", "Please email sales@eximhub.pro for custom quotes.")}
      />

      <View style={styles.footer}>
        <ShieldCheck size={20} color="#10b981" />
        <Text style={styles.footerText}>Secure payments via Razorpay (Coming Soon)</Text>
      </View>
    </ScrollView>
  );
}

function PricingCard({ title, price, features, highlight, onPress }: any) {
  return (
    <View style={[styles.card, highlight && styles.highlightCard]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardPrice}>{price}</Text>
      <View style={styles.featureList}>
        {features.map((f: string, i: number) => (
          <View key={i} style={styles.featureItem}>
            <CheckCircle size={16} color="#3b82f6" />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={[styles.btn, highlight ? styles.btnPrimary : styles.btnOutline]} onPress={onPress}>
        <Text style={[styles.btnText, !highlight && styles.btnTextOutline]}>Select Program</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { marginBottom: 32, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 8, textAlign: 'center' },
  card: { backgroundColor: '#1e293b', borderRadius: 20, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  highlightCard: { borderColor: '#3b82f6', borderWidth: 2, transform: [{ scale: 1.02 }] },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#3b82f6', marginBottom: 8 },
  cardPrice: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 20 },
  featureList: { marginBottom: 24 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  featureText: { color: '#cbd5e1', fontSize: 14 },
  btn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#3b82f6' },
  btnOutline: { borderWidth: 1, borderColor: '#3b82f6' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnTextOutline: { color: '#3b82f6' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, opacity: 0.6 },
  footerText: { color: '#94a3b8', fontSize: 12 }
});
