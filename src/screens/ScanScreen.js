import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { scanAPI, rewardsAPI } from '../services/api';

const COLORS = { primary: '#FFD700', dark: '#1a1a2e', card: '#16213e', text: '#fff', sub: '#aaa', green: '#4CAF50' };

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [basketItems, setBasketItems] = useState([]);
  const [totalSaved, setTotalSaved] = useState(0);

  const handleBarCodeScanned = async ({ data: barcode }) => {
    if (scanned || scanning) return;
    setScanned(true);
    setScanning(true);
    try {
      const res = await scanAPI.scan(barcode);
      setResult(res.data);
      setBasketItems(prev => prev.find(i => i.barcode === barcode) ? prev : [...prev, res.data]);
      setTotalSaved(prev => prev + (res.data.totalSavingsCents || 0));
      await rewardsAPI.earn('scan').catch(() => {});
    } catch (e) {
      Alert.alert('Scan Error', 'Could not find coupons. Try again.');
    } finally { setScanning(false); }
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
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ['ean13','ean8','upc_a','upc_e','code128'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanBox} />
          <Text style={styles.scanHint}>{scanning ? '🔍 Finding savings...' : 'Point at any barcode'}</Text>
        </View>
      </CameraView>

      {basketItems.length > 0 && (
        <View style={styles.basket}>
          <Text style={styles.basketTitle}>🛒 {basketItems.length} items · Saved ${(totalSaved/100).toFixed(2)}</Text>
        </View>
      )}

      {result && (
        <ScrollView style={styles.resultCard}>
          <Text style={styles.productName}>{result.product?.name || 'Product Found'}</Text>
          {(result.coupons || []).map((c, i) => (
            <Text key={i} style={styles.couponRow}>✅ {c.description}</Text>
          ))}
          <Text style={styles.totalSaved}>Total Saved: {result.totalSavingsDisplay || '$0.00'}</Text>
          <Text style={styles.starsEarned}>+{result.starsEarned || 10} ⭐ Stars earned</Text>
          <TouchableOpacity style={styles.scanAgainBtn} onPress={() => { setScanned(false); setResult(null); }}>
            <Text style={styles.scanAgainText}>Scan Another Item</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark },
  camera: { flex: 1, maxHeight: 300 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanBox: { width: 220, height: 220, borderWidth: 2, borderColor: COLORS.primary, borderRadius: 12 },
  scanHint: { color: '#fff', marginTop: 16, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 },
  basket: { backgroundColor: COLORS.card, padding: 12, borderTopWidth: 1, borderColor: COLORS.primary },
  basketTitle: { color: COLORS.primary, fontWeight: 'bold', textAlign: 'center' },
  resultCard: { margin: 16, padding: 20, backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.green },
  productName: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  couponRow: { color: COLORS.green, marginBottom: 6 },
  totalSaved: { color: COLORS.green, fontSize: 20, fontWeight: 'bold', marginTop: 12 },
  starsEarned: { color: COLORS.primary, fontSize: 16, marginTop: 4 },
  scanAgainBtn: { marginTop: 16, backgroundColor: COLORS.primary, padding: 14, borderRadius: 10, alignItems: 'center' },
  scanAgainText: { color: COLORS.dark, fontWeight: 'bold', fontSize: 16 },
  btn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 10, margin: 20 },
  btnText: { color: COLORS.dark, fontWeight: 'bold', textAlign: 'center' },
  text: { color: COLORS.text, textAlign: 'center', margin: 20, marginTop: 100 },
});
