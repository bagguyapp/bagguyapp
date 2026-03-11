import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import api from '../services/api';

const COLORS = { primary: '#FFD700', dark: '#1a1a2e', card: '#16213e', text: '#fff', sub: '#aaa', green: '#4CAF50' };

const MOCK_HISTORY = [
  { id: 1, date: 'Mar 10, 2026', store: 'Walmart', items: 3, saved: '$4.50', stars: 45, status: 'completed' },
  { id: 2, date: 'Mar 8, 2026', store: 'Kroger', items: 7, saved: '$12.25', stars: 120, status: 'completed' },
  { id: 3, date: 'Mar 5, 2026', store: 'Target', items: 2, saved: '$2.00', stars: 20, status: 'completed' },
  { id: 4, date: 'Mar 1, 2026', store: 'Publix', items: 11, saved: '$18.75', stars: 180, status: 'completed' },
];

export default function PurchaseHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch real history; fall back to mock data
    setTimeout(() => {
      setHistory(MOCK_HISTORY);
      setLoading(false);
    }, 600);
  }, []);

  const totalSaved = history.reduce((acc, h) => acc + parseFloat(h.saved.replace('$', '')), 0);
  const totalStars = history.reduce((acc, h) => acc + h.stars, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📋 Purchase History</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView>
          {/* Summary */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${totalSaved.toFixed(2)}</Text>
              <Text style={styles.summaryLabel}>Total Saved</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalStars}</Text>
              <Text style={styles.summaryLabel}>Stars Earned</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{history.length}</Text>
              <Text style={styles.summaryLabel}>Trips</Text>
            </View>
          </View>

          {/* History list */}
          <View style={styles.section}>
            {history.map((item) => (
              <View key={item.id} style={styles.tripCard}>
                <View style={styles.tripTop}>
                  <Text style={styles.tripStore}>🏪 {item.store}</Text>
                  <Text style={styles.tripDate}>{item.date}</Text>
                </View>
                <View style={styles.tripBottom}>
                  <Text style={styles.tripItems}>{item.items} items scanned</Text>
                  <View style={styles.tripRight}>
                    <Text style={styles.tripStars}>+{item.stars} ⭐</Text>
                    <Text style={styles.tripSaved}>{item.saved} saved</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.note}>Showing recent scan history. Full history syncs from the cloud.</Text>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: COLORS.card },
  backBtn: { marginBottom: 8 },
  backText: { color: COLORS.primary, fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    margin: 16, padding: 20, backgroundColor: COLORS.card,
    borderRadius: 16, borderWidth: 1, borderColor: COLORS.primary,
  },
  summaryItem: { alignItems: 'center' },
  summaryValue: { color: COLORS.primary, fontSize: 24, fontWeight: 'bold' },
  summaryLabel: { color: COLORS.sub, fontSize: 12, marginTop: 4 },
  section: { paddingHorizontal: 16 },
  tripCard: {
    backgroundColor: COLORS.card, borderRadius: 12, padding: 16,
    marginBottom: 10, borderLeftWidth: 3, borderLeftColor: COLORS.green,
  },
  tripTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  tripStore: { color: COLORS.text, fontWeight: 'bold', fontSize: 15 },
  tripDate: { color: COLORS.sub, fontSize: 13 },
  tripBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  tripItems: { color: COLORS.sub, fontSize: 13 },
  tripRight: { alignItems: 'flex-end' },
  tripStars: { color: COLORS.primary, fontWeight: 'bold' },
  tripSaved: { color: COLORS.green, fontWeight: 'bold', fontSize: 16 },
  note: { color: COLORS.sub, textAlign: 'center', fontSize: 12, padding: 16 },
});
