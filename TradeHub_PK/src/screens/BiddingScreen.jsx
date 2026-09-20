import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';
import { getProducts } from '../services/productService';

const BiddingScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.log('Error fetching products:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation?.navigate('BidDetail', { product: item })}
    >
      <Image
        source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.badgeRow}>
          <Icon name="package-variant" size={11} color={colors.primary} />
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
        <Text style={styles.cardPrice}>Rs. {item.originalPrice?.toLocaleString()}</Text>
      </View>
      <View style={styles.chevronWrap}>
        <Icon name="chevron-right" size={18} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#134E31', '#1B7A4A', '#22A05E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topBar}
      >
        <View style={styles.topBarRow}>
          <View style={styles.topBarIconWrap}>
            <Icon name="gavel" size={20} color="#FFFFFF" />
          </View>
          <View style={{ marginLeft: spacing.md }}>
            <Text style={styles.headerTitle}>Live Bidding</Text>
            <Text style={styles.headerSubtitle}>{products.length} active listing{products.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={products}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Icon name="package-variant-closed" size={36} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No products listed yet</Text>
            <Text style={styles.emptyText}>Check back soon or pull down to refresh</Text>
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg + 4,
  },
  topBarRow: { flexDirection: 'row', alignItems: 'center' },
  topBarIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2, fontWeight: '600' },
  listContent: { padding: spacing.lg, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.card,
  },
  cardImage: { width: 62, height: 62, borderRadius: radius.md, backgroundColor: colors.border },
  cardInfo: { flex: 1, marginLeft: spacing.md },
  cardTitle: { ...typography.bodyBold, fontSize: 14, color: colors.textPrimary },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
  badgeText: { ...typography.small, color: colors.primary, marginLeft: 4, fontWeight: '700' },
  cardPrice: { ...typography.bodyBold, fontSize: 14, color: colors.textPrimary, marginTop: spacing.xs },
  chevronWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...typography.bodyBold, fontSize: 14, color: colors.textPrimary, marginTop: spacing.lg },
  emptyText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});

export default BiddingScreen;
