import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Image, Linking, Alert } from 'react-native';
import { db, auth, functions } from '../api/firebase';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Book, Database, ShoppingBag, CheckCircle, CreditCard, ExternalLink, Library, BookOpen } from 'lucide-react-native';

export default function TradeLibraryScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('Store'); // 'Store' or 'My Library'
  const [userData, setUserData] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.currentUser) {
      const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
        setUserData(doc.data());
      });
      return unsub;
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
        // Always fetch purchased IDs first
        const pSnap = await getDocs(query(collection(db, 'purchases'), where('user_id', '==', auth.currentUser.uid)));
        const ids = new Set(pSnap.docs.map(doc => doc.data().book_id));
        setPurchasedIds(ids);

        if (activeTab === 'Store') {
            const bSnap = await getDocs(collection(db, 'books'));
            setItems(bSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
            if (ids.size > 0) {
                const bQ = query(collection(db, 'books'), where('__name__', 'in', Array.from(ids).slice(0, 10)));
                const bSnap = await getDocs(bQ);
                setItems(bSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), unlocked: true })));
            } else {
                setItems([]);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleBuy = async (bookId: string) => {
      try {
          const buyFunc = httpsCallable(functions, 'buyBook');
          const result: any = await buyFunc({ bookId });
          if (result.data.success) {
              Alert.alert("Success", "Book added to My Library!");
              fetchItems();
          } else {
              Alert.alert("Error", result.data.message || "Purchase failed.");
          }
      } catch (e: any) {
          Alert.alert("Error", e.message);
      }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isOwned = purchasedIds.has(item.id);
    return (
        <View style={styles.card}>
            <View style={styles.cardIcon}>
                <BookOpen color="#3b82f6" size={24} />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardType}>Digital Guide</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                {activeTab === 'Store' ? (
                    <View style={styles.cardFooter}>
                        <Text style={styles.cardPrice}>₹{item.price}</Text>
                        {isOwned ? (
                            <View style={styles.ownedBadge}>
                                <CheckCircle size={14} color="#10b981" />
                                <Text style={styles.ownedText}>OWNED</Text>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.buyBtn} onPress={() => handleBuy(item.id)}>
                                <Text style={styles.buyBtnText}>BUY NOW</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <TouchableOpacity style={styles.readBtn} onPress={() => Linking.openURL(item.download_url)}>
                        <ExternalLink size={16} color="#fff" />
                        <Text style={styles.readBtnText}>DOWNLOAD PDF</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
  };

  return (
    <View style={styles.container}>
       <View style={styles.topBar}>
          <View style={styles.creditsBox}>
             <CreditCard size={14} color="#3b82f6" />
             <Text style={styles.creditsCount}>{userData?.points_balance || 0} Points</Text>
          </View>
          <View style={styles.tabSwitcher}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'Store' && styles.activeTab]} 
                onPress={() => setActiveTab('Store')}
              >
                  <Text style={[styles.tabText, activeTab === 'Store' && styles.activeTabText]}>Marketplace</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'My Library' && styles.activeTab]} 
                onPress={() => setActiveTab('My Library')}
              >
                  <Text style={[styles.tabText, activeTab === 'My Library' && styles.activeTabText]}>My Library</Text>
              </TouchableOpacity>
          </View>
       </View>

       {loading ? (
           <View style={styles.center}>
               <ActivityIndicator color="#3b82f6" size="large" />
           </View>
       ) : (
           <FlatList 
             data={items}
             keyExtractor={i => i.id}
             renderItem={renderItem}
             contentContainerStyle={styles.list}
             ListHeaderComponent={
                 <View style={styles.listHeader}>
                     <ShoppingBag size={20} color="#3b82f6" />
                     <Text style={styles.listHeaderTitle}>{activeTab === 'Store' ? 'Premium Trade Resources' : 'Your Digital Collection'}</Text>
                 </View>
             }
           />
       )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  topBar: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  creditsBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 20, borderWidth: 1, borderColor: '#3b82f6' },
  creditsCount: { color: '#3b82f6', fontSize: 12, fontWeight: '700' },
  tabSwitcher: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#3b82f6' },
  tabText: { color: '#64748b', fontSize: 14, fontWeight: '700' },
  activeTabText: { color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20 },
  listHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  listHeaderTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', gap: 16, borderWidth: 1, borderColor: '#334155' },
  cardIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  cardContent: { flex: 1 },
  cardType: { color: '#3b82f6', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cardDesc: { color: '#94a3b8', fontSize: 12, marginTop: 4, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  cardPrice: { color: '#fff', fontSize: 18, fontWeight: '800' },
  ownedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  ownedText: { color: '#10b981', fontSize: 10, fontWeight: '800' },
  buyBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  buyBtnText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  readBtn: { backgroundColor: '#1e293b', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 8, marginTop: 12, borderWidth: 1, borderColor: '#3b82f6' },
  readBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});
