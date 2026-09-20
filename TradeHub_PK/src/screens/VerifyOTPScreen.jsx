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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verifyOTP, sendOTP } from '../services/authService';

const VerifyOTPScreen = ({ navigation, route }) => {
  const { mobileNumber } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      alert('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyOTP(mobileNumber, otp);

      // Save token + number so fingerprint login works next time
      if (data.token) {
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('savedMobileNumber', mobileNumber);
        await AsyncStorage.setItem('biometricEnabled', 'true');
      }

      if (data.user?.isVerified) {
        navigation?.replace('MainApp');
      } else {
        navigation?.replace('VerifyBusiness');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid OTP. Please try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await sendOTP(mobileNumber);
      alert('OTP resent successfully.');
    } catch (error) {
      alert('Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation?.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Icon name="message-text-outline" size={40} color="#1B7A4A" />
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{'\n'}
          <Text style={styles.mobileText}>{mobileNumber}</Text>
        </Text>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="000000"
            placeholderTextColor="#9CA3AF"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
        </View>

        <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify} activeOpacity={0.85} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.verifyBtnText}>Verify & Continue</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} disabled={resending} style={{ marginTop: 20 }}>
          <Text style={styles.resendText}>
            {resending ? 'Resending...' : "Didn't receive code? Resend OTP"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9F8' },
  headerRow: { paddingHorizontal: 20, paddingTop: 8 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginTop: 16 },
  subtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 19 },
  mobileText: { fontWeight: '700', color: '#111827' },
  inputWrap: {
    width: '100%',
    marginTop: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  input: {
    fontSize: 22,
    letterSpacing: 8,
    textAlign: 'center',
    color: '#111827',
    height: 56,
  },
  verifyBtn: {
    width: '100%',
    backgroundColor: '#1B7A4A',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  verifyBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  resendText: { fontSize: 13, color: '#1B7A4A', fontWeight: '600' },
});

export default VerifyOTPScreen;