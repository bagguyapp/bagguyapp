import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { conciergeAPI } from '../services/api';

const COLORS = {
  primary: '#FFD700',
  dark: '#1a1a2e',
  card: '#16213e',
  cardAlt: '#0f3460',
  text: '#fff',
  sub: '#aaa',
  green: '#4CAF50',
  red: '#e74c3c',
  eco: '#27ae60',
};

export default function GroceryListScreen() {
  const [inputText, setInputText] = useState('');
  const [listItems, setListItems] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalSavings, setTotalSavings] = useState(null);
  const [tip, setTip] = useState('');

  const addItem = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    if (listItems.includes(trimmed.toLowerCase())) {
      Alert.alert('Already in list', `"${trimmed}" is already on your list.`);
      return;
    }
    setListItems(prev => [...prev, trimmed.toLowerCase()]);
    setInputText('');
    // Clear previous results when list changes
    setResults(null);
    setTotalSavings(null);
  }, [inputText, listItems]);

  const removeItem = useCallback((item) => {
    setListItems(prev => prev.filter(i => i !== item));
    setResults(null);
    setTotalSavings(null);
  }, []);

  const findDeals = useCallback(async () => {
    if (listItems.length === 0) {
      Alert.alert('Your list is empty', 'Add some grocery items first!');
      return;
    }
    setLoading(true);
    try {
      const response = await conciergeAPI.smartList(listItems);
      const data = response.data;
      setResults(data.list || []);
      setTotalSavings(data.totalEstimatedSavings || '$0.00');
      setTip(data.tip || '');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not fetch deals. Try again.');
    } finally {
      setLoading(false);
    }
  }, [listItems]);

  const clearAll = () => {
    Alert.alert('Clear List', 'Remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive',
        onPress: () => { setListItems([]); setResults(null); setTotalSavings(null); setTip(''); },
      },
    ]);
  };

  const renderCoupon = (coupon, idx) => (
    <View key={idx} style={styles.couponCard}>
      <View style={styles.couponRow}>
        <Text style={styles.couponDiscount}>{coupon.discount}</Text>
        {coupon.stackable && <Text style={styles.stackBadge}>⚡ Stackable</Text>}
        {coupon.ecoScore === 'A' && <Text style={styles.ecoBadge}>🌿 Eco A</Text>}
      </View>
      <Text style={styles.couponName}>{coupon.productName}</Text>
      <Text style={styles.couponSource}>
        {coupon.source === 'bagguy' ? '🛍️ Bag Guy Perk' : coupon.source === 'manufacturer' ? '🏭 Manufacturer' : '🏪 Store Deal'}
        {coupon.ecoBonus > 0 ? `  •  +${coupon.ecoBonus} eco stars` : ''}
      </Text>
    </View>
  );

  const renderResultItem = ({ item }) => {
    const hasCoupons = item.couponCount > 0;
    return (
      <View style={[styles.resultCard, hasCoupons ? styles.resultCardMatch : styles.resultCardNoMatch]}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultItemName}>
            {hasCoupons ? '✅' : '❌'} {item.item.charAt(0).toUpperCase() + item.item.slice(1)}
          </Text>
          {hasCoupons && (
            <Text style={styles.resultSavings}>{item.estimatedSavings}</Text>
          )}
        </View>

        {hasCoupons ? (
          <>
            <Text style={styles.resultCouponCount}>
              {item.couponCount} coupon{item.couponCount !== 1 ? 's' : ''} found
            </Text>
            {item.matchedCoupons.map((c, i) => renderCoupon(c, i))}
          </>
        ) : (
          <Text style={styles.noCouponText}>No coupons found — scan in-store for hidden deals!</Text>
        )}
      </View>
    );
  };

  const renderListItem = ({ item }) => (
    <View style={styles.listItemRow}>
      <Text style={styles.listItemText}>• {item}</Text>
      <TouchableOpacity onPress={() => removeItem(item)} style={styles.removeBtn}>
        <Text style={styles.removeBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🛒 Smart Grocery List</Text>
        <Text style={styles.subtitle}>Add items to find coupons & estimate savings</Text>
      </View>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add item (e.g. tide, cheerios, milk)"
          placeholderTextColor={COLORS.sub}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={addItem}
          returnKeyType="done"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addItem}>
          <Text style={styles.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Current list */}
        {listItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your List ({listItems.length})</Text>
              <TouchableOpacity onPress={clearAll}>
                <Text style={styles.clearText}>Clear all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={listItems}
              keyExtractor={(item) => item}
              renderItem={renderListItem}
              scrollEnabled={false}
            />

            {/* Find Deals Button */}
            <TouchableOpacity
              style={[styles.findDealsBtn, loading && styles.findDealsBtnDisabled]}
              onPress={findDeals}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.dark} />
              ) : (
                <Text style={styles.findDealsBtnText}>🔍 Find Coupons & Savings</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Empty state */}
        {listItems.length === 0 && !results && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyTitle}>Your list is empty</Text>
            <Text style={styles.emptyText}>
              Type a grocery item above and tap ＋ to add it.{'\n'}
              We'll find matching coupons instantly.
            </Text>
            <View style={styles.examplesCard}>
              <Text style={styles.examplesTitle}>Try adding:</Text>
              {['tide detergent', 'cheerios', 'coca-cola', 'pizza', 'greek yogurt'].map(ex => (
                <TouchableOpacity key={ex} onPress={() => { setListItems(p => [...p, ex]); }}>
                  <Text style={styles.exampleItem}>+ {ex}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Results */}
        {results && (
          <View style={styles.section}>
            {/* Savings Banner */}
            <View style={styles.savingsBanner}>
              <Text style={styles.savingsBannerLabel}>Estimated Savings</Text>
              <Text style={styles.savingsBannerValue}>{totalSavings}</Text>
              <Text style={styles.savingsBannerSub}>
                {results.filter(r => r.couponCount > 0).length} of {results.length} items have coupons
              </Text>
            </View>

            {tip ? (
              <View style={styles.tipCard}>
                <Text style={styles.tipText}>💡 {tip}</Text>
              </View>
            ) : null}

            <Text style={styles.sectionTitle}>Matched Deals</Text>
            <FlatList
              data={results}
              keyExtractor={(item) => item.item}
              renderItem={renderResultItem}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: COLORS.card },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: 13, color: COLORS.sub, marginTop: 4 },
  inputRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: '#333',
  },
  input: {
    flex: 1, backgroundColor: '#0f3460', color: COLORS.text, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginRight: 10,
  },
  addBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10, width: 44, height: 44,
    justifyContent: 'center', alignItems: 'center',
  },
  addBtnText: { fontSize: 24, color: COLORS.dark, fontWeight: 'bold', lineHeight: 28 },
  scroll: { flex: 1 },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
  clearText: { color: COLORS.red, fontSize: 13 },
  listItemRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 6,
  },
  listItemText: { color: COLORS.text, fontSize: 14, flex: 1 },
  removeBtn: { padding: 4 },
  removeBtnText: { color: COLORS.sub, fontSize: 14 },
  findDealsBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 12,
  },
  findDealsBtnDisabled: { opacity: 0.6 },
  findDealsBtnText: { color: COLORS.dark, fontSize: 16, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', paddingTop: 50, paddingHorizontal: 30 },
  emptyEmoji: { fontSize: 60, marginBottom: 12 },
  emptyTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: COLORS.sub, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  examplesCard: { marginTop: 20, backgroundColor: COLORS.card, borderRadius: 12, padding: 16, width: '100%' },
  examplesTitle: { color: COLORS.primary, fontSize: 13, marginBottom: 8 },
  exampleItem: { color: COLORS.text, fontSize: 15, paddingVertical: 5 },
  savingsBanner: {
    backgroundColor: COLORS.green, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12,
  },
  savingsBannerLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  savingsBannerValue: { color: '#fff', fontSize: 34, fontWeight: 'bold', marginVertical: 4 },
  savingsBannerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  tipCard: {
    backgroundColor: COLORS.cardAlt, borderRadius: 10, padding: 12, marginBottom: 12,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  tipText: { color: COLORS.sub, fontSize: 13, lineHeight: 18 },
  resultCard: { borderRadius: 10, padding: 14, marginBottom: 10 },
  resultCardMatch: { backgroundColor: '#0d2a1a', borderWidth: 1, borderColor: COLORS.green },
  resultCardNoMatch: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: '#333' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  resultItemName: { color: COLORS.text, fontSize: 15, fontWeight: '600', flex: 1 },
  resultSavings: { color: COLORS.green, fontSize: 16, fontWeight: 'bold' },
  resultCouponCount: { color: COLORS.sub, fontSize: 12, marginBottom: 8 },
  noCouponText: { color: COLORS.sub, fontSize: 13, fontStyle: 'italic' },
  couponCard: { backgroundColor: '#1a2a3a', borderRadius: 8, padding: 10, marginBottom: 6 },
  couponRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  couponDiscount: { color: COLORS.primary, fontSize: 14, fontWeight: 'bold', marginRight: 8 },
  stackBadge: {
    backgroundColor: '#2c3e50', color: '#a0c4ff', fontSize: 10, paddingHorizontal: 6,
    paddingVertical: 2, borderRadius: 4, marginRight: 4,
  },
  ecoBadge: {
    backgroundColor: '#1a3a1a', color: COLORS.eco, fontSize: 10, paddingHorizontal: 6,
    paddingVertical: 2, borderRadius: 4,
  },
  couponName: { color: COLORS.text, fontSize: 12 },
  couponSource: { color: COLORS.sub, fontSize: 11, marginTop: 2 },
});
