import React, { useState } from 'react';
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
import { requestNumberChange, confirmNumberChange } from '../services/authService';

const ChangeNumberScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1 = enter new number, 2 = verify OTP
  const [newNumber, setNewNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async () => {
    if (newNumber.length < 10) {
      alert('Please enter a valid mobile number.');
      return;
    }
    setLoading(true);
    try {
      await requestNumberChange(newNumber);
      setStep(2);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (otp.length !== 6) {
      alert('Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      await confirmNumberChange(otp);
      alert('Mobile number updated successfully!');
      navigation.goBack();
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Mobile Number</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.content}>
        {step === 1 ? (
          <>
            <Text style={styles.label}>Enter New Mobile Number</Text>
            <View style={styles.inputWrap}>
              <Icon name="cellphone" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="03XX-XXXXXXX"
                placeholderTextColor={colors.textMuted}
                value={newNumber}
                onChangeText={setNewNumber}
                keyboardType="phone-pad"
                maxLength={11}
                editable={!loading}
              />
            </View>
            <TouchableOpacity style={styles.btn} onPress={handleRequestOTP} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.textInverse} /> : <Text style={styles.btnText}>Send OTP</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Enter OTP sent to {newNumber}</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="000000"
                placeholderTextColor={colors.textMuted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />
            </View>
            <TouchableOpacity style={styles.btn} onPress={handleConfirm} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.textInverse} /> : <Text style={styles.btnText}>Confirm Change</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.bgCard,
  },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  content: { padding: spacing.xl },
  label: { ...typography.bodyBold, fontSize: 13, color: colors.textPrimary, marginBottom: spacing.sm },
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
  input: { flex: 1, marginLeft: spacing.sm, fontSize: 14, color: colors.textPrimary },
  otpInput: { textAlign: 'center', letterSpacing: 6, fontSize: 18, marginLeft: 0 },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    ...shadow.card,
  },
  btnText: { color: colors.textInverse, fontSize: 15, fontWeight: '700' },
});

export default ChangeNumberScreen;