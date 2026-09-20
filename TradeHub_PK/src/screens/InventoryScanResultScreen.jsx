import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';
import { scanBarcode, addInventoryItem, adjustQuantity } from '../services/inventoryService';

const InventoryScanResultScreen = ({ navigation, route }) => {
  const { barcode } = route.params;
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [productName, setProductName] = useState('');
  const [initialQty, setInitialQty] = useState('');
  const [changeQty, setChangeQty] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const lookup = async () => {
      try {
        const result = await scanBarcode(barcode);
        if (result.notFound) {
          setItem(null);
        } else {
          setItem(result);
        }
      } catch (error) {
        console.log('Scan lookup error:', error.message);
      } finally {
        setLoading(false);
      }
    };
    lookup();
  }, []);

  const handleAddNew = async () => {
    if (!productName || !initialQty) {
      alert('Please enter product name and quantity.');
      return;
    }
    setSaving(true);
    try {
      await addInventoryItem(barcode, productName, Number(initialQty));
      alert('Item added to inventory!');
      navigation.navigate('InventoryList');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add item.');
    } finally {
      setSaving(false);
    }
  };

  const handleAdjust = async (sign) => {
    if (!changeQty) {
      alert('Please enter a quantity.');
      return;
    }
    setSaving(true);
    try {
      await adjustQuantity(item._id, sign * Number(changeQty));
      alert('Stock updated!');
      navigation.navigate('InventoryList');
    } catch (error) {
      alert('Failed to update stock.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Result</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.barcodeBox}>
          <Icon name="barcode-scan" size={20} color={colors.primary} />
          <Text style={styles.barcodeText}>{barcode}</Text>
        </View>

        {item ? (
          <>
            <Text style={styles.productTitle}>{item.productName}</Text>
            <Text style={styles.currentQty}>Current stock: {item.quantity} {item.unit}</Text>

            <Text style={styles.label}>Adjust Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter quantity"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={changeQty}
              onChangeText={setChangeQty}
              editable={!saving}
            />

            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.restockBtn]} onPress={() => handleAdjust(1)} disabled={saving}>
                <Icon name="plus" size={16} color={colors.textInverse} />
                <Text style={styles.actionBtnText}>Restock (+)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.dispatchBtn]} onPress={() => handleAdjust(-1)} disabled={saving}>
                <Icon name="minus" size={16} color={colors.textInverse} />
                <Text style={styles.actionBtnText}>Dispatch (-)</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.newItemNote}>
              <Icon name="information-outline" size={16} color={colors.accentOrange} />
              <Text style={styles.newItemNoteText}>New barcode — add this item to your inventory</Text>
            </View>

            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Cotton Suit - Size M"
              placeholderTextColor={colors.textMuted}
              value={productName}
              onChangeText={setProductName}
              editable={!saving}
            />

            <Text style={styles.label}>Initial Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 50"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={initialQty}
              onChangeText={setInitialQty}
              editable={!saving}
            />

            <TouchableOpacity style={styles.addBtn} onPress={handleAddNew} disabled={saving}>
              {saving ? <ActivityIndicator color={colors.textInverse} /> : <Text style={styles.addBtnText}>Add to Inventory</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgScreen },
  centerContent: { alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.bgCard,
  },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  content: { padding: spacing.xl },
  barcodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  barcodeText: { ...typography.captionBold, color: colors.textPrimary, marginLeft: spacing.sm },
  productTitle: { ...typography.h3, color: colors.textPrimary },
  currentQty: { ...typography.caption, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.lg },
  newItemNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentOrangeLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  newItemNoteText: { ...typography.small, color: colors.textPrimary, marginLeft: spacing.sm, flex: 1 },
  label: { ...typography.bodyBold, fontSize: 13, color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.bgCard,
  },
  btnRow: { flexDirection: 'row', marginTop: spacing.lg },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: radius.md,
    marginRight: spacing.sm,
  },
  restockBtn: { backgroundColor: colors.primary },
  dispatchBtn: { backgroundColor: colors.accentOrange, marginRight: 0 },
  actionBtnText: { color: colors.textInverse, fontWeight: '700', marginLeft: spacing.xs, fontSize: 13 },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    ...shadow.card,
  },
  addBtnText: { color: colors.textInverse, fontSize: 15, fontWeight: '700' },
});

export default InventoryScanResultScreen;