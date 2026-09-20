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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';
import { updateProfile } from '../services/authService';

const EditProfileScreen = ({ navigation }) => {
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      if (userData) {
        setShopName(userData.shopName || '');
        setShopAddress(userData.shopAddress || '');
        setMobileNumber(userData.mobileNumber || '');
      }
      setLoadingUser(false);
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    if (!shopName || shopName.trim().length < 3) {
      alert('Shop name must be at least 3 characters.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(shopName, shopAddress);
      alert('Profile updated successfully!');
      navigation?.goBack();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.label}>Mobile Number</Text>
        <View style={[styles.inputWrap, styles.disabledInput]}>
          <Icon name="cellphone" size={18} color={colors.textMuted} />
          <TextInput style={styles.input} value={mobileNumber} editable={false} />
        </View>

        <Text style={styles.label}>Shop Business Name</Text>
        <View style={styles.inputWrap}>
          <Icon name="store-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Enter your shop name"
            placeholderTextColor={colors.textMuted}
            value={shopName}
            onChangeText={setShopName}
            editable={!loading}
          />
        </View>

        <Text style={styles.label}>Shop Address</Text>
        <View style={styles.inputWrap}>
          <Icon name="map-marker-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Enter your shop address"
            placeholderTextColor={colors.textMuted}
            value={shopAddress}
            onChangeText={setShopAddress}
            editable={!loading}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.textInverse} /> : <Text style={styles.saveText}>Save Changes</Text>}
        </TouchableOpacity>
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
  label: { ...typography.bodyBold, fontSize: 13, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    backgroundColor: colors.bgCard,
  },
  disabledInput: { backgroundColor: colors.divider },
  input: { flex: 1, marginLeft: spacing.sm, fontSize: 14, color: colors.textPrimary },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
    ...shadow.card,
  },
  saveText: { color: colors.textInverse, fontSize: 15, fontWeight: '700' },
});

export default EditProfileScreen;