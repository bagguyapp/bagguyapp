import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, Alert, Linking, ActivityIndicator, RefreshControl,
} from 'react-native';
import { blockchainAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  dark: '#1a1a2e',
  card: '#16213e',
  primary: '#FFD700',
  text: '#fff',
  sub: '#aaa',
  green: '#4CAF50',
  purple: '#7986CB',
  red: '#F44336',
  gold: '#FFD700',
};

const BGT_CONTRACT  = '0x9f5009bc4268D1BD7315d3eF74058fbDeb88E56F';
const NFT_CONTRACT  = '0x897d020fd39AFaB13dadA3a9524Fc6231DBaA8B4';

// ── Animated number counter ────────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 4, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: value || 0, duration: 1200, useNativeDriver: false }).start();
    const id = anim.addListener(({ value: v }) =>
      setDisplay(v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')));
    return () => anim.removeListener(id);
  }, [value]);

  return <Text style={style}>{display}</Text>;
}

// ── Main Screen ────────────────────────────────────────────────────────────
export default function CryptoScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [walletInput, setWalletInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [portfolioRes, lbRes] = await Promise.allSettled([
        blockchainAPI.portfolio(),
        blockchainAPI.leaderboard(),
      ]);
      if (portfolioRes.status === 'fulfilled') setPortfolio(portfolioRes.value.data);
      if (lbRes.status === 'fulfilled') setLeaderboard(lbRes.value.data);
    } catch (_) {}
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const handleConnectWallet = async () => {
    const addr = walletInput.trim();
    if (!addr) return Alert.alert('Enter address', 'Paste your Polygon wallet address first.');
    setConnecting(true);
    try {
      const res = await blockchainAPI.connectWallet(addr);
      const { portfolio: p, nftUpgrade } = res.data;
      setPortfolio(p);
      if (refreshUser) await refreshUser();
      let msg = `Wallet connected! BGT Balance: ${p.bgtBalanceFormatted}`;
      if (nftUpgrade) msg += `\n\n🏆 ${nftUpgrade}`;
      Alert.alert('🔗 Connected!', msg);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Could not connect wallet. Check the address and try again.');
    }
    setConnecting(false);
  };

  const handleClaimBGT = async () => {
    if (!user?.bgtRewards || user.bgtRewards <= 0) {
      return Alert.alert('No rewards', 'You have no BGT rewards to claim yet. Keep scanning!');
    }
    Alert.alert(
      '🪙 Claim BGT',
      `Claim ${user.bgtRewards.toFixed(4)} BGT to your wallet?\n\nTokens are sent within 24 hours.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Claim!', onPress: async () => {
          setClaiming(true);
          try {
            const res = await blockchainAPI.claimBGT();
            const { claimedFormatted, message } = res.data;
            Alert.alert('✅ Claimed!', `${claimedFormatted} BGT\n\n${message}`);
            if (refreshUser) await refreshUser();
            await loadAll();
          } catch (e) {
            Alert.alert('Error', e.response?.data?.error || 'Could not process claim.');
          }
          setClaiming(false);
        }},
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading crypto data…</Text>
      </View>
    );
  }

  const isConnected = portfolio?.connected === true;
  const myRank = leaderboard?.leaderboard?.findIndex(e => e.name === user?.name) + 1 || null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <Text style={styles.pageTitle}>🔗 Crypto</Text>
      <Text style={styles.pageSub}>Powered by Polygon</Text>

      {/* ── CONNECT WALLET ──────────────────────────────────────────────── */}
      {!isConnected && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🦊 Connect Your Wallet</Text>
          <Text style={styles.cardSub}>
            Connect your Polygon wallet to earn BGT tokens on every scan.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="0x… Polygon address"
            placeholderTextColor={COLORS.sub}
            value={walletInput}
            onChangeText={setWalletInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.btn, connecting && styles.btnDisabled]}
            onPress={handleConnectWallet}
            disabled={connecting}
          >
            {connecting
              ? <ActivityIndicator color="#000" />
              : <Text style={styles.btnText}>Connect Wallet</Text>
            }
          </TouchableOpacity>
          <Text style={styles.hint}>
            Paste your address from MetaMask, Trust Wallet, or any Polygon-compatible wallet
          </Text>
        </View>
      )}

      {/* ── PORTFOLIO ───────────────────────────────────────────────────── */}
      {isConnected && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💼 Portfolio</Text>
          <Text style={styles.walletAddr} numberOfLines={1}>
            {portfolio.walletAddress}
          </Text>

          {/* BGT Balance */}
          <View style={styles.balanceRow}>
            <View style={styles.balanceBlock}>
              <Text style={styles.balanceLabel}>BGT Balance</Text>
              <AnimatedNumber value={portfolio.bgtBalance} decimals={4} style={styles.balanceBig} />
              <Text style={styles.balanceTicker}>BGT</Text>
            </View>
            <View style={styles.balanceBlock}>
              <Text style={styles.balanceLabel}>MATIC</Text>
              <AnimatedNumber value={portfolio.maticBalance} decimals={4} style={styles.balanceMed} />
              <Text style={styles.balanceTicker}>MATIC</Text>
            </View>
          </View>

          {/* NFT Badge */}
          {portfolio.hasBagGuyNFT && (
            <View style={styles.nftBadge}>
              <Text style={styles.nftIcon}>🏆</Text>
              <View>
                <Text style={styles.nftTitle}>BagGuyNFT Holder</Text>
                <Text style={styles.nftSub}>Token #{portfolio.nftTokenId} · Gold Tier Active</Text>
              </View>
            </View>
          )}

          {/* Pending BGT Rewards */}
          <View style={styles.rewardsRow}>
            <View>
              <Text style={styles.balanceLabel}>Pending BGT Rewards</Text>
              <Text style={styles.rewardsValue}>{(user?.bgtRewards || 0).toFixed(4)} BGT</Text>
            </View>
            <TouchableOpacity
              style={[styles.claimBtn, (!user?.bgtRewards || user.bgtRewards <= 0 || claiming) && styles.claimBtnDisabled]}
              onPress={handleClaimBGT}
              disabled={claiming || !user?.bgtRewards || user.bgtRewards <= 0}
            >
              {claiming
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.claimBtnText}>Claim</Text>
              }
            </TouchableOpacity>
          </View>

          {/* PolygonScan link */}
          <TouchableOpacity onPress={() => Linking.openURL(portfolio.polygonScanUrl)}>
            <Text style={styles.link}>View on PolygonScan ↗</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── LEADERBOARD ─────────────────────────────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 BGT Leaderboard</Text>

        {/* Stats summary */}
        {leaderboard?.stats && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{leaderboard.stats.totalBGTDistributed}</Text>
              <Text style={styles.statLabel}>Total BGT</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{leaderboard.stats.totalUsersWithWallets}</Text>
              <Text style={styles.statLabel}>Wallets</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{leaderboard.stats.totalClaimed}</Text>
              <Text style={styles.statLabel}>Claimed</Text>
            </View>
          </View>
        )}

        {leaderboard?.leaderboard?.length > 0 ? (
          leaderboard.leaderboard.map((entry) => (
            <View key={entry.rank} style={styles.lbRow}>
              <Text style={styles.lbRank}>
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
              </Text>
              <Text style={styles.lbName}>{entry.name}</Text>
              <Text style={styles.lbAmount}>{entry.bgtFormatted} BGT</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No earners yet — be the first!</Text>
        )}

        {myRank > 0 && (
          <Text style={styles.myRank}>Your rank: #{myRank}</Text>
        )}
      </View>

      {/* ── EDUCATION ───────────────────────────────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📚 Learn</Text>

        <View style={styles.eduCard}>
          <Text style={styles.eduTitle}>🪙 What is BGT?</Text>
          <Text style={styles.eduText}>
            Bag Guy Token (BGT) is earned automatically on every grocery scan. Hold BGT to unlock
            premium features and participate in governance.
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL(`https://polygonscan.com/address/${BGT_CONTRACT}`)}>
            <Text style={styles.link}>View BGT on PolygonScan ↗</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.eduCard, { marginTop: 12 }]}>
          <Text style={styles.eduTitle}>🏆 What is the BagGuyNFT?</Text>
          <Text style={styles.eduText}>
            BagGuyNFT holders get automatic Gold tier membership and boosted BGT rewards. Hold the
            NFT and level up your grocery game.
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL(`https://polygonscan.com/address/${NFT_CONTRACT}`)}>
            <Text style={styles.link}>View BagGuyNFT on PolygonScan ↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.dark },
  centered:     { flex: 1, backgroundColor: COLORS.dark, justifyContent: 'center', alignItems: 'center' },
  loadingText:  { color: COLORS.sub, marginTop: 12 },
  pageTitle:    { color: COLORS.text, fontSize: 28, fontWeight: 'bold', padding: 24, paddingTop: 60, paddingBottom: 4 },
  pageSub:      { color: COLORS.sub, fontSize: 13, paddingHorizontal: 24, marginBottom: 8 },
  card:         { margin: 16, padding: 20, backgroundColor: COLORS.card, borderRadius: 20 },
  cardTitle:    { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  cardSub:      { color: COLORS.sub, marginBottom: 16, lineHeight: 20 },
  input: {
    backgroundColor: '#0d1117', color: COLORS.text, padding: 14,
    borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 12, fontSize: 14,
  },
  btn:          { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnDisabled:  { opacity: 0.6 },
  btnText:      { color: '#000', fontWeight: 'bold', fontSize: 16 },
  hint:         { color: COLORS.sub, fontSize: 12, textAlign: 'center', marginTop: 10 },

  walletAddr:   { color: COLORS.sub, fontSize: 12, marginBottom: 16, fontFamily: 'monospace' },
  balanceRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  balanceBlock: { alignItems: 'flex-start', flex: 1 },
  balanceLabel: { color: COLORS.sub, fontSize: 12, marginBottom: 4 },
  balanceBig:   { color: COLORS.primary, fontSize: 32, fontWeight: 'bold' },
  balanceMed:   { color: COLORS.text, fontSize: 24, fontWeight: 'bold' },
  balanceTicker:{ color: COLORS.sub, fontSize: 12 },

  nftBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a2a1a',
    padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.gold,
  },
  nftIcon:  { fontSize: 30, marginRight: 12 },
  nftTitle: { color: COLORS.gold, fontWeight: 'bold', fontSize: 16 },
  nftSub:   { color: COLORS.sub, fontSize: 12, marginTop: 2 },

  rewardsRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rewardsValue:  { color: COLORS.green, fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  claimBtn:      { backgroundColor: COLORS.green, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  claimBtnDisabled: { backgroundColor: '#333' },
  claimBtnText:  { color: '#fff', fontWeight: 'bold' },
  link:          { color: COLORS.purple, fontSize: 13, marginTop: 8 },

  statsRow:  { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  statItem:  { alignItems: 'center' },
  statValue: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: COLORS.sub, fontSize: 11, marginTop: 2 },

  lbRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  lbRank:   { width: 40, color: COLORS.sub, fontSize: 14 },
  lbName:   { flex: 1, color: COLORS.text, fontWeight: '500' },
  lbAmount: { color: COLORS.primary, fontWeight: 'bold' },
  myRank:   { color: COLORS.sub, textAlign: 'center', marginTop: 12, fontSize: 13 },
  emptyText:{ color: COLORS.sub, textAlign: 'center', padding: 16 },

  eduCard:  { backgroundColor: '#0d1117', padding: 16, borderRadius: 12 },
  eduTitle: { color: COLORS.text, fontWeight: 'bold', marginBottom: 8 },
  eduText:  { color: COLORS.sub, lineHeight: 20, marginBottom: 8 },
});
