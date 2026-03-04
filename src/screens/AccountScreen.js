import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

const COLORS = { primary: '#FFD700', dark: '#1a1a2e', card: '#16213e', text: '#fff', sub: '#aaa', green: '#4CAF50', red: '#f44336' };

export default function AccountScreen({ navigation }) {
  const { user, logout, tierLabel } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout }
    ]);
  };

  const Row = ({ icon, label, onPress, danger }) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, danger && { color: COLORS.red }]}>{label}</Text>
      <Text style={styles.rowArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Account</Text>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Text style={styles.avatar}>👤</Text>
        <Text style={styles.userName}>{user?.name || 'Shopper'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.tierBadge}>
          <Text style={styles.tierBadgeText}>{tierLabel[user?.tier || 'free']}</Text>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shopping</Text>
        <Row icon="📋" label="My Purchase History" onPress={() => {}} />
        <Row icon="📝" label="My Grocery Lists" onPress={() => {}} />
        <Row icon="👨‍👩‍👧" label="Family Mode" onPress={() => {}} />
        <Row icon="🏪" label="In-Store AI Mode" onPress={() => {}} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Row icon="⭐" label="My Rewards & Stars" onPress={() => navigation.navigate('Wallet')} />
        <Row icon="👑" label="Subscription" onPress={() => navigation.navigate('Subscription')} />
        <Row icon="🔔" label="Notifications" onPress={() => {}} />
        <Row icon="🔒" label="Privacy & Data" onPress={() => {}} />
      </View>

      {/* Go Crypto — subtle, non-pushy */}
      {!user?.cryptoEnabled && (
        <View style={styles.cryptoSection}>
          <Text style={styles.cryptoTitle}>🔗 Connect Wallet (Optional)</Text>
          <Text style={styles.cryptoDesc}>
            Power users can connect a crypto wallet to unlock BGT token rewards and see their NFT loyalty tier.
            Completely optional — the app works great without it.
          </Text>
          <TouchableOpacity style={styles.cryptoBtn}>
            <Text style={styles.cryptoBtnText}>Go Crypto →</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Row icon="🚪" label="Sign Out" onPress={handleLogout} danger />
      </View>

      <Text style={styles.version}>Bag Guy v1.0.0 • March 3, 2026</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  pageTitle: { color: COLORS.text, fontSize: 28, fontWeight: 'bold', padding: 24, paddingTop: 60 },
  profileCard: { margin: 16, padding: 24, backgroundColor: COLORS.card, borderRadius: 20, alignItems: 'center' },
  avatar: { fontSize: 56 },
  userName: { color: COLORS.text, fontSize: 22, fontWeight: 'bold', marginTop: 12 },
  userEmail: { color: COLORS.sub, marginTop: 4 },
  tierBadge: { marginTop: 12, backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  tierBadgeText: { color: COLORS.dark, fontWeight: 'bold' },
  section: { margin: 16, backgroundColor: COLORS.card, borderRadius: 16, overflow: 'hidden' },
  sectionTitle: { color: COLORS.sub, fontSize: 13, padding: 12, paddingBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderColor: '#222' },
  rowIcon: { fontSize: 20, width: 32 },
  rowLabel: { color: COLORS.text, flex: 1, fontSize: 16 },
  rowArrow: { color: COLORS.sub, fontSize: 20 },
  cryptoSection: { margin: 16, padding: 20, backgroundColor: '#1a1a3a', borderRadius: 16, borderWidth: 1, borderColor: '#444' },
  cryptoTitle: { color: '#7986CB', fontWeight: 'bold', fontSize: 16 },
  cryptoDesc: { color: COLORS.sub, marginTop: 8, lineHeight: 20 },
  cryptoBtn: { marginTop: 12, alignSelf: 'flex-start', backgroundColor: '#2a2a5a', padding: 10, borderRadius: 8 },
  cryptoBtnText: { color: '#7986CB', fontWeight: 'bold' },
  version: { color: COLORS.sub, textAlign: 'center', padding: 24, fontSize: 12 },
});
