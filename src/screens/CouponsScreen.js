import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { scanAPI, rewardsAPI } from '../services/api';

const COLORS = {
  primary: '#FFD700', dark: '#1a1a2e', card: '#16213e',
  text: '#fff', sub: '#aaa', green: '#4CAF50', red: '#e74c3c',
};

const CATEGORIES = [
  { label: 'Dairy', emoji: '🥛', items: ['milk', 'cheese', 'yogurt', 'butter'] },
  { label: 'Beverages', emoji: '🥤', items: ['coca-cola', 'pepsi', 'juice', 'water'] },
  { label: 'Breakfast', emoji: '🥣', items: ['cheerios', 'oatmeal', 'granola', 'eggs'] },
  { label: 'Cleaning', emoji: '🧹', items: ['tide', 'dawn', 'lysol', 'bounty'] },
  { label: 'Snacks', emoji: '🍿', items: ['chips', 'cookies', 'crackers', 'nuts'] },
  { label: 'Frozen', emoji: '🧊', items: ['pizza', 'ice cream', 'waffles', 'veggies'] },
  { label: 'Produce', emoji: '🥦', items: ['apples', 'bananas', 'spinach', 'carrots'] },
  { label: 'Baby', emoji: '👶', items: ['pampers', 'huggies', 'formula', 'wipes'] },
];

const FEATURED = [
  { title: '$2.00 OFF', desc: 'Any Tide Detergent 46oz+', source: '🏭 Manufacturer', expires: 'Mar 31' },
  { title: 'BOGO', desc: 'Cheerios any variety', source: '🏪 Store Deal', expires: 'Mar 25' },
  { title: '$1.50 OFF', desc: 'Coca-Cola 12-pack', source: '🛍️ Bag Guy Perk', expires: 'Mar 28' },
  { title: '25% OFF', desc: 'Store Brand Dairy', source: '🏪 Store Deal', expires: 'Apr 5' },
  { title: '$3.00 OFF', desc: 'Pampers any pack 60ct+', source: '🏭 Manufacturer', expires: 'Mar 30' },
  { title: 'FREE', desc: 'LaCroix Sparkling Water (wyb 2)', source: '🛍️ Bag Guy Perk', expires: 'Mar 22' },
];

export default function CouponsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query) => {
    const q = (query || search).trim();
    if (!q) return;
    setSearching(true);
    setSearchResults(null);
    try {
      // Use the barcode scan API by searching a known barcode for the item
      // For text searches, we show a mock result based on category matching
      await new Promise(r => setTimeout(r, 600)); // simulate
      const matchedCat = CATEGORIES.find(c =>
        c.items.some(item => item.includes(q.toLowerCase())) ||
        c.label.toLowerCase().includes(q.toLowerCase())
      );
      const mockResults = matchedCat
        ? matchedCat.items.slice(0, 3).map(item => ({
            title: `$${(Math.random() * 2 + 0.5).toFixed(2)} OFF`,
            desc: `${item.charAt(0).toUpperCase() + item.slice(1)} — any brand`,
            source: Math.random() > 0.5 ? '🏭 Manufacturer' : '🏪 Store Deal',
            expires: 'Apr 15',
          }))
        : [];
      setSearchResults({ query: q, coupons: mockResults });
    } catch (e) {
      Alert.alert('Search failed', 'Try scanning a barcode directly for the best results.');
    } finally {
      setSearching(false);
    }
  };

  const handleCategoryPress = (cat) => {
    setSearch(cat.label);
    handleSearch(cat.label);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏷️ Coupons</Text>
        <Text style={styles.subtitle}>Browse deals or scan a barcode for instant savings</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search coupons (e.g. tide, cheerios)..."
          placeholderTextColor={COLORS.sub}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {searching
          ? <ActivityIndicator color={COLORS.primary} style={{ padding: 12 }} />
          : (
            <TouchableOpacity style={styles.searchBtn} onPress={() => handleSearch()}>
              <Text style={styles.searchBtnText}>🔍</Text>
            </TouchableOpacity>
          )
        }
      </View>

      {/* Search Results */}
      {searchResults && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Results for "{searchResults.query}"</Text>
          {searchResults.coupons.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No coupons found for "{searchResults.query}"</Text>
              <Text style={styles.noResultsSub}>Try scanning the item's barcode for hidden deals!</Text>
              <TouchableOpacity style={styles.scanBtn} onPress={() => navigation.navigate('Scan')}>
                <Text style={styles.scanBtnText}>📷 Scan Barcode</Text>
              </TouchableOpacity>
            </View>
          ) : (
            searchResults.coupons.map((c, i) => (
              <View key={i} style={styles.couponCard}>
                <Text style={styles.couponDiscount}>{c.title}</Text>
                <Text style={styles.couponDesc}>{c.desc}</Text>
                <View style={styles.couponMeta}>
                  <Text style={styles.couponSource}>{c.source}</Text>
                  <Text style={styles.couponExpiry}>Expires {c.expires}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Featured Coupons */}
      {!searchResults && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Featured This Week</Text>
            {FEATURED.map((c, i) => (
              <View key={i} style={styles.couponCard}>
                <Text style={styles.couponDiscount}>{c.title}</Text>
                <Text style={styles.couponDesc}>{c.desc}</Text>
                <View style={styles.couponMeta}>
                  <Text style={styles.couponSource}>{c.source}</Text>
                  <Text style={styles.couponExpiry}>Expires {c.expires}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🗂️ Browse by Category</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map((cat, i) => (
                <TouchableOpacity key={i} style={styles.catCard} onPress={() => handleCategoryPress(cat)}>
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}

      {/* Scan CTA */}
      <TouchableOpacity style={styles.scanCTA} onPress={() => navigation.navigate('Scan')}>
        <Text style={styles.scanCTAIcon}>📷</Text>
        <View>
          <Text style={styles.scanCTATitle}>Scan for instant savings</Text>
          <Text style={styles.scanCTASub}>Point at any barcode to stack coupons automatically</Text>
        </View>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: COLORS.card },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: 13, color: COLORS.sub, marginTop: 4 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', margin: 16,
    backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#333',
  },
  searchInput: { flex: 1, color: COLORS.text, paddingVertical: 14, fontSize: 15 },
  searchBtn: { padding: 10 },
  searchBtnText: { fontSize: 20 },
  section: { marginHorizontal: 16, marginBottom: 8 },
  sectionTitle: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  couponCard: {
    backgroundColor: COLORS.card, borderRadius: 12, padding: 14,
    marginBottom: 8, borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  couponDiscount: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
  couponDesc: { color: COLORS.text, fontSize: 14, marginTop: 2 },
  couponMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  couponSource: { color: COLORS.sub, fontSize: 12 },
  couponExpiry: { color: COLORS.sub, fontSize: 12 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  catCard: {
    width: '23%', backgroundColor: COLORS.card, borderRadius: 12,
    padding: 10, alignItems: 'center', marginBottom: 10,
  },
  catEmoji: { fontSize: 28 },
  catLabel: { color: COLORS.text, fontSize: 11, marginTop: 6, textAlign: 'center' },
  noResults: { backgroundColor: COLORS.card, borderRadius: 12, padding: 20, alignItems: 'center' },
  noResultsText: { color: COLORS.text, fontWeight: 'bold', textAlign: 'center' },
  noResultsSub: { color: COLORS.sub, marginTop: 8, textAlign: 'center', fontSize: 13 },
  scanBtn: { marginTop: 12, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  scanBtnText: { color: COLORS.dark, fontWeight: 'bold' },
  scanCTA: {
    flexDirection: 'row', alignItems: 'center', margin: 16,
    backgroundColor: '#1a3a1a', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.green,
  },
  scanCTAIcon: { fontSize: 32, marginRight: 14 },
  scanCTATitle: { color: COLORS.green, fontWeight: 'bold', fontSize: 15 },
  scanCTASub: { color: COLORS.sub, fontSize: 12, marginTop: 2 },
});
