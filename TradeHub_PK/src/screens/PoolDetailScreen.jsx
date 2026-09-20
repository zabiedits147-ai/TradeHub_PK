import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';
import { getPoolById, joinPool } from '../services/poolService';

const PoolDetailScreen = ({ navigation, route }) => {
  const { poolId } = route.params;
  const [pool, setPool] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const fetchPool = async () => {
    try {
      const data = await getPoolById(poolId);
      setPool(data);
    } catch (error) {
      console.log('Error fetching pool:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPool();
  }, []);

  const handleJoin = async () => {
    if (!quantity || Number(quantity) <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    setJoining(true);
    try {
      await joinPool(poolId, Number(quantity));
      alert('Successfully joined the pool!');
      setQuantity('');
      fetchPool();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to join pool.';
      alert(message);
    } finally {
      setJoining(false);
    }
  };

  if (loading || !pool) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const progress = Math.min((pool.currentQuantity / pool.targetQuantity) * 100, 100);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pool Details</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.productTitle}>{pool.product?.title}</Text>
        <Text style={styles.wholesalerText}>Hosted by {pool.wholesaler?.shopName || pool.wholesaler?.mobileNumber}</Text>

        <View style={styles.statusBadge}>
          <Icon name={pool.status === 'completed' ? 'check-circle-outline' : 'progress-clock'} size={13} color={pool.status === 'completed' ? colors.primary : colors.accentOrange} />
          <Text style={[styles.statusText, { color: pool.status === 'completed' ? colors.primary : colors.accentOrange }]}>
            {pool.status === 'completed' ? 'Target Reached!' : 'Pool Open'}
          </Text>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{pool.currentQuantity} / {pool.targetQuantity} units collected</Text>
          <Text style={styles.priceText}>Rs. {pool.pricePerUnit}/unit</Text>
        </View>

        <Text style={styles.sectionTitle}>Participants ({pool.participants?.length || 0})</Text>
        {pool.participants?.length === 0 ? (
          <Text style={styles.emptyText}>No participants yet. Be the first!</Text>
        ) : (
          pool.participants.map((p, index) => (
            <View key={index} style={styles.participantRow}>
              <Icon name="account-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.participantName}>{p.retailer?.shopName || p.retailer?.mobileNumber}</Text>
              <Text style={styles.participantQty}>{p.quantity} units</Text>
            </View>
          ))
        )}

        {pool.status === 'open' && (
          <>
            <Text style={styles.label}>Your Quantity Contribution</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="e.g., 20"
                placeholderTextColor={colors.textMuted}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                editable={!joining}
              />
              <Text style={styles.unitLabel}>units</Text>
            </View>

            <TouchableOpacity style={styles.joinBtn} onPress={handleJoin} activeOpacity={0.85} disabled={joining}>
              {joining ? <ActivityIndicator color={colors.textInverse} /> : <Text style={styles.joinText}>Join This Pool</Text>}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
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
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  productTitle: { ...typography.h3, color: colors.textPrimary },
  wholesalerText: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  statusText: { ...typography.captionBold, marginLeft: spacing.xs },
  progressBarBg: { height: 10, backgroundColor: colors.divider, borderRadius: 5, marginTop: spacing.lg, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 5 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  progressText: { ...typography.caption, color: colors.textSecondary },
  priceText: { ...typography.captionBold, color: colors.textPrimary },
  sectionTitle: { ...typography.h4, fontSize: 15, color: colors.textPrimary, marginTop: spacing.xxl, marginBottom: spacing.md },
  emptyText: { ...typography.caption, color: colors.textMuted },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  participantName: { flex: 1, ...typography.caption, color: colors.textPrimary, marginLeft: spacing.sm },
  participantQty: { ...typography.captionBold, color: colors.textPrimary },
  label: { ...typography.bodyBold, fontSize: 13, color: colors.textPrimary, marginTop: spacing.xxl, marginBottom: spacing.sm },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  input: { flex: 1, fontSize: 14, color: colors.textPrimary },
  unitLabel: { fontSize: 13, color: colors.textSecondary },
  joinBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    ...shadow.card,
  },
  joinText: { color: colors.textInverse, fontSize: 15, fontWeight: '700' },
});

export default PoolDetailScreen;