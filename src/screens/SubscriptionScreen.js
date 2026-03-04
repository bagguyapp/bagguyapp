import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { subscriptionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = { primary: '#FFD700', dark: '#1a1a2e', card: '#16213e', text: '#fff', sub: '#aaa', green: '#4CAF50', silver: '#C0C0C0', gold: '#FFD700', purple: '#9C27B0' };

const TIER_STYLE = {
  free:     { color: '#888',     icon: '🛍️', border: '#333' },
  silver:   { color: '#C0C0C0', icon: '🥈', border: '#C0C0C0' },
  gold:     { color: '#FFD700', icon: '🥇', border: '#FFD700' },
  platinum: { color: '#CE93D8', icon: '💎', border: '#9C27B0' },
};

export default function SubscriptionScreen() {
  const { user, tierLabel } = useAuth();
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    subscriptionsAPI.tiers().then(r => setTiers(r.data)).catch(() => {});
  }, []);

  const handleUpgrade = (tier) => {
    Alert.alert(`Upgrade to ${tierLabel[tier]}?`,
      'You will be redirected to secure checkout. Pay with any credit or debit card.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue to Checkout', onPress: async () => {
          setLoading(true);
          try {
            const res = await subscriptionsAPI.checkout(tier);
            // In production: open res.data.sessionUrl in browser/WebView
            Alert.alert('Checkout Ready', 'Opening secure payment...\n\nStripe checkout URL:\n' + res.data?.sessionUrl);
          } catch (e) {
            Alert.alert('Not available yet', 'Stripe is being configured. Coming very soon!');
          } finally { setLoading(false); }
        }}
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>🏆 Choose Your Plan</Text>
      <Text style={styles.subtitle}>Upgrade to earn more Savings Stars and unlock premium features</Text>

      {/* Current tier */}
      <View style={styles.currentBadge}>
        <Text style={styles.currentText}>Current plan: <Text style={{ color: COLORS.primary }}>{tierLabel[user?.tier || 'free']}</Text></Text>
      </View>

      {tiers.map((tier) => {
        const ts = TIER_STYLE[tier.id];
        const isCurrent = user?.tier === tier.id;
        return (
          <View key={tier.id} style={[styles.tierCard, { borderColor: ts.border }, isCurrent && styles.currentTier]}>
            {isCurrent && <View style={styles.currentPill}><Text style={styles.currentPillText}>CURRENT</Text></View>}
            <View style={styles.tierHeader}>
              <Text style={styles.tierIcon}>{ts.icon}</Text>
              <View>
                <Text style={[styles.tierName, { color: ts.color }]}>{tier.label}</Text>
                <Text style={styles.tierPrice}>{tier.price}</Text>
              </View>
              <Text style={[styles.tierStars, { color: ts.color }]}>{tier.stars}</Text>
            </View>
            <View style={styles.perks}>
              {tier.perks.map((perk, i) => (
                <Text key={i} style={styles.perk}>✓ {perk}</Text>
              ))}
            </View>
            {!isCurrent && tier.id !== 'free' && (
              <TouchableOpacity
                style={[styles.upgradeBtn, { backgroundColor: ts.color }]}
                onPress={() => handleUpgrade(tier.id)}
                disabled={loading}
              >
                <Text style={styles.upgradeBtnText}>Get {tier.label}</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      {/* Payment note — card first, crypto secondary */}
      <View style={styles.paymentNote}>
        <Text style={styles.paymentNoteTitle}>💳 Secure Payment</Text>
        <Text style={styles.paymentNoteText}>Pay with any credit or debit card. Crypto payment also available — tap "Connect Wallet" in your account settings.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  pageTitle: { color: COLORS.text, fontSize: 28, fontWeight: 'bold', padding: 24, paddingTop: 60 },
  subtitle: { color: COLORS.sub, paddingHorizontal: 24, marginBottom: 16 },
  currentBadge: { marginHorizontal: 16, marginBottom: 8, padding: 12, backgroundColor: COLORS.card, borderRadius: 10 },
  currentText: { color: COLORS.sub, textAlign: 'center' },
  tierCard: { margin: 16, marginBottom: 8, padding: 20, backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1.5 },
  currentTier: { backgroundColor: '#1a1a2e' },
  currentPill: { position: 'absolute', top: 12, right: 12, backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  currentPillText: { color: COLORS.dark, fontSize: 10, fontWeight: 'bold' },
  tierHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  tierIcon: { fontSize: 32, marginRight: 12 },
  tierName: { fontSize: 20, fontWeight: 'bold' },
  tierPrice: { color: COLORS.sub, marginTop: 2 },
  tierStars: { marginLeft: 'auto', fontWeight: 'bold', fontSize: 16 },
  perks: { marginBottom: 16 },
  perk: { color: COLORS.sub, marginBottom: 6, paddingLeft: 4 },
  upgradeBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  upgradeBtnText: { color: COLORS.dark, fontWeight: 'bold', fontSize: 16 },
  paymentNote: { margin: 16, padding: 16, backgroundColor: COLORS.card, borderRadius: 12, marginBottom: 40 },
  paymentNoteTitle: { color: COLORS.text, fontWeight: 'bold', marginBottom: 8 },
  paymentNoteText: { color: COLORS.sub, lineHeight: 20 },
});
