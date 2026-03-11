import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Alert } from 'react-native';
import { rewardsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = { primary: '#FFD700', dark: '#1a1a2e', card: '#16213e', text: '#fff', sub: '#aaa', green: '#4CAF50', silver: '#C0C0C0', gold: '#FFD700', purple: '#9C27B0' };
const TIER_COLORS = { free: '#888', silver: COLORS.silver, gold: COLORS.gold, platinum: COLORS.purple };

export default function WalletScreen({ navigation }) {
  const { user, tierLabel } = useAuth();
  const [rewards, setRewards] = useState(null);
  const counterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const res = await rewardsAPI.get();
      setRewards(res.data);
      Animated.timing(counterAnim, { toValue: res.data.savingsStars, duration: 1000, useNativeDriver: false }).start();
    } catch (e) {}
  };

  const handleRedeem = async () => {
    if (!rewards?.canRedeem) {
      Alert.alert('Not enough stars', `You need at least 100 stars to redeem. You have ${rewards?.savingsStars || 0}.`);
      return;
    }
    Alert.alert('Redeem Stars', `Redeem 100 stars for $5.00 cash back?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Redeem!', onPress: async () => {
        try {
          await rewardsAPI.redeem(100);
          Alert.alert('🎉 Redeemed!', '$5.00 added to your credits.');
          loadRewards();
        } catch (e) { Alert.alert('Error', 'Could not redeem. Try again.'); }
      }}
    ]);
  };

  const tierColor = TIER_COLORS[user?.tier || 'free'];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>💰 My Rewards</Text>

      {/* Tier Badge */}
      <View style={[styles.tierCard, { borderColor: tierColor }]}>
        <Text style={[styles.tierName, { color: tierColor }]}>
          {user?.tier === 'silver' ? '🥈' : user?.tier === 'gold' ? '🥇' : user?.tier === 'platinum' ? '💎' : '🛍️'} {tierLabel[user?.tier || 'free']}
        </Text>

        {/* Stars Balance */}
        <Animated.Text style={styles.starsBalance}>
          ⭐ {rewards?.savingsStars || 0} Savings Stars
        </Animated.Text>

        {/* USD Value */}
        <Text style={styles.usdValue}>{rewards?.usdValue || '$0.00'} cash back value</Text>

        {/* Progress Bar */}
        {rewards?.nextTier && (
          <>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${rewards.progressPercent}%`, backgroundColor: tierColor }]} />
            </View>
            <Text style={styles.progressText}>
              {rewards.starsToNextTier - rewards.savingsStars} stars to {rewards.nextTierLabel}
            </Text>
          </>
        )}

        {/* Multiplier */}
        <Text style={styles.multiplier}>Earning {rewards?.multiplier || 1}× Stars on every shop</Text>
      </View>

      {/* Redeem Button */}
      <TouchableOpacity
        style={[styles.redeemBtn, !rewards?.canRedeem && styles.redeemBtnDisabled]}
        onPress={handleRedeem}
      >
        <Text style={styles.redeemBtnText}>
          {rewards?.canRedeem ? '💵 Redeem Cash Back' : `Need ${100 - (rewards?.savingsStars || 0)} more stars`}
        </Text>
        <Text style={styles.redeemSubtext}>Minimum 100 stars = $5.00</Text>
      </TouchableOpacity>

      {/* USD Credits */}
      <View style={styles.creditsCard}>
        <Text style={styles.creditsTitle}>💳 Available Credits</Text>
        <Text style={styles.creditsAmount}>{rewards?.usdCredits || '$0.00'}</Text>
        <Text style={styles.creditsSub}>Use at checkout on your next purchase</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>📊 Your Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>{rewards?.starsLifetime || 0}</Text><Text style={styles.statLabel}>Stars Earned</Text></View>
          <View style={styles.statItem}><Text style={styles.statValue}>{rewards?.totalSaved || '$0.00'}</Text><Text style={styles.statLabel}>Total Saved</Text></View>
        </View>
      </View>

      {/* Upgrade CTA */}
      {user?.tier !== 'platinum' && (
        <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Subscription')}>
          <Text style={styles.upgradeBtnText}>⬆️ Upgrade for more Stars</Text>
        </TouchableOpacity>
      )}

      {/* Go Crypto button — shown to all but subtle */}
      {!user?.cryptoEnabled && (
        <TouchableOpacity style={styles.cryptoBtn} onPress={() => navigation.navigate('Crypto')}>
          <Text style={styles.cryptoBtnText}>🔗 Go Crypto — Connect Wallet</Text>
          <Text style={styles.cryptoBtnSub}>Unlock BGT token rewards & NFT tier</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  pageTitle: { color: COLORS.text, fontSize: 28, fontWeight: 'bold', padding: 24, paddingTop: 60 },
  tierCard: { margin: 16, padding: 24, backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 2 },
  tierName: { fontSize: 22, fontWeight: 'bold' },
  starsBalance: { color: COLORS.text, fontSize: 36, fontWeight: 'bold', marginTop: 12 },
  usdValue: { color: COLORS.green, fontSize: 18, marginTop: 4 },
  progressBar: { height: 8, backgroundColor: '#333', borderRadius: 4, marginTop: 16 },
  progressFill: { height: 8, borderRadius: 4 },
  progressText: { color: COLORS.sub, marginTop: 8, fontSize: 13 },
  multiplier: { color: COLORS.primary, marginTop: 12, fontWeight: '600' },
  redeemBtn: { margin: 16, padding: 18, backgroundColor: COLORS.green, borderRadius: 14, alignItems: 'center' },
  redeemBtnDisabled: { backgroundColor: '#333' },
  redeemBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  redeemSubtext: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  creditsCard: { margin: 16, padding: 20, backgroundColor: COLORS.card, borderRadius: 16 },
  creditsTitle: { color: COLORS.sub, fontSize: 14 },
  creditsAmount: { color: COLORS.text, fontSize: 32, fontWeight: 'bold', marginTop: 4 },
  creditsSub: { color: COLORS.sub, marginTop: 4, fontSize: 13 },
  statsCard: { margin: 16, padding: 20, backgroundColor: COLORS.card, borderRadius: 16 },
  statsTitle: { color: COLORS.text, fontWeight: 'bold', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { color: COLORS.primary, fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: COLORS.sub, marginTop: 4, fontSize: 12 },
  upgradeBtn: { margin: 16, padding: 16, backgroundColor: '#1a3a1a', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.green },
  upgradeBtnText: { color: COLORS.green, fontWeight: 'bold' },
  cryptoBtn: { margin: 16, marginTop: 0, padding: 16, backgroundColor: '#1a1a3a', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#444' },
  cryptoBtnText: { color: '#7986CB', fontWeight: 'bold' },
  cryptoBtnSub: { color: COLORS.sub, fontSize: 12, marginTop: 4 },
});
