import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';
import { getMyLedger, sendReminder } from '../services/ledgerService';

const AVATAR_COLORS = ['#1B7A4A', '#2563EB', '#7C3AED', '#EA580C', '#0891B2', '#DB2777'];

const getAvatarColor = (str) => {
  if (!str) return AVATAR_COLORS[0];
  const code = str.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

const LedgerScreen = ({ navigation }) => {
  const [ledgerData, setLedgerData] = useState({ totalOwed: 0, activeAccounts: 0, entries: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingId, setSendingId] = useState(null);

  const fetchLedger = async () => {
    try {
      const data = await getMyLedger();
      setLedgerData(data);
    } catch (error) {
      console.log('Error fetching ledger:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLedger();
  }, []);

  const handleSendReminder = async (entryId, name) => {
    setSendingId(entryId);
    try {
      await sendReminder(entryId);
      alert(`Reminder sent to ${name}`);
    } catch (error) {
      alert('Failed to send reminder.');
    } finally {
      setSendingId(null);
    }
  };

  const renderItem = ({ item }) => {
    const shopName = item.retailer?.shopName || item.retailer?.mobileNumber || 'NA';
    const initials = item.retailer?.shopName
      ? item.retailer.shopName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
      : 'NA';
    const dueDateText = item.createdAt
      ? `Pending since ${new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
      : 'No due date set';
    const avatarColor = getAvatarColor(shopName);

    return (
      <View style={styles.dueCard}>
        <View style={styles.dueRow}>
          <View style={[styles.avatarBox, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.dueInfo}>
            <Text style={styles.dueName} numberOfLines={1}>{shopName}</Text>
            <View style={styles.dueDateRow}>
              <Icon name="calendar-clock-outline" size={11} color={colors.textMuted} />
              <Text style={styles.dueDate}>{dueDateText}</Text>
            </View>
          </View>
          <View style={styles.amountWrap}>
            <Text style={styles.amountLabel}>OWES</Text>
            <Text style={styles.dueAmount}>Rs. {item.amountOwed?.toLocaleString()}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.reminderBtn}
          activeOpacity={0.85}
          onPress={() => handleSendReminder(item._id, shopName)}
          disabled={sendingId === item._id}
        >
          {sendingId === item._id ? (
            <ActivityIndicator size="small" color={colors.textInverse} />
          ) : (
            <>
              <Icon name="bell-outline" size={15} color={colors.textInverse} />
              <Text style={styles.reminderText}>Send SMS Reminder</Text>
            </>
          )}
        </TouchableOpacity>
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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Digital Khata</Text>
        <View style={{ width: 34 }} />
      </View>

      <FlatList
        data={ledgerData.entries}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={['#134E31', '#1B7A4A', '#22A05E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryCard}
            >
              <View style={styles.summaryTopRow}>
                <Text style={styles.summaryLabel}>Total Udhari Owed</Text>
                <View style={styles.summaryIconWrap}>
                  <Icon name="book-open-variant" size={16} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.summaryAmount}>Rs. {ledgerData.totalOwed?.toLocaleString()}</Text>
              <View style={styles.updatedRow}>
                <Icon name="refresh" size={12} color="rgba(255,255,255,0.75)" />
                <Text style={styles.updatedText}>Pull down to refresh</Text>
              </View>
            </LinearGradient>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Pending Dues</Text>
              <View style={styles.sectionCountBadge}>
                <Text style={styles.sectionCountText}>{ledgerData.activeAccounts} Active</Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Icon name="check-decagram-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>All clear!</Text>
            <Text style={styles.emptyText}>No pending dues right now</Text>
          </View>
        }
        renderItem={renderItem}
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
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bgScreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxxl, flexGrow: 1 },
  summaryCard: {
    borderRadius: radius.xxl,
    padding: spacing.lg + 2,
    marginBottom: spacing.xl,
    ...shadow.cardStrong,
  },
  summaryTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { color: 'rgba(255,255,255,0.85)', ...typography.caption, fontWeight: '600' },
  summaryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryAmount: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', marginTop: spacing.sm },
  updatedRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  updatedText: { color: 'rgba(255,255,255,0.75)', ...typography.small, marginLeft: spacing.xs },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h4, color: colors.textPrimary },
  sectionCountBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  sectionCountText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...typography.bodyBold, fontSize: 14, color: colors.textPrimary, marginTop: spacing.lg },
  emptyText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  dueCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.md + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.card,
  },
  dueRow: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  dueInfo: { flex: 1, marginLeft: spacing.md },
  dueName: { ...typography.bodyBold, fontSize: 14, color: colors.textPrimary },
  dueDateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  dueDate: { ...typography.small, color: colors.textMuted, marginLeft: 4 },
  amountWrap: { alignItems: 'flex-end' },
  amountLabel: { fontSize: 9, color: colors.textMuted, fontWeight: '700', letterSpacing: 0.5 },
  dueAmount: { ...typography.bodyBold, fontSize: 15, color: '#DC2626', marginTop: 2 },
  reminderBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  reminderText: { color: colors.textInverse, fontSize: 13, fontWeight: '700', marginLeft: spacing.sm },
});

export default LedgerScreen;
