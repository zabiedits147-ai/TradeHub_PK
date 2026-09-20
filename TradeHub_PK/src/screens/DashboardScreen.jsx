import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';
import { getMarketInsights, getTradingVolume } from '../services/insightService';
const getFormattedDate = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
};

const DashboardScreen = ({ navigation }) => {
  const [businessName, setBusinessName] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
 const [insights, setInsights] = useState([]);
  const [tradingVolume, setTradingVolume] = useState(0);
  const [growthPercent, setGrowthPercent] = useState(0);

 const loadInsights = React.useCallback(async () => {
    try {
      const data = await getMarketInsights();
      const mapped = data.map((item) => ({
        ...item,
        tagColor: item.tagColor === 'accentOrange' ? colors.accentOrange : colors.primary,
      }));
      setInsights(mapped);
    } catch (error) {
      console.log('Error loading insights:', error.message);
    }
  }, []);

  const loadTradingVolume = React.useCallback(async () => {
    try {
      const data = await getTradingVolume();
      setTradingVolume(data.volume || 0);
      setGrowthPercent(data.growthPercent || 0);
    } catch (error) {
      console.log('Error loading trading volume:', error.message);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        const userDataStr = await AsyncStorage.getItem('userData');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        setBusinessName(userData?.shopName || 'Trader');
      };

      loadUser();
      loadInsights();
      loadTradingVolume();

      // Auto-refresh insights + volume every 15 seconds while Dashboard is focused — live feed effect
      const intervalId = setInterval(() => {
        loadInsights();
        loadTradingVolume();
      }, 15000);

      return () => clearInterval(intervalId);
    }, [loadInsights])
  );

const menuItems = [
    { id: '1', title: 'Live Bidding', subtitle: 'Bid & negotiate', icon: 'gavel', screen: 'Bidding', color: '#1B7A4A', bg: '#E7F3EC' },
    { id: '2', title: 'Digital Khata', subtitle: 'Track your dues', icon: 'book-open-variant', screen: 'Ledger', color: '#2563EB', bg: '#EFF4FF' },
    { id: '3', title: 'AI Predictor', subtitle: 'Sales forecast', icon: 'chart-line', screen: 'AI Tools', color: '#7C3AED', bg: '#F5F0FE' },
    { id: '5', title: 'Pool Buying', subtitle: 'Buy in bulk', icon: 'account-group-outline', screen: 'PoolBuying', color: '#EA580C', bg: '#FFF1E9' },
    { id: '6', title: 'Inventory', subtitle: 'Scan & manage stock', icon: 'barcode-scan', screen: 'InventoryList', color: '#0891B2', bg: '#ECFAFC' },
    { id: '7', title: 'Visual Search', subtitle: 'Find by photo', icon: 'image-search-outline', screen: 'VisualSearch', color: '#DB2777', bg: '#FEF0F6' },
  ];

 const handleLogout = () => {
    setMenuVisible(false);
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          console.log('STEP 1: onPress fired');
          Promise.all([
            AsyncStorage.removeItem('authToken'),
            AsyncStorage.removeItem('userData'),
          ])
            .then(() => {
              console.log('STEP 2: storage cleared');
              const parentNav = navigation.getParent();
              console.log('STEP 3: parentNav =', parentNav ? 'EXISTS' : 'NULL');
              const grandParentNav = parentNav ? parentNav.getParent() : null;
              console.log('STEP 4: grandParentNav =', grandParentNav ? 'EXISTS' : 'NULL');
              if (grandParentNav) {
                grandParentNav.reset({ index: 0, routes: [{ name: 'OTPLogin' }] });
                console.log('STEP 5: reset called on grandParentNav');
              } else if (parentNav) {
                parentNav.reset({ index: 0, routes: [{ name: 'OTPLogin' }] });
                console.log('STEP 5: reset called on parentNav instead');
              } else {
                navigation.reset({ index: 0, routes: [{ name: 'OTPLogin' }] });
                console.log('STEP 5: reset called on navigation directly');
              }
            })
            .catch((e) => {
              console.log('CAUGHT ERROR:', e.message);
            });
        },
      },
    ]);
  };

  const handleSettingsPress = () => {
    setMenuVisible(false);
    navigation?.navigate('Settings');
  };

  const handleMenuPress = (screen) => {
    if (!screen) {
      Alert.alert('Coming Soon', 'Ye feature abhi under development hai.');
      return;
    }
    navigation?.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Icon name="bank-outline" size={20} color={colors.primary} />
          <Text style={styles.brand}>TradeHub PK</Text>
        </View>
        <TouchableOpacity style={styles.avatarCircle} onPress={() => setMenuVisible(true)} activeOpacity={0.8}>
          <Icon name="account" size={17} color={colors.textInverse} />
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.profileMenu}>
            <TouchableOpacity style={styles.profileMenuItem} onPress={handleSettingsPress} activeOpacity={0.7}>
              <View style={styles.profileMenuIconWrap}>
                <Icon name="cog-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.profileMenuText}>Settings</Text>
            </TouchableOpacity>
            <View style={styles.profileMenuDivider} />
            <TouchableOpacity style={styles.profileMenuItem} onPress={handleLogout} activeOpacity={0.7}>
              <View style={styles.profileMenuIconWrapDanger}>
                <Icon name="logout" size={16} color="#DC2626" />
              </View>
              <Text style={[styles.profileMenuText, { color: '#DC2626' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.businessName}>Welcome back,{'\n'}{businessName}!</Text>
          <View style={styles.metaRow}>
            <Icon name="calendar-blank-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.metaText}>{getFormattedDate()}</Text>
            <Icon name="shield-check-outline" size={13} color={colors.primary} style={{ marginLeft: spacing.md }} />
            <Text style={[styles.metaText, { color: colors.primary }]}>Pro Account</Text>
          </View>
        </View>

        <View style={styles.volumeCard}>
          <Text style={styles.volumeLabel}>Today's Trading Volume</Text>
          <View style={styles.volumeRow}>
            <Text style={styles.volumeAmount}>
              PKR {tradingVolume >= 1000 ? `${(tradingVolume / 1000).toFixed(1)}k` : tradingVolume}
            </Text>
            <View style={styles.growthBadge}>
              <Icon
                name={growthPercent >= 0 ? 'arrow-top-right' : 'arrow-bottom-right'}
                size={12}
                color={colors.primary}
              />
              <Text style={styles.growthText}>
                {growthPercent >= 0 ? '+' : ''}{growthPercent}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridCard}
              onPress={() => handleMenuPress(item.screen)}
              activeOpacity={0.75}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: item.bg }]}>
                <Icon name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={styles.gridLabel}>{item.title}</Text>
              <Text style={styles.gridSubtitle}>{item.subtitle}</Text>
              <View style={[styles.gridAccent, { backgroundColor: item.color }]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.insightsSection}>
          <View style={styles.insightsHeaderRow}>
            <Text style={styles.sectionTitle}>Market Insights</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          {insights.length === 0 && (
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>No activity yet — insights will appear as trading begins.</Text>
          )}
          {insights.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.insightRow}
              activeOpacity={0.7}
              onPress={() => {
                if (item.productId) {
                  navigation.navigate('Bidding');
                }
              }}
            >
              <View style={styles.insightThumb}>
                <Icon name="chart-line" size={20} color={colors.primary} />
              </View>
              <View style={styles.insightTextWrap}>
                <Text style={[styles.insightTag, { color: item.tagColor }]}>{item.tag}</Text>
                <Text style={styles.insightTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.insightSubtitle} numberOfLines={1}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgScreen },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgScreen,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  brand: { ...typography.h4, color: colors.textPrimary, marginLeft: spacing.sm },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  businessName: { ...typography.h2, color: colors.textPrimary, lineHeight: 30 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  metaText: { ...typography.caption, color: colors.textSecondary, marginLeft: spacing.xs },
  volumeCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xxl,
    padding: spacing.lg + 2,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    ...shadow.card,
  },
  volumeLabel: { color: colors.textSecondary, ...typography.caption },
  volumeRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  volumeAmount: { color: colors.textPrimary, fontSize: 26, fontWeight: '700', marginRight: spacing.md },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  growthText: { color: colors.primary, ...typography.caption, marginLeft: 2, fontWeight: '700' },
grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, marginTop: spacing.xl },
  gridCard: {
    width: '46%',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg + 4,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    margin: '2%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  gridIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: { marginTop: spacing.sm + 2, ...typography.bodyBold, fontSize: 13.5, color: colors.textPrimary },
  gridSubtitle: { marginTop: 2, fontSize: 10.5, color: colors.textMuted, textAlign: 'center' },
  gridAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  insightsSection: { paddingHorizontal: spacing.xl, marginTop: spacing.xxl, paddingBottom: spacing.xxxl },
  sectionTitle: { ...typography.h4, color: colors.textPrimary },
  insightRow: { flexDirection: 'row', marginBottom: spacing.lg },
  insightThumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTextWrap: { flex: 1, marginLeft: spacing.md },
  insightTag: { ...typography.tag },
  insightTitle: { ...typography.captionBold, color: colors.textPrimary, marginTop: 2 },
  insightSubtitle: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  insightsHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginRight: 4 },
  liveText: { fontSize: 9, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  profileMenu: {
    position: 'absolute',
    top: 58,
    right: spacing.xl,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    paddingVertical: 8,
    width: 180,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  profileMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16 },
  profileMenuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMenuIconWrapDanger: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMenuText: { ...typography.bodyBold, fontSize: 13, color: colors.textPrimary, marginLeft: 12 },
  profileMenuDivider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: 8, marginVertical: 4 },
});

export default DashboardScreen;
