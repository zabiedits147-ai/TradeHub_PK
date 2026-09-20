import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';
import { getSalesForecast } from '../services/aiService';

const AIPredictorScreen = () => {
  const [forecast, setForecast] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getSalesForecast(7); // next 7 days for chart display
      setForecast(data.forecast);
      setSummary(data.summary);
    } catch (err) {
      console.log('Error fetching AI forecast:', err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const handleRestock = () => {
    console.log('Restock order placed');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Running AI forecast...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['top']}>
        <Icon name="cloud-off-outline" size={40} color={colors.textMuted} />
        <Text style={styles.emptyText}>Could not reach AI service</Text>
        <TouchableOpacity onPress={fetchForecast} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const maxYhat = Math.max(...forecast.map(f => f.yhat), 1);
  const growthPositive = summary?.growthPercent >= 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.dashboardLabel}>DASHBOARD</Text>
        <Text style={styles.headerTitle}>AI Sales Predictor</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.alertCard}>
          <View style={styles.alertIconWrap}>
            <Icon name="robot-outline" size={18} color={colors.accentOrange} />
          </View>
          <View style={styles.alertTextWrap}>
            <Text style={styles.alertTitle}>
              AI Insight: Sales predicted to {growthPositive ? 'grow' : 'decline'} by {Math.abs(summary?.growthPercent || 0)}% next week!
            </Text>
            <Text style={styles.alertSubtitle}>
              {growthPositive ? 'Restock now to maximize your profit.' : 'Consider adjusting inventory levels.'}
            </Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartTitle}>Sales Trend</Text>
            <View style={[styles.growthBadge, !growthPositive && styles.growthBadgeNeg]}>
              <Icon name={growthPositive ? 'arrow-top-right' : 'arrow-bottom-right'} size={12} color={growthPositive ? colors.primary : colors.accentOrange} />
              <Text style={[styles.growthText, !growthPositive && styles.growthTextNeg]}>
                {growthPositive ? '+' : ''}{summary?.growthPercent}%
              </Text>
            </View>
          </View>
          <Text style={styles.chartSubtitle}>7-day forecast (Prophet model)</Text>

          <View style={styles.chartArea}>
            {forecast.map((point, index) => {
              const heightPx = Math.max((point.yhat / maxYhat) * 100, 10);
              const dateLabel = new Date(point.ds).toLocaleDateString('en-GB', { weekday: 'short' });
              return (
                <View key={point.ds} style={styles.barWrap}>
                  <View style={[styles.bar, { height: heightPx }]} />
                  <Text style={styles.barLabel}>{dateLabel}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Recent Avg (30d)</Text>
            <Text style={styles.statValue}>{summary?.recentAverage} units</Text>
          </View>
          <View style={[styles.statCard, { marginRight: 0 }]}>
            <Text style={styles.statLabel}>Predicted Avg</Text>
            <Text style={styles.statValue}>{summary?.predictedAverage} units</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.restockBtn} onPress={handleRestock} activeOpacity={0.85}>
          <Icon name="truck-fast-outline" size={18} color={colors.textInverse} />
          <Text style={styles.restockText}>Place Restock Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgScreen },
  centerContent: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.md },
  emptyText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  retryBtn: { marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md },
  retryText: { color: colors.textInverse, fontWeight: '700' },
  topBar: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.bgCard,
  },
  dashboardLabel: { ...typography.tag, color: colors.textMuted },
  headerTitle: { ...typography.h3, color: colors.textPrimary, marginTop: 2 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: colors.accentOrangeLight,
    borderRadius: radius.xl,
    padding: spacing.md + 2,
    marginBottom: spacing.lg,
  },
  alertIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.accentOrangeBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTextWrap: { flex: 1, marginLeft: spacing.md },
  alertTitle: { ...typography.captionBold, color: colors.textPrimary, lineHeight: 18 },
  alertSubtitle: { ...typography.small, color: colors.textSecondary, marginTop: spacing.xs },
  chartCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartTitle: { ...typography.h4, fontSize: 15, color: colors.textPrimary },
  chartSubtitle: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  growthBadgeNeg: { backgroundColor: colors.accentOrangeLight },
  growthText: { color: colors.primary, ...typography.caption, marginLeft: 2, fontWeight: '700' },
  growthTextNeg: { color: colors.accentOrange },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    marginTop: spacing.xl,
  },
  barWrap: { alignItems: 'center', flex: 1 },
  bar: { width: 14, backgroundColor: colors.primary, borderRadius: 6 },
  barLabel: { fontSize: 10, color: colors.textMuted, marginTop: spacing.sm },
  statsRow: { flexDirection: 'row', marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.md + 2,
    marginRight: spacing.md,
    ...shadow.card,
  },
  statLabel: { ...typography.caption, color: colors.textSecondary },
  statValue: { ...typography.h4, fontSize: 18, color: colors.textPrimary, marginTop: spacing.xs },
  restockBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    ...shadow.card,
  },
  restockText: { color: colors.textInverse, fontSize: 15, fontWeight: '700', marginLeft: spacing.sm },
});

export default AIPredictorScreen;