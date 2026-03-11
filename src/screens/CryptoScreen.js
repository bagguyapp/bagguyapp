import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, Alert, Linking, ActivityIndicator, RefreshControl,
} from 'react-native';
import { blockchainAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  dark: '#1a1a2e', card: '#16213e', primary: '#FFD700',
  text: '#fff', sub: '#aaa', green: '#4CAF50',
  purple: '#7986CB', red: '#F44336', gold: '#FFD700',
  sol: '#9945FF',
};

const BGT_SOLANA_MINT  = '5EguQYitVgoC2ZdSbZFXRvNk9JhTkacN2fXDPQgBKE1W';
const BGT_POLYGON_ADDR = '0x9f5009bc4268D1BD7315d3eF74058fbDeb88E56F';
const NFT_POLYGON_ADDR = '0x897d020fd39AFaB13dadA3a9524Fc6231DBaA8B4';
const JUPITER_SWAP_URL = `https://jup.ag/swap/SOL-${BGT_SOLANA_MINT}`;
const RAYDIUM_POOL_URL = 'https://raydium.io/liquidity/increase/?mode=add&pool_id=7yX6uP3vgFcFFn9onayhirn7Qvhb3Js8LiEHogjDnYnY';
const SOLSCAN_URL      = `https://solscan.io/token/${BGT_SOLANA_MINT}`;

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

export default function CryptoScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [walletInput, setWalletInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [activeTab, setActiveTab] = useState('solana'); // 'solana' | 'polygon'

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
            Alert.alert('✅ Claimed!', `${res.data.claimedFormatted} BGT\n\n${res.data.message}`);
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
      {/* Header */}
      <View style={styles.headerRow}>
        {navigation.canGoBack && navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.pageTitle}>🔗 Crypto</Text>
          <Text style={styles.pageSub}>BGT Token — Live on Solana + Polygon</Text>
        </View>
      </View>

      {/* ── SOLANA BGT CARD (PRIMARY) ─────────────────────────────────── */}
      <View style={[styles.card, styles.solanaCard]}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>🟣 BGT on Solana</Text>
          <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>LIVE</Text></View>
        </View>
        <Text style={styles.cardSub}>
          Bag Guy Token is live and tradeable on Solana. Buy, sell, or add liquidity on Jupiter and Raydium.
        </Text>

        {/* Token info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Mint Address</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{BGT_SOLANA_MINT}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Total Supply</Text>
          <Text style={styles.infoValue}>1,000,000,000 BGT</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Network</Text>
          <Text style={styles.infoValue}>Solana Mainnet</Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={[styles.ctaBtn, styles.ctaBtnPrimary]}
            onPress={() => Linking.openURL(JUPITER_SWAP_URL)}
          >
            <Text style={styles.ctaBtnTextDark}>🪐 Buy on Jupiter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ctaBtn, styles.ctaBtnOutline]}
            onPress={() => Linking.openURL(RAYDIUM_POOL_URL)}
          >
            <Text style={styles.ctaBtnTextLight}>💧 Add Liquidity</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => Linking.openURL(SOLSCAN_URL)}>
          <Text style={styles.link}>View on Solscan ↗</Text>
        </TouchableOpacity>
      </View>

      {/* ── POLYGON WALLET (SECONDARY) ───────────────────────────────── */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'polygon' && styles.tabBtnActive]}
          onPress={() => setActiveTab('polygon')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'polygon' && styles.tabBtnTextActive]}>
            Earn BGT Rewards
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'leaderboard' && styles.tabBtnActive]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'leaderboard' && styles.tabBtnTextActive]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
      </View>

      {/* POLYGON REWARDS TAB */}
      {activeTab === 'polygon' && (
        <>
          {!isConnected ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🦊 Connect for BGT Rewards</Text>
              <Text style={styles.cardSub}>
                Connect your Polygon wallet to earn BGT tokens on every grocery scan. Tokens accumulate
                automatically — claim them anytime.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0x… Polygon wallet address"
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
                Works with MetaMask, Trust Wallet, or any Polygon-compatible wallet
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💼 My Portfolio</Text>
              <Text style={styles.walletAddr} numberOfLines={1}>{portfolio.walletAddress}</Text>

              <View style={styles.balanceRow}>
                <View style={styles.balanceBlock}>
                  <Text style={styles.balanceLabel}>BGT Balance</Text>
                  <AnimatedNumber value={portfolio.bgtBalance} decimals={4} style={styles.balanceBig} />
                  <Text style={styles.balanceTicker}>BGT (Polygon)</Text>
                </View>
                <View style={styles.balanceBlock}>
                  <Text style={styles.balanceLabel}>MATIC</Text>
                  <AnimatedNumber value={portfolio.maticBalance} decimals={4} style={styles.balanceMed} />
                  <Text style={styles.balanceTicker}>MATIC</Text>
                </View>
              </View>

              {portfolio.hasBagGuyNFT && (
                <View style={styles.nftBadge}>
                  <Text style={styles.nftIcon}>🏆</Text>
                  <View>
                    <Text style={styles.nftTitle}>BagGuyNFT Holder</Text>
                    <Text style={styles.nftSub}>Token #{portfolio.nftTokenId} · Gold Tier Active</Text>
                  </View>
                </View>
              )}

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

              <TouchableOpacity onPress={() => Linking.openURL(portfolio.polygonScanUrl)}>
                <Text style={styles.link}>View on PolygonScan ↗</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Learn section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📚 About BGT</Text>
            <View style={styles.eduCard}>
              <Text style={styles.eduTitle}>🪙 How BGT Rewards Work</Text>
              <Text style={styles.eduText}>
                Scan any grocery barcode → earn BGT automatically. Connect your Polygon wallet
                above to track your balance. Claim to your wallet anytime.
              </Text>
              <TouchableOpacity onPress={() => Linking.openURL(`https://polygonscan.com/address/${BGT_POLYGON_ADDR}`)}>
                <Text style={styles.link}>BGT on PolygonScan ↗</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.eduCard, { marginTop: 12 }]}>
              <Text style={styles.eduTitle}>🏆 BagGuyNFT</Text>
              <Text style={styles.eduText}>
                Hold a BagGuyNFT for automatic Gold tier membership and boosted BGT rewards.
              </Text>
              <TouchableOpacity onPress={() => Linking.openURL(`https://polygonscan.com/address/${NFT_POLYGON_ADDR}`)}>
                <Text style={styles.link}>BagGuyNFT on PolygonScan ↗</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* LEADERBOARD TAB */}
      {activeTab === 'leaderboard' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 BGT Leaderboard</Text>

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
            <View style={styles.emptyLb}>
              <Text style={styles.emptyLbTitle}>No earners yet!</Text>
              <Text style={styles.emptyLbSub}>Connect your wallet and start scanning to top the chart.</Text>
            </View>
          )}

          {myRank > 0 && (
            <Text style={styles.myRank}>Your rank: #{myRank}</Text>
          )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.dark },
  centered:     { flex: 1, backgroundColor: COLORS.dark, justifyContent: 'center', alignItems: 'center' },
  loadingText:  { color: COLORS.sub, marginTop: 12 },
  headerRow:    { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 8 },
  backBtn:      { marginRight: 12, padding: 4 },
  backText:     { color: COLORS.primary, fontSize: 28, lineHeight: 32 },
  pageTitle:    { color: COLORS.text, fontSize: 26, fontWeight: 'bold' },
  pageSub:      { color: COLORS.sub, fontSize: 13, marginTop: 2 },
  card:         { margin: 16, marginBottom: 0, padding: 20, backgroundColor: COLORS.card, borderRadius: 20 },
  solanaCard:   { borderWidth: 1.5, borderColor: COLORS.sol },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardTitle:    { color: COLORS.text, fontSize: 18, fontWeight: 'bold', flex: 1 },
  liveBadge:    { backgroundColor: COLORS.green, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  liveBadgeText:{ color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cardSub:      { color: COLORS.sub, marginBottom: 14, lineHeight: 20, fontSize: 13 },
  infoBox:      { backgroundColor: '#0d1117', borderRadius: 8, padding: 10, marginBottom: 8 },
  infoLabel:    { color: COLORS.sub, fontSize: 11, marginBottom: 2 },
  infoValue:    { color: COLORS.text, fontSize: 13, fontFamily: 'monospace' },
  ctaRow:       { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 10 },
  ctaBtn:       { flex: 1, padding: 13, borderRadius: 11, alignItems: 'center' },
  ctaBtnPrimary:{ backgroundColor: COLORS.primary },
  ctaBtnOutline:{ backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.sol },
  ctaBtnTextDark: { color: COLORS.dark, fontWeight: 'bold', fontSize: 13 },
  ctaBtnTextLight:{ color: COLORS.sol, fontWeight: 'bold', fontSize: 13 },
  tabRow:       { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, backgroundColor: COLORS.card, borderRadius: 12, padding: 4 },
  tabBtn:       { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabBtnText:   { color: COLORS.sub, fontWeight: '600', fontSize: 13 },
  tabBtnTextActive: { color: COLORS.dark, fontWeight: 'bold' },
  input:        { backgroundColor: '#0d1117', color: COLORS.text, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 12, fontSize: 14 },
  btn:          { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnDisabled:  { opacity: 0.6 },
  btnText:      { color: '#000', fontWeight: 'bold', fontSize: 16 },
  hint:         { color: COLORS.sub, fontSize: 12, textAlign: 'center', marginTop: 10 },
  walletAddr:   { color: COLORS.sub, fontSize: 12, marginBottom: 16, fontFamily: 'monospace' },
  balanceRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  balanceBlock: { alignItems: 'flex-start', flex: 1 },
  balanceLabel: { color: COLORS.sub, fontSize: 12, marginBottom: 4 },
  balanceBig:   { color: COLORS.primary, fontSize: 30, fontWeight: 'bold' },
  balanceMed:   { color: COLORS.text, fontSize: 22, fontWeight: 'bold' },
  balanceTicker:{ color: COLORS.sub, fontSize: 12 },
  nftBadge:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a2a1a', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.gold },
  nftIcon:      { fontSize: 30, marginRight: 12 },
  nftTitle:     { color: COLORS.gold, fontWeight: 'bold', fontSize: 16 },
  nftSub:       { color: COLORS.sub, fontSize: 12, marginTop: 2 },
  rewardsRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rewardsValue: { color: COLORS.green, fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  claimBtn:     { backgroundColor: COLORS.green, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  claimBtnDisabled: { backgroundColor: '#333' },
  claimBtnText: { color: '#fff', fontWeight: 'bold' },
  link:         { color: COLORS.purple, fontSize: 13, marginTop: 8 },
  statsRow:     { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  statItem:     { alignItems: 'center' },
  statValue:    { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
  statLabel:    { color: COLORS.sub, fontSize: 11, marginTop: 2 },
  lbRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  lbRank:       { width: 40, color: COLORS.sub, fontSize: 14 },
  lbName:       { flex: 1, color: COLORS.text, fontWeight: '500' },
  lbAmount:     { color: COLORS.primary, fontWeight: 'bold' },
  myRank:       { color: COLORS.sub, textAlign: 'center', marginTop: 12, fontSize: 13 },
  emptyLb:      { alignItems: 'center', padding: 20 },
  emptyLbTitle: { color: COLORS.text, fontWeight: 'bold', fontSize: 16 },
  emptyLbSub:   { color: COLORS.sub, textAlign: 'center', marginTop: 8, fontSize: 13 },
  eduCard:      { backgroundColor: '#0d1117', padding: 16, borderRadius: 12 },
  eduTitle:     { color: COLORS.text, fontWeight: 'bold', marginBottom: 8 },
  eduText:      { color: COLORS.sub, lineHeight: 20, marginBottom: 8 },
});
