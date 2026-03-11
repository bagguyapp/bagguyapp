import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Linking, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#FFD700', dark: '#1a1a2e', card: '#16213e',
  text: '#fff', sub: '#aaa', green: '#4CAF50',
  silver: '#C0C0C0', gold: '#FFD700', purple: '#CE93D8',
};

const TIERS = [
  {
    id: 'free',
    label: 'Bag Guy Member',
    price: 'Free',
    stars: '1× Stars',
    icon: '🛍️',
    color: '#888',
    border: '#333',
    perks: ['Basic coupon stacking', 'Savings Stars rewards', 'Grocery lists', 'Barcode scanner'],
  },
  {
    id: 'silver',
    label: 'VIP Silver',
    price: '$9.99/mo',
    stars: '2× Stars',
    icon: '🥈',
    color: COLORS.silver,
    border: COLORS.silver,
    perks: ['2× Savings Stars on every scan', 'Advanced coupon stacking', 'Priority support', 'Weekly deal alerts'],
    priceId: 'silver',
  },
  {
    id: 'gold',
    label: 'VIP Gold',
    price: '$19.99/mo',
    stars: '3× Stars',
    icon: '🥇',
    color: COLORS.gold,
    border: COLORS.gold,
    perks: ['3× Savings Stars', 'All Silver perks', 'Family sharing (up to 4)', 'Exclusive Gold coupons', 'BGT token bonus'],
    priceId: 'gold',
  },
  {
    id: 'platinum',
    label: 'VIP Platinum Elite',
    price: '$39.99/mo',
    stars: '5× Stars',
    icon: '💎',
    color: COLORS.purple,
    border: '#9C27B0',
    perks: ['5× Savings Stars', 'All Gold perks', 'Unlimited family sharing', 'Concierge shopping assistant', 'Early access to new features', 'BGT airdrop priority'],
    priceId: 'platinum',
  },
];

export default function SubscriptionScreen({ navigation }) {
  const { user, tierLabel } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  const handleUpgrade = (tier) => {
    if (tier.id === 'free' || tier.id === user?.tier) return;

    Alert.alert(
      `Upgrade to ${tier.label}?`,
      `${tier.price} — ${tier.stars} Savings Stars\n\nTo subscribe, tap Continue and complete payment on our secure page.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue →',
          onPress: () => {
            // Open payment link — replace with your actual payment URL (LemonSqueezy, PayPal, etc.)
            const paymentUrl = `https://bagguyapp.com/subscribe?plan=${tier.id}&email=${encodeURIComponent(user?.email || '')}`;
            Linking.openURL(paymentUrl).catch(() => {
              Alert.alert(
                'Payment',
                `To subscribe to ${tier.label} (${tier.price}/mo), please email us:\n\nsubscriptions@bagguyapp.com\n\nInclude: your email + plan name and we\'ll activate it within 24 hours.`,
                [
                  { text: 'Email Us', onPress: () => Linking.openURL(`mailto:subscriptions@bagguyapp.com?subject=Subscribe%20to%20${tier.label}&body=Hi!%20I'd%20like%20to%20subscribe%20to%20${tier.label}.%20My%20email%20is%20${user?.email || ''}`) },
                  { text: 'OK' },
                ]
              );
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {navigation.canGoBack && navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.pageTitle}>🏆 Choose Your Plan</Text>
        <Text style={styles.subtitle}>Upgrade to earn more Savings Stars and unlock premium features</Text>
      </View>

      {/* Current tier badge */}
      <View style={styles.currentBadge}>
        <Text style={styles.currentText}>
          Current plan: <Text style={{ color: COLORS.primary }}>{tierLabel[user?.tier || 'free']}</Text>
        </Text>
      </View>

      {/* Tiers */}
      {TIERS.map((tier) => {
        const isCurrent = user?.tier === tier.id;
        return (
          <TouchableOpacity
            key={tier.id}
            style={[styles.tierCard, { borderColor: tier.border }, isCurrent && styles.currentTier]}
            onPress={() => !isCurrent && tier.id !== 'free' && handleUpgrade(tier)}
            activeOpacity={isCurrent || tier.id === 'free' ? 1 : 0.85}
          >
            {isCurrent && (
              <View style={styles.currentPill}>
                <Text style={styles.currentPillText}>CURRENT</Text>
              </View>
            )}
            <View style={styles.tierHeader}>
              <Text style={styles.tierIcon}>{tier.icon}</Text>
              <View style={styles.tierInfo}>
                <Text style={[styles.tierName, { color: tier.color }]}>{tier.label}</Text>
                <Text style={styles.tierPrice}>{tier.price}</Text>
              </View>
              <Text style={[styles.tierStars, { color: tier.color }]}>{tier.stars}</Text>
            </View>

            <View style={styles.perks}>
              {tier.perks.map((perk, i) => (
                <View key={i} style={styles.perkRow}>
                  <Text style={styles.perkCheck}>✓</Text>
                  <Text style={styles.perkText}>{perk}</Text>
                </View>
              ))}
            </View>

            {!isCurrent && tier.id !== 'free' && (
              <View style={[styles.upgradeBtn, { backgroundColor: tier.color }]}>
                <Text style={styles.upgradeBtnText}>Get {tier.label} — {tier.price}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* Payment info */}
      <View style={styles.paymentCard}>
        <Text style={styles.paymentTitle}>💳 Secure Payment</Text>
        <Text style={styles.paymentText}>
          Pay with any credit or debit card. Subscriptions can be cancelled any time.
          Need help? Email{' '}
          <Text
            style={{ color: COLORS.primary }}
            onPress={() => Linking.openURL('mailto:subscriptions@bagguyapp.com')}
          >
            subscriptions@bagguyapp.com
          </Text>
        </Text>
      </View>

      {/* FAQ */}
      <View style={styles.faqCard}>
        <Text style={styles.faqTitle}>❓ FAQ</Text>
        <Text style={styles.faqQ}>Can I cancel anytime?</Text>
        <Text style={styles.faqA}>Yes — cancel before your next billing date and you won't be charged again.</Text>
        <Text style={styles.faqQ}>Do Stars roll over?</Text>
        <Text style={styles.faqA}>Yes! Your Stars never expire. Redeem them for cash back whenever you want.</Text>
        <Text style={styles.faqQ}>What's the difference between plans?</Text>
        <Text style={styles.faqA}>Each tier multiplies how fast you earn Stars on every scan. Gold and Platinum also add family sharing and bonus BGT tokens.</Text>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: COLORS.card },
  backBtn: { marginBottom: 8 },
  backText: { color: COLORS.primary, fontSize: 16 },
  pageTitle: { color: COLORS.text, fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: COLORS.sub, marginTop: 6, lineHeight: 20 },
  currentBadge: { marginHorizontal: 16, marginTop: 12, marginBottom: 4, padding: 12, backgroundColor: COLORS.card, borderRadius: 10 },
  currentText: { color: COLORS.sub, textAlign: 'center' },
  tierCard: { margin: 16, marginBottom: 8, padding: 20, backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1.5 },
  currentTier: { backgroundColor: '#111827' },
  currentPill: { position: 'absolute', top: 12, right: 12, backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  currentPillText: { color: COLORS.dark, fontSize: 10, fontWeight: 'bold' },
  tierHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  tierIcon: { fontSize: 32, marginRight: 12 },
  tierInfo: { flex: 1 },
  tierName: { fontSize: 20, fontWeight: 'bold' },
  tierPrice: { color: COLORS.sub, marginTop: 2 },
  tierStars: { fontWeight: 'bold', fontSize: 15 },
  perks: { marginBottom: 16 },
  perkRow: { flexDirection: 'row', marginBottom: 6 },
  perkCheck: { color: COLORS.green, marginRight: 8, fontWeight: 'bold' },
  perkText: { color: COLORS.sub, flex: 1 },
  upgradeBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  upgradeBtnText: { color: COLORS.dark, fontWeight: 'bold', fontSize: 16 },
  paymentCard: { margin: 16, padding: 16, backgroundColor: COLORS.card, borderRadius: 12 },
  paymentTitle: { color: COLORS.text, fontWeight: 'bold', marginBottom: 8 },
  paymentText: { color: COLORS.sub, lineHeight: 22 },
  faqCard: { margin: 16, padding: 16, backgroundColor: COLORS.card, borderRadius: 12, marginBottom: 8 },
  faqTitle: { color: COLORS.text, fontWeight: 'bold', fontSize: 16, marginBottom: 12 },
  faqQ: { color: COLORS.primary, fontWeight: '600', marginBottom: 4 },
  faqA: { color: COLORS.sub, lineHeight: 20, marginBottom: 12 },
});
