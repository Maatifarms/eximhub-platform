import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { db, auth } from '../api/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Search, TrendingUp, Target, Globe, AlertTriangle, Cpu, CreditCard } from 'lucide-react-native';

export default function IntelligenceScreen({ navigation }: any) {
    const [userData, setUserData] = useState<any>(null);
    const [query, setQuery] = useState('Ceramic Tiles');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (auth.currentUser) {
            const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
                setUserData(doc.data());
            });
            return unsub;
        }
    }, []);

    const fetchData = async () => {
        if (!userData || (userData.points_balance || 0) <= 0) {
            Alert.alert("Points Required", "You need at least 1 point to perform deep market analysis.", [
                { text: "Buy Points", onPress: () => navigation.navigate('Buy Access') },
                { text: "Cancel" }
            ]);
            return;
        }

        setLoading(true);
        try {
            // Mocking the AI intelligence response for the platform build
            setTimeout(() => {
                setData({
                    product: query,
                    platform_stats: { total_importers_tracked: 45290, companies_ai_enriched: 12840 },
                    opportunities: [
                        { country: 'Germany', opportunity_score: 94, growth_trend: '+12% YoY', explanation: 'High demand for sustainable building materials and ceramic alternatives.' },
                        { country: 'UAE', opportunity_score: 88, growth_trend: '+8% YoY', explanation: 'Booming construction sector in Dubai and Abu Dhabi.' }
                    ],
                    recently_discovered_leads: [
                        { id: 1, name: 'EuroBuild GmbH', country: 'Germany', industry: 'Construction' },
                        { id: 2, name: 'Gulf Trade Link', country: 'UAE', industry: 'Logistics' }
                    ]
                });
                setLoading(false);
            }, 1500);
        } catch (e) {
            setLoading(false);
            Alert.alert("Error", "Failed to fetch AI insights.");
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
            <View style={styles.headerIndicator}>
                <View style={styles.creditsBox}>
                    <CreditCard size={14} color="#3b82f6" />
                    <Text style={styles.creditsText}>{userData?.points_balance || 0} Points Available</Text>
                </View>
                {(userData?.points_balance || 0) <= 0 && (
                    <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Buy Access')}>
                        <Text style={styles.upgradeText}>Upgrade Now</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.heroSection}>
                <Cpu size={40} color="#3b82f6" />
                <Text style={styles.heroTitle}>AI Market Whisperer</Text>
                <Text style={styles.heroSub}>Discover untapped global markets for your products.</Text>
            </View>

            <View style={styles.searchBox}>
                <TextInput 
                    style={styles.input} 
                    value={query} 
                    onChangeText={setQuery} 
                    placeholder="Enter product (e.g. Cotton Yarn)" 
                    placeholderTextColor="#64748b"
                />
                <TouchableOpacity style={styles.searchBtn} onPress={fetchData}>
                    <Search color="#fff" size={20} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loaderText}>Analyzing global trade flows...</Text>
                </View>
            ) : data ? (
                <View>
                    <Text style={styles.sectionTitle}>Global Opportunities</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{data.platform_stats.total_importers_tracked.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Global Buyers</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{data.platform_stats.companies_ai_enriched.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>AI Enriched</Text>
                        </View>
                    </View>

                    {data.opportunities.map((opp: any, idx: number) => (
                        <View key={idx} style={styles.oppCard}>
                            <View style={styles.oppHeader}>
                                <Globe color="#3b82f6" size={20} />
                                <Text style={styles.oppCountry}>{opp.country}</Text>
                                <View style={styles.scoreBadge}>
                                    <Text style={styles.scoreText}>{opp.opportunity_score}/100</Text>
                                </View>
                            </View>
                            <Text style={styles.oppTrend}>{opp.growth_trend}</Text>
                            <Text style={styles.oppExp}>{opp.explanation}</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <Target size={48} color="#1e293b" />
                    <Text style={styles.emptyText}>Enter a product above to start AI market discovery.</Text>
                    <Text style={styles.emptySub}>Each deep analysis costs 1 credit.</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0f1e' },
    headerIndicator: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    creditsBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#3b82f6' },
    creditsText: { color: '#3b82f6', fontSize: 12, fontWeight: '700' },
    upgradeBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    upgradeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    heroSection: { alignItems: 'center', marginBottom: 32 },
    heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 12 },
    heroSub: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 4 },
    searchBox: { flexDirection: 'row', marginBottom: 32, gap: 8 },
    input: { flex: 1, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 16, color: '#fff', fontSize: 16 },
    searchBtn: { backgroundColor: '#3b82f6', width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    loaderContainer: { alignItems: 'center', marginTop: 40 },
    loaderText: { color: '#94a3b8', marginTop: 12, fontSize: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 16 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statBox: { flex: 1, backgroundColor: '#1e293b', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    statValue: { fontSize: 24, fontWeight: '800', color: '#3b82f6' },
    statLabel: { fontSize: 10, color: '#64748b', marginTop: 4, fontWeight: '700', textTransform: 'uppercase' },
    oppCard: { backgroundColor: '#1e293b', padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
    oppHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    oppCountry: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1 },
    scoreBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    scoreText: { color: '#10b981', fontWeight: 'bold', fontSize: 12 },
    oppTrend: { color: '#10b981', fontWeight: '700', marginTop: 8, fontSize: 14 },
    oppExp: { color: '#94a3b8', marginTop: 8, lineHeight: 20, fontSize: 14 },
    emptyState: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
    emptyText: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 16 },
    emptySub: { color: '#64748b', fontSize: 14, marginTop: 4 }
});
