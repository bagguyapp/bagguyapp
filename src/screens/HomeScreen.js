import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { rewardsAPI } from '../services/api';

const COLORS = {
  primary: '#FFD700', dark: '#1a1a2e', card: '#16213e',
  text: '#fff', sub: '#aaa', green: '#4CAF50',
};

const TIPS = [
  'Scan any grocery item to instantly find and stack the best coupons available.',
  'Stack a manufacturer coupon + a store coupon on the same item to double your savings!',
  'Buy generic on staples (sugar, salt, flour) — save that budget for brand coupons.',
  'Buy non-perishables in bulk when you have a coupon — they don\'t expire.',
  'Scan items before putting them in your cart. If there\'s no coupon, check the store brand.',
  'Wednesday is the best day to shop — new weekly deals start then at most chains.',
  'Loyalty cards are free at every grocery store. Always sign up.',
  'Use the Grocery List to pre-scan your whole trip before you leave home.',
];

export default function HomeScreen({ navigation }) {
  const { user, tierLabel } = useAuth();
  const [rewards, setRewards] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);

  const loadRewards = async () => {
    try {
      const res = await rewardsAPI.get();
      setRewards(res.data);
    } catch (e) {}
  };

  useEffect(() => { loadRewards(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRewards();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🛍️ Bag Guy</Text>
        <Text style={styles.tagline}>Save money every time you shop</Text>
      </View>

      {/* Tier Card */}
      <View style={styles.tierCard}>
        <Text style={styles.tierLabel}>{tierLabel[user?.tier || 'free']}</Text>
        <Text style={styles.tierStars}>⭐ {rewards?.savingsStars || 0} Savings Stars</Text>
        <Text style={styles.tierValue}>{rewards?.usdValue || '$0.00'} in rewards</Text>
        {rewards?.nextTier && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(rewards.progressPercent, 100)}%` }]} />
          </View>
        )}
        {rewards?.nextTier && (
          <Text style={styles.progressText}>
            {Math.max(0, (rewards.starsToNextTier || 0) - (rewards.savingsStars || 0))} stars to {rewards.nextTierLabel}
          </Text>
        )}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.getParent()?.navigate('Scan')}
        >
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionText}>Scan Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Coupons')}
        >
          <Text style={styles.actionIcon}>🏷️</Text>
          <Text style={styles.actionText}>Coupons</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.getParent()?.navigate('Wallet')}
        >
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionText}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.getParent()?.navigate('List')}
        >
          <Text style={styles.actionIcon}>🛒</Text>
          <Text style={styles.actionText}>My List</Text>
        </TouchableOpacity>
      </View>

      {/* Savings Tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Savings Tip</Text>
        <Text style={styles.tipText}>{tip}</Text>
      </View>

      {/* Upgrade CTA (non-crypto, only for free users) */}
      {user?.tier === 'free' && (
        <TouchableOpacity
          style={styles.upgradeCard}
          onPress={() => navigation.getParent()?.navigate('Wallet', { screen: 'Subscription' })}
        >
          <Text style={styles.upgradeTitle}>🚀 Upgrade to VIP Silver</Text>
          <Text style={styles.upgradeText}>Earn 2× Stars on every shop — $9.99/month</Text>
        </TouchableOpacity>
      )}

      {/* Stats row for engaged users */}
      {(rewards?.savingsStars || 0) > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{rewards?.savingsStars || 0}</Text>
            <Text style={styles.statLabel}>Stars</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{rewards?.totalSaved || '$0.00'}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{rewards?.multiplier || 1}×</Text>
            <Text style={styles.statLabel}>Multiplier</Text>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: { padding: 24, paddingTop: 60, alignItems: 'center' },
  logo: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
  tagline: { color: COLORS.sub, marginTop: 4 },
  tierCard: {
    margin: 16, padding: 20, backgroundColor: COLORS.card,
    borderRadius: 16, borderWidth: 1, borderColor: COLORS.primary,
  },
  tierLabel: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
  tierStars: { color: COLORS.text, fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  tierValue: { color: COLORS.green, fontSize: 16, marginTop: 4 },
  progressBar: { height: 6, backgroundColor: '#333', borderRadius: 3, marginTop: 12 },
  progressFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  progressText: { color: COLORS.sub, fontSize: 12, marginTop: 6 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginHorizontal: 16, marginTop: 8 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 16 },
  actionBtn: { alignItems: 'center', backgroundColor: COLORS.card, padding: 14, borderRadius: 12, width: '22%' },
  actionIcon: { fontSize: 26 },
  actionText: { color: COLORS.text, marginTop: 8, fontSize: 11, textAlign: 'center' },
  tipCard: { margin: 16, padding: 16, backgroundColor: COLORS.card, borderRadius: 12 },
  tipTitle: { color: COLORS.primary, fontWeight: 'bold', marginBottom: 6 },
  tipText: { color: COLORS.sub, lineHeight: 20 },
  upgradeCard: {
    margin: 16, padding: 20, backgroundColor: '#1a3a1a',
    borderRadius: 16, borderWidth: 1, borderColor: COLORS.green,
  },
  upgradeTitle: { color: COLORS.green, fontWeight: 'bold', fontSize: 16 },
  upgradeText: { color: COLORS.sub, marginTop: 4 },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    margin: 16, padding: 20, backgroundColor: COLORS.card, borderRadius: 16,
  },
  statItem: { alignItems: 'center' },
  statValue: { color: COLORS.primary, fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: COLORS.sub, fontSize: 12, marginTop: 4 },
});
