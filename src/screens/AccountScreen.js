import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Switch, Linking,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#FFD700', dark: '#1a1a2e', card: '#16213e',
  text: '#fff', sub: '#aaa', green: '#4CAF50', red: '#f44336',
};

export default function AccountScreen({ navigation }) {
  const { user, logout, tierLabel } = useAuth();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleComingSoon = (feature) => {
    Alert.alert(`${feature}`, 'This feature is coming soon! 🚀\n\nWe\'re building it now.', [
      { text: 'OK' },
    ]);
  };

  const Row = ({ icon, label, onPress, danger, right, disabled }) => (
    <TouchableOpacity
      style={[styles.row, disabled && { opacity: 0.5 }]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, danger && { color: COLORS.red }]}>{label}</Text>
      {right || <Text style={styles.rowArrow}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Account</Text>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Shopper'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={[styles.tierBadge,
          user?.tier === 'silver' ? styles.tierSilver :
          user?.tier === 'gold' ? styles.tierGold :
          user?.tier === 'platinum' ? styles.tierPlatinum : {}
        ]}>
          <Text style={styles.tierBadgeText}>{tierLabel[user?.tier || 'free']}</Text>
        </View>
      </View>

      {/* Shopping */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shopping</Text>
        <Row
          icon="📋"
          label="My Purchase History"
          onPress={() => navigation.navigate('PurchaseHistory')}
        />
        <Row
          icon="🏷️"
          label="Browse Coupons"
          onPress={() => navigation.getParent()?.navigate('Home', { screen: 'Coupons' })}
        />
        <Row
          icon="👨‍👩‍👧"
          label="Family Mode"
          onPress={() => handleComingSoon('Family Mode')}
        />
        <Row
          icon="🏪"
          label="In-Store AI Mode"
          onPress={() => handleComingSoon('In-Store AI Mode')}
        />
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Row
          icon="⭐"
          label="My Rewards & Stars"
          onPress={() => navigation.getParent()?.navigate('Wallet')}
        />
        <Row
          icon="👑"
          label="Upgrade Plan"
          onPress={() => navigation.navigate('Subscription')}
        />
        <Row
          icon="🔔"
          label="Push Notifications"
          right={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#333', true: COLORS.primary }}
              thumbColor="#fff"
            />
          }
        />
        <Row
          icon="🔒"
          label="Privacy & Data"
          onPress={() => Alert.alert(
            'Privacy & Data',
            'Bag Guy collects only what\'s needed:\n\n• Email & name for your account\n• Scan history for rewards tracking\n• No location data\n• No data sold to third parties\n\nTo delete your account, email:\nsupport@bagguyapp.com',
            [{ text: 'OK' }]
          )}
        />
        <Row
          icon="📧"
          label="Contact Support"
          onPress={() => Linking.openURL('mailto:support@bagguyapp.com?subject=Bag%20Guy%20Support')}
        />
      </View>

      {/* Go Crypto — subtle, non-pushy */}
      {!user?.cryptoEnabled && (
        <TouchableOpacity
          style={styles.cryptoSection}
          onPress={() => navigation.navigate('Crypto')}
          activeOpacity={0.8}
        >
          <Text style={styles.cryptoTitle}>🔗 Connect Crypto Wallet (Optional)</Text>
          <Text style={styles.cryptoDesc}>
            Connect a wallet to earn BGT tokens on every scan and unlock NFT loyalty tiers.
            Completely optional — the app works great without it.
          </Text>
          <Text style={styles.cryptoBtn}>Go Crypto →</Text>
        </TouchableOpacity>
      )}

      {/* Sign Out */}
      <View style={styles.section}>
        <Row icon="🚪" label="Sign Out" onPress={handleLogout} danger />
      </View>

      <Text style={styles.version}>Bag Guy v1.0.0 · Built with ❤️ for smart shoppers</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  pageTitle: { color: COLORS.text, fontSize: 28, fontWeight: 'bold', padding: 24, paddingTop: 60 },
  profileCard: { margin: 16, padding: 24, backgroundColor: COLORS.card, borderRadius: 20, alignItems: 'center' },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { color: COLORS.dark, fontSize: 32, fontWeight: 'bold' },
  userName: { color: COLORS.text, fontSize: 22, fontWeight: 'bold', marginTop: 12 },
  userEmail: { color: COLORS.sub, marginTop: 4 },
  tierBadge: {
    marginTop: 12, backgroundColor: '#333',
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
  },
  tierSilver: { backgroundColor: '#555' },
  tierGold: { backgroundColor: COLORS.primary },
  tierPlatinum: { backgroundColor: '#6a1b9a' },
  tierBadgeText: { color: COLORS.text, fontWeight: 'bold' },
  section: { margin: 16, backgroundColor: COLORS.card, borderRadius: 16, overflow: 'hidden' },
  sectionTitle: {
    color: COLORS.sub, fontSize: 13, padding: 12, paddingBottom: 4,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderColor: '#222' },
  rowIcon: { fontSize: 20, width: 32 },
  rowLabel: { color: COLORS.text, flex: 1, fontSize: 16 },
  rowArrow: { color: COLORS.sub, fontSize: 20 },
  cryptoSection: {
    margin: 16, padding: 20, backgroundColor: '#1a1a3a',
    borderRadius: 16, borderWidth: 1, borderColor: '#444',
  },
  cryptoTitle: { color: '#7986CB', fontWeight: 'bold', fontSize: 16 },
  cryptoDesc: { color: COLORS.sub, marginTop: 8, lineHeight: 20 },
  cryptoBtn: { marginTop: 12, color: '#7986CB', fontWeight: 'bold' },
  version: { color: COLORS.sub, textAlign: 'center', padding: 24, fontSize: 12 },
});
