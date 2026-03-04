import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { scanAPI, rewardsAPI } from '../services/api';

const COLORS = { primary: '#FFD700', dark: '#1a1a2e', card: '#16213e', text: '#fff', sub: '#aaa', green: '#4CAF50', red: '#f44336' };

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [basketItems, setBasketItems] = useState([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleBarCodeScanned = async ({ data: barcode }) => {
    if (scanned || scanning) return;
    setScanned(true);
    setScanning(true);

    try {
      const res = await scanAPI.scan(barcode);
      setResult(res.data);

      // Add to basket
      setBasketItems(prev => {
        const existing = prev.find(i => i.barcode === barcode);
        if (existing) return prev;
        return [...prev, res.data];
      });
      setTotalSaved(prev => prev + (res.data.totalSavingsCents || 0));

      // Award scan stars
      await rewardsAPI.earn('scan');

      // Fade in result
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } catch (e) {
      Alert.alert('Scan Error', 'Could not find coupons for this item. Try again.');
    } finally {
      setScanning(false);
    }
  };

  if (!permission) return <View style={styles.container}><Text style={styles.text}>Requesting camera...</Text></View>;
  if (!permission.granted) return (
    <View style={styles.container}>
      <Text style={styles.text}>Camera access needed to scan barcodes</Text>
      <TouchableOpacity style={styles.btn} onPress={requestPermission}>
        <Text style={styles.btnText}>Allow Camera</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ['ean13','ean8','upc_a','upc_e','code128','code39'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanBox} />
          <Text style={styles.scanHint}>{scanning ? '🔍 Finding coupons...' : 'Point at any barcode'}</Text>
        </View>
      </CameraView>

      {/* Live Basket */}
      {basketItems.length > 0 && (
        <View style={styles.basket}>
          <View style={styles.basketHeader}>
            <Text style={styles.basketTitle}>🛒 Live Basket ({basketItems.length} items)</Text>
            <Text style={styles.basketSaved}>Saved: ${(totalSaved / 100).toFixed(2)}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.basketItems}>
            {basketItems.map((item, i) => (
              <View key={i} style={styles.basketItem}>
                <Text style={styles.basketItemName} numberOfLines={1}>{item.product?.name || 'Item'}</Text>
                <Text style={styles.basketItemSaved}>-${(item.totalSavingsCents/100).toFixed(2)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Result Card */}
      {result && (
        <Animated.View style={[styles.resultCard, { opacity: fadeAnim }]}>
          <Text style={styles.productName}>{result.product?.name || 'Product Found'}</Text>
          {result.coupons?.map((c, i) => (
            <Text key={i} style={styles.couponRow}>✅ {c.description}</Text>
          ))}
          {result.bagGuyPerk && (
            <Text style={styles.bagGuyPerk}>🛍️ {result.bagGuyPerk.tier.toUpperCase()} perk: -${(result.bagGuyPerk.savingsCents/100).toFixed(2)}</Text>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalSaved}>Total Saved: {result.totalSavingsDisplay}</Text>
            <Text style={styles.starsEarned}>+{result.starsEarned} ⭐</Text>
          </View>
          {result.ecoScore && (
            <Text style={styles.ecoScore}>🌿 Eco Score: {result.ecoScore}</Text>
          )}
          <TouchableOpacity style={styles.scanAgainBtn} onPress={() => { setScanned(false); setResult(null); fadeAnim.setValue(0); }}>
            <Text style={styles.scanAgainText}>Scan Another Item</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  camera: { flex: 1, maxHeight: 340 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanBox: { width: 220, height: 220, borderWidth: 2, borderColor: COLORS.primary, borderRadius: 12, backgroundColor: 'transparent' },
  scanHint: { color: '#fff', marginTop: 16, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 },
  basket: { backgroundColor: COLORS.card, padding: 12, borderTopWidth: 1, borderColor: COLORS.primary },
  basketHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  basketTitle: { color: COLORS.text, fontWeight: 'bold' },
  basketSaved: { color: COLORS.green, fontWeight: 'bold' },
  basketItems: { flexDirection: 'row' },
  basketItem: { backgroundColor: '#333', padding: 8, borderRadius: 8, marginRight: 8, minWidth: 100 },
  basketItemName: { color: COLORS.text, fontSize: 12, maxWidth: 90 },
  basketItemSaved: { color: COLORS.green, fontWeight: 'bold', fontSize: 12 },
  resultCard: { margin: 16, padding: 20, backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.green },
  productName: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  couponRow: { color: COLORS.green, marginBottom: 6 },
  bagGuyPerk: { color: COLORS.primary, marginBottom: 6, fontWeight: 'bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#333' },
  totalSaved: { color: COLORS.green, fontSize: 18, fontWeight: 'bold' },
  starsEarned: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
  ecoScore: { color: '#81C784', marginTop: 8 },
  scanAgainBtn: { marginTop: 16, backgroundColor: COLORS.primary, padding: 14, borderRadius: 10, alignItems: 'center' },
  scanAgainText: { color: COLORS.dark, fontWeight: 'bold', fontSize: 16 },
  btn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 10, margin: 20 },
  btnText: { color: COLORS.dark, fontWeight: 'bold', textAlign: 'center' },
  text: { color: COLORS.text, textAlign: 'center', margin: 20 },
});
