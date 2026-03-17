import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { db, auth, functions } from '../api/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Send, Bot, User, Trash2 } from 'lucide-react-native';

export default function AiAssistantScreen() {
  const [queryInput, setQueryInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<any>();

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, 'chats', auth.currentUser.uid, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => doc.data());
      setMessages(msgs);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return unsub;
  }, []);

  const handleSend = async () => {
    if (!queryInput.trim() || !auth.currentUser) return;
    
    const text = queryInput;
    setQueryInput('');
    setLoading(true);

    try {
      const chatFunc = httpsCallable(functions, 'chatWithAssistant');
      await chatFunc({ message: text });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatArea} 
        contentContainerStyle={styles.chatContent}
      >
        {messages.length === 0 && !loading && (
            <View style={styles.emptyState}>
                <Bot size={48} color="#1e293b" />
                <Text style={styles.emptyTitle}>EximHub AI Agent</Text>
                <Text style={styles.emptySub}>Ask about HSN codes, market trends, or buyers.</Text>
            </View>
        )}
        {messages.map((msg, index) => (
          <View key={index} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.botBubble]}>
            <View style={styles.bubbleHeader}>
                {msg.role === 'assistant' ? <Bot size={14} color="#3b82f6" /> : <User size={14} color="#94a3b8" />}
                <Text style={styles.roleText}>{msg.role === 'assistant' ? 'EximHub AI' : 'You'}</Text>
            </View>
            <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.botText]}>{msg.text}</Text>
          </View>
        ))}
        {loading && (
            <View style={[styles.messageBubble, styles.botBubble]}>
                 <ActivityIndicator size="small" color="#3b82f6" />
            </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          placeholderTextColor="#64748b"
          value={queryInput}
          onChangeText={setQueryInput}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Send color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  chatArea: { flex: 1, padding: 16 },
  chatContent: { paddingBottom: 20 },
  emptyState: { alignItems: 'center', marginTop: 100, opacity: 0.5 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  emptySub: { color: '#64748b', fontSize: 14, marginTop: 4, textAlign: 'center' },
  messageBubble: { maxWidth: '85%', padding: 14, borderRadius: 20, marginBottom: 16 },
  userBubble: { backgroundColor: '#3b82f6', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: '#1e293b', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#334155' },
  bubbleHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  roleText: { color: '#64748b', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  botText: { color: '#cbd5e1' },
  inputArea: { flexDirection: 'row', padding: 16, backgroundColor: '#0f172a', borderTopWidth: 1, borderColor: '#1e293b', alignItems: 'flex-end', gap: 12 },
  input: { flex: 1, backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, maxHeight: 120, fontSize: 16, color: '#fff', borderWidth: 1, borderColor: '#334155' },
  sendButton: { backgroundColor: '#3b82f6', width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 2 }
});
