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
import { getPools } from '../services/poolService';

const PoolBuyingScreen = ({ navigation }) => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPools = async () => {
    try {
      const data = await getPools();
      setPools(data);
    } catch (error) {
      console.log('Error fetching pools:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPools();
  }, []);

  const renderItem = ({ item }) => {
    const progress = Math.min((item.currentQuantity / item.targetQuantity) * 100, 100);
    const daysLeft = Math.max(0, Math.ceil((new Date(item.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation?.navigate('PoolDetail', { poolId: item._id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.product?.title}</Text>
          <View style={styles.deadlineBadge}>
            <Icon name="clock-outline" size={11} color={colors.accentOrange} />
            <Text style={styles.deadlineText}>{daysLeft}d left</Text>
          </View>
        </View>

        <Text style={styles.wholesalerText}>by {item.wholesaler?.shopName || item.wholesaler?.mobileNumber}</Text>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{item.currentQuantity} / {item.targetQuantity} units</Text>
          <Text style={styles.priceText}>Rs. {item.pricePerUnit}/unit</Text>
        </View>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Pool Buying</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={pools}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="account-group-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No active pools right now</Text>
          </View>
        }
      />
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
  listContent: { padding: spacing.lg, flexGrow: 1 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.md + 2,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { ...typography.bodyBold, fontSize: 14, color: colors.textPrimary, flex: 1 },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentOrangeLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  deadlineText: { fontSize: 10, color: colors.accentOrange, marginLeft: 3, fontWeight: '700' },
  wholesalerText: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: 4,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  progressText: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  priceText: { ...typography.small, color: colors.textPrimary, fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
});

export default PoolBuyingScreen;