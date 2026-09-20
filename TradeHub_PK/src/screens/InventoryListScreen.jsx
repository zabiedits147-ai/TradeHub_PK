import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';
import { getInventory } from '../services/inventoryService';

const InventoryListScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = async () => {
    try {
      const data = await getInventory();
      setItems(data);
    } catch (error) {
      console.log('Error fetching inventory:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItems();
  }, []);

  const renderItem = ({ item }) => {
    const isLow = item.quantity <= item.lowStockThreshold;
    return (
      <View style={styles.card}>
        <View style={[styles.iconWrap, isLow && styles.iconWrapLow]}>
          <Icon name="package-variant-closed" size={20} color={isLow ? colors.accentOrange : colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.productName}</Text>
          <Text style={styles.cardBarcode}>{item.barcode}</Text>
        </View>
        <View style={styles.qtyWrap}>
          <Text style={[styles.qtyText, isLow && styles.qtyTextLow]}>{item.quantity}</Text>
          <Text style={styles.unitText}>{item.unit}</Text>
        </View>
      </View>
    );
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
        <TouchableOpacity onPress={() => navigation?.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory</Text>
        <TouchableOpacity onPress={() => navigation.navigate('BarcodeScanner')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="barcode-scan" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="barcode-off" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No inventory items yet</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BarcodeScanner')}>
              <Text style={styles.emptyLink}>Scan your first barcode</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('BarcodeScanner')} activeOpacity={0.85}>
        <Icon name="barcode-scan" size={22} color={colors.textInverse} />
      </TouchableOpacity>
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
  listContent: { padding: spacing.lg, paddingBottom: 100, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapLow: { backgroundColor: colors.accentOrangeLight },
  cardInfo: { flex: 1, marginLeft: spacing.md },
  cardTitle: { ...typography.bodyBold, fontSize: 14, color: colors.textPrimary },
  cardBarcode: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  qtyWrap: { alignItems: 'flex-end' },
  qtyText: { ...typography.h4, fontSize: 16, color: colors.textPrimary },
  qtyTextLow: { color: colors.accentOrange },
  unitText: { ...typography.small, color: colors.textMuted },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  emptyLink: { ...typography.captionBold, color: colors.primary, marginTop: spacing.md },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.cardStrong,
  },
});

export default InventoryListScreen;