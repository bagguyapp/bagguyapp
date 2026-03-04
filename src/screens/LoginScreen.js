import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const COLORS = { primary: '#FFD700', dark: '#1a1a2e', card: '#16213e', text: '#fff', sub: '#aaa', green: '#4CAF50' };

export default function LoginScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) return Alert.alert('Required', 'Email and password are required');
    setLoading(true);
    try {
      if (isLogin) await login(email, password);
      else await signup(email, password, name);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.logo}>🛍️</Text>
        <Text style={styles.title}>Bag Guy</Text>
        <Text style={styles.tagline}>Save money every time you shop</Text>

        <View style={styles.form}>
          {!isLogin && (
            <TextInput style={styles.input} placeholder="Your name" placeholderTextColor={COLORS.sub}
              value={name} onChangeText={setName} autoCapitalize="words" />
          )}
          <TextInput style={styles.input} placeholder="Email address" placeholderTextColor={COLORS.sub}
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor={COLORS.sub}
            value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.dark} /> :
              <Text style={styles.btnText}>{isLogin ? 'Sign In' : 'Create Free Account'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchBtn}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Text style={styles.switchLink}>{isLogin ? 'Sign up free' : 'Sign in'}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>No wallet required • Works with any store • Free to start</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 72, textAlign: 'center' },
  title: { color: COLORS.primary, fontSize: 40, fontWeight: 'bold', textAlign: 'center', marginTop: 8 },
  tagline: { color: COLORS.sub, textAlign: 'center', marginBottom: 40, fontSize: 16 },
  form: { backgroundColor: COLORS.card, borderRadius: 20, padding: 24 },
  input: { backgroundColor: '#0f0f1a', color: COLORS.text, padding: 16, borderRadius: 10, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  btn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText: { color: COLORS.dark, fontWeight: 'bold', fontSize: 18 },
  switchBtn: { marginTop: 16, alignItems: 'center' },
  switchText: { color: COLORS.sub },
  switchLink: { color: COLORS.primary, fontWeight: 'bold' },
  footer: { color: COLORS.sub, textAlign: 'center', marginTop: 32, fontSize: 12 },
});
