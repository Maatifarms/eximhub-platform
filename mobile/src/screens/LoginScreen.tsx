import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/client';
import { LogIn, Mail, Phone, Globe, Shield, Chrome, User } from 'lucide-react-native';

export default function LoginScreen({ onAuthSuccess }: { onAuthSuccess?: () => Promise<void> | void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await authApi.login({ email, password });
        if (res.data.success) {
          const userData = res.data.data;
          await AsyncStorage.setItem('exim_token', userData.token);
          await AsyncStorage.setItem('exim_user', JSON.stringify(userData));
          await onAuthSuccess?.();
          Alert.alert("Success", "Welcome back to EximHub!");
        }
      } else {
        const res = await authApi.signup({ name, email, password });
        if (res.data.success) {
          const userData = res.data.data;
          await AsyncStorage.setItem('exim_token', userData.token);
          await AsyncStorage.setItem('exim_user', JSON.stringify(userData));
          await onAuthSuccess?.();
          Alert.alert("Success", "Account created! 100 Credits added.");
        }
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      Alert.alert("Auth Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    Alert.alert("Google Login", "Google Sign-In initialized. (Redirecting to Secure Social Portal)");
    // Logic for signInWithPopup or Redirect would go here
  };

  const handlePhoneLogin = async () => {
    Alert.alert("Phone Authentication", "Entering Secure OTP Portal...");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Shield size={40} color="#3b82f6" />
        <Text style={styles.title}>EximHub</Text>
        <Text style={styles.subtitle}>Global Trade Intelligence Platform</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
        
        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleLogin}>
            <Chrome size={20} color="#64748b" />
            <Text style={styles.socialBtnText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} onPress={handlePhoneLogin}>
            <Phone size={20} color="#64748b" />
            <Text style={styles.socialBtnText}>Phone</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>or use email</Text>
          <View style={styles.line} />
        </View>

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.mainBtn} onPress={handleAuth} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>{isLogin ? 'Login to Dashboard' : 'Start Discovery'}</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleBtn}>
          <Text style={styles.toggleText}>
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>© 2026 EximHub Global Trade. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#0f172a' },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', marginTop: 12 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  card: { backgroundColor: '#1e293b', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#f8fafc', marginBottom: 24, textAlign: 'center' },
  socialButtons: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#334155', backgroundColor: '#0f172a' },
  socialBtnText: { color: '#f8fafc', fontWeight: '500' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  line: { flex: 1, height: 1, backgroundColor: '#334155' },
  dividerText: { marginHorizontal: 12, color: '#64748b', fontSize: 12 },
  input: { backgroundColor: '#0f172a', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#334155', marginBottom: 16, color: '#fff' },
  mainBtn: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  mainBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  toggleBtn: { marginTop: 24, alignItems: 'center' },
  toggleText: { color: '#60a5fa', fontWeight: '500' },
  footer: { textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 32 }
});
