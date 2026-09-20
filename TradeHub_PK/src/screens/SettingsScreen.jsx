import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';

const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [shopName, setShopName] = useState('Trader');
  const [mobileNumber, setMobileNumber] = useState('');

useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        const userDataStr = await AsyncStorage.getItem('userData');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        setShopName(userData?.shopName || 'Trader');
        setMobileNumber(userData?.mobileNumber || '');

        const savedNotifPref = await AsyncStorage.getItem('notificationsEnabled');
        if (savedNotifPref !== null) {
          setNotificationsEnabled(savedNotifPref === 'true');
        }
      };
      loadUser();
    }, [])
  );
const handleToggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem('notificationsEnabled', value ? 'true' : 'false');
    } catch (error) {
      console.log('Error saving notification preference:', error.message);
    }
  };

  const accountItems = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: 'account-edit-outline',
      color: colors.primary,
      bg: colors.primaryLight,
    },
    {
      id: '2',
      title: 'Change Mobile Number',
      icon: 'cellphone',
      color: '#2563EB',
      bg: '#EFF4FF',
    },
    {
      id: '3',
      title: 'Business Verification',
      icon: 'shield-check-outline',
      color: colors.accentOrange,
      bg: colors.accentOrangeLight,
    },
  ];

  const preferenceItems = [
    {
      id: '1',
      title: 'Language',
      icon: 'translate',
      color: '#7C3AED',
      bg: '#F5F0FE',
      value: 'English',
    },
    {
      id: '2',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      color: '#0891B2',
      bg: '#ECFAFC',
    },
    {
      id: '3',
      title: 'About TradeHub PK',
      icon: 'information-outline',
      color: colors.textSecondary,
      bg: colors.divider,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>
          Manage your account & preferences
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.85}>
          <View style={styles.avatarCircle}>
            <Icon name="account" size={28} color={colors.textInverse} />
          </View>
         <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{shopName}</Text>
            <View style={styles.profileBadgeRow}>
              <View style={styles.proBadge}>
                <Icon name="shield-check" size={11} color={colors.primary} />
                <Text style={styles.proBadgeText}>Verified</Text>
              </View>
              <Text style={styles.profileSub}>{mobileNumber}</Text>
            </View>
          </View>
          <View style={styles.chevronWrap}>
            <Icon name="chevron-right" size={18} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.sectionCard}>
          {accountItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.row,
                index !== accountItems.length - 1 && styles.rowBorder,
              ]}
              activeOpacity={0.6}
              onPress={() => {
                if (item.id === '1') navigation?.navigate('EditProfile');
                if (item.id === '2') navigation?.navigate('ChangeNumber');
                if (item.id === '3')
                  navigation?.navigate('VerifyBusinessUpdate');
              }}
            >
              <View style={[styles.rowIconWrap, { backgroundColor: item.bg }]}>
                <Icon name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={styles.rowText}>{item.title}</Text>
              <Icon name="chevron-right" size={18} color={colors.border} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.sectionCard}>
          <View style={[styles.row, styles.rowBorder]}>
            <View
              style={[
                styles.rowIconWrap,
                { backgroundColor: colors.accentOrangeLight },
              ]}
            >
              <Icon name="bell-outline" size={18} color={colors.accentOrange} />
            </View>
            <Text style={styles.rowText}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: '#A7D7BB' }}
              thumbColor={notificationsEnabled ? colors.primary : colors.bgCard}
            />
          </View>
          {preferenceItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.row,
                index !== preferenceItems.length - 1 && styles.rowBorder,
              ]}
              activeOpacity={0.6}
            >
              <View style={[styles.rowIconWrap, { backgroundColor: item.bg }]}>
                <Icon name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={styles.rowText}>{item.title}</Text>
              {item.value ? (
                <Text style={styles.rowValue}>{item.value}</Text>
              ) : (
                <Icon name="chevron-right" size={18} color={colors.border} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footerWrap}>
          <Icon name="bank-outline" size={14} color={colors.border} />
          <Text style={styles.versionText}>TradeHub PK v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgScreen },
  headerRow: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg - 2,
    paddingBottom: spacing.lg,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
  },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xxl + 2,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    ...shadow.cardStrong,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.xxl,
    backgroundColor: colors.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1, marginLeft: spacing.md + 2 },
  profileName: { ...typography.h4, fontSize: 16, color: colors.textPrimary },
  profileBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs + 2,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 3,
  },
  profileSub: { ...typography.caption, color: colors.textSecondary },
  chevronWrap: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    backgroundColor: colors.bgScreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.sm + 2,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xxl,
    marginBottom: spacing.xxl - 2,
    ...shadow.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md + 1,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  rowValue: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  footerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  versionText: { fontSize: 11, color: colors.border, marginLeft: 5 },
});

export default SettingsScreen;
