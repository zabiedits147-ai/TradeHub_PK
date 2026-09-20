import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { sendOTP } from '../services/authService';

const rnBiometrics = new ReactNativeBiometrics();
const { width } = Dimensions.get('window');

const OTPLoginScreen = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingBiometric, setCheckingBiometric] = useState(false);
  const [hasSavedLogin, setHasSavedLogin] = useState(false);
  const [savedNumber, setSavedNumber] = useState('');

  useEffect(() => {
    checkSavedLogin();
  }, []);

const checkSavedLogin = async () => {
    try {
      const number = await AsyncStorage.getItem('savedMobileNumber');
      const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
      if (number && biometricEnabled === 'true') {
        setHasSavedLogin(true);
        setSavedNumber(number);
      }
    } catch (error) {
      console.log('Error checking saved login:', error);
    }
  };

  const handleFingerprintLogin = async () => {
    setCheckingBiometric(true);
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      if (!available) {
        alert('Fingerprint sensor not available on this device.');
        setCheckingBiometric(false);
        return;
      }
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Confirm your fingerprint',
      });
      if (success) {
        navigation?.replace('MainApp');
      }
    } catch (error) {
      alert('Fingerprint authentication failed. Please try again or use OTP.');
    } finally {
      setCheckingBiometric(false);
    }
  };

  const handleGetOTP = async () => {
    if (mobileNumber.length < 10) {
      alert('Please enter a valid mobile number.');
      return;
    }
    setLoading(true);
    try {
      await sendOTP(mobileNumber);
      navigation?.navigate('VerifyOTP', { mobileNumber });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP. Check your connection.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Top gradient background with wave */}
      <LinearGradient
        colors={['#134E31', '#1B7A4A', '#22A05E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topBackground}
      >
        <View style={styles.statusSpacer} />
      </LinearGradient>

      {/* Wave shape overlay */}
      <Svg
        width={width}
        height={140}
        viewBox={`0 0 ${width} 140`}
        style={styles.waveTop}
      >
        <Path
          d={`M0,60 C${width * 0.25},140 ${width * 0.75},0 ${width},70 L${width},140 L0,140 Z`}
          fill="#F7F9F8"
        />
      </Svg>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* White card — logo now fully inside */}
          <View style={styles.card}>
            <LinearGradient
              colors={['#1B7A4A', '#22A05E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoCircle}
            >
              <Icon name="bank-outline" size={26} color="#FFFFFF" />
            </LinearGradient>

            <Text style={styles.brandRow}>
              <Text style={styles.brandDark}>Trade</Text>
              <Text style={styles.brandGreen}>Hub PK</Text>
            </Text>
            <Text style={styles.brandTag}>PAKISTAN'S DIGITAL WHOLESALE MARKET</Text>

            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.subtitle}>Secure Login Panel</Text>

            {/* Fingerprint login */}
            {hasSavedLogin && (
              <>
                <TouchableOpacity
                  style={styles.fingerprintCard}
                  onPress={handleFingerprintLogin}
                  activeOpacity={0.85}
                  disabled={checkingBiometric}
                >
                  <View style={styles.fingerprintIconWrap}>
                    {checkingBiometric ? (
                      <ActivityIndicator color="#1B7A4A" size="small" />
                    ) : (
                      <Icon name="fingerprint" size={24} color="#1B7A4A" />
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.fingerprintTitle}>Login with Fingerprint</Text>
                    <Text style={styles.fingerprintSub}>{savedNumber}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                  <View style={styles.dividerLine} />
                </View>
              </>
            )}

            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputWrap}>
              <Icon name="cellphone" size={18} color="#9CA3AF" style={{ marginLeft: 14 }} />
              <TextInput
                style={styles.input}
                placeholder="Enter your mobile number"
                placeholderTextColor="#9CA3AF"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
                maxLength={11}
                editable={!loading}
              />
            </View>

            <TouchableOpacity onPress={handleGetOTP} activeOpacity={0.85} disabled={loading} style={styles.otpBtnWrap}>
              <LinearGradient
                colors={['#1B7A4A', '#22A05E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.otpBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.otpBtnText}>Get OTP via SMS</Text>
                    <View style={styles.otpBtnIconWrap}>
                      <Icon name="arrow-right" size={16} color="#1B7A4A" />
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footerNoteRow}>
              <Icon name="shield-check-outline" size={14} color="#6B7280" />
              <Text style={styles.footerNoteText}>Protected by secure encryption</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom wave */}
      <Svg
        width={width}
        height={90}
        viewBox={`0 0 ${width} 90`}
        style={styles.waveBottom}
      >
        <Path
          d={`M0,30 C${width * 0.3},90 ${width * 0.7},0 ${width},40 L${width},90 L0,90 Z`}
          fill="#1B7A4A"
        />
      </Svg>
      <Text style={styles.copyrightText}>© 2026 TradeHub PK. All rights reserved.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F9F8' },
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  statusSpacer: { height: Platform.OS === 'android' ? 30 : 50 },
  waveTop: {
    position: 'absolute',
    top: 60,
    left: 0,
  },
  scrollContent: { flexGrow: 1, paddingTop: 170, paddingBottom: 40 },
  card: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 28,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    elevation: 6,
    shadowColor: '#1B7A4A',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  brandRow: { fontSize: 22, fontWeight: '800' },
  brandDark: { color: '#111827' },
  brandGreen: { color: '#1B7A4A' },
  brandTag: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, marginTop: 4 },
  welcomeTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 22 },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 6 },
  fingerprintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9F8',
    borderRadius: 16,
    padding: 14,
    marginTop: 20,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#1B7A4A',
  },
  fingerprintIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E7F3EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerprintTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  fingerprintSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { fontSize: 10, color: '#9CA3AF', marginHorizontal: 10, fontWeight: '700', letterSpacing: 0.3 },
  label: { fontSize: 13, fontWeight: '700', color: '#111827', marginTop: 20, marginBottom: 8, alignSelf: 'flex-start' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 54,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: '#111827', fontWeight: '500' },
  otpBtnWrap: { width: '100%', marginTop: 24 },
  otpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#1B7A4A',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  otpBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginRight: 10 },
  otpBtnIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerNoteRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  footerNoteText: { fontSize: 11, color: '#6B7280', marginLeft: 6 },
  waveBottom: { position: 'absolute', bottom: 0, left: 0 },
  copyrightText: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.85,
  },
});

export default OTPLoginScreen;