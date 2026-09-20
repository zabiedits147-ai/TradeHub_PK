import React, { useState } from 'react';
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
import { verifyBusiness } from '../services/authService';

const VerifyBusinessScreen = ({ navigation }) => {
  const [shopName, setShopName] = useState('');
  const [ntnCnic, setNtnCnic] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!shopName || !ntnCnic || !address) {
      alert('Please fill all fields before submitting.');
      return;
    }

    setLoading(true);
    try {
      await verifyBusiness(shopName, ntnCnic, address);
      navigation?.replace('MainApp');
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed. Please try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Icon name="arrow-left" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>TradeHub PK</Text>
          <View style={styles.avatarCircle}>
            <Icon name="account" size={16} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.content}>
          <Text style={styles.title}>Verify Your Wholesale{'\n'}Business</Text>
          <Text style={styles.subtitle}>
            Provide your official credentials to unlock bulk trading privileges and wholesale pricing.
          </Text>

          <Text style={styles.label}>Shop Business Name</Text>
          <View style={styles.inputWrap}>
            <Icon name="store-outline" size={18} color="#6B7280" />
            <TextInput
              style={styles.input}
              placeholder="Enter your registered shop name"
              placeholderTextColor="#9CA3AF"
              value={shopName}
              onChangeText={setShopName}
              editable={!loading}
            />
          </View>

          <Text style={styles.label}>NTN/CNIC Number</Text>
          <View style={styles.inputWrap}>
            <Icon name="card-account-details-outline" size={18} color="#6B7280" />
            <TextInput
              style={styles.input}
              placeholder="XXXXX-XXXXXXX-X"
              placeholderTextColor="#9CA3AF"
              value={ntnCnic}
              onChangeText={setNtnCnic}
              keyboardType="numbers-and-punctuation"
              editable={!loading}
            />
          </View>

          <Text style={styles.label}>Shop Address</Text>
          <View style={styles.inputWrap}>
            <Icon name="map-marker-outline" size={18} color="#6B7280" />
            <TextInput
              style={styles.input}
              placeholder="Complete physical address of your outlet"
              placeholderTextColor="#9CA3AF"
              value={address}
              onChangeText={setAddress}
              editable={!loading}
            />
          </View>

          <View style={styles.noteBox}>
            <Icon name="shield-check-outline" size={18} color="#1B7A4A" />
            <View style={styles.noteTextWrap}>
              <Text style={styles.noteTitle}>Secure Verification</Text>
              <Text style={styles.noteSubtitle}>
                Your documents are encrypted and used only for identity verification purposes by our compliance team.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Submit for Verification</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginTop: 12 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', lineHeight: 28 },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 8, lineHeight: 19 },
  label: { fontSize: 13, fontWeight: '600', color: '#111827', marginTop: 20, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  input: { flex: 1, marginLeft: 8, fontSize: 13, color: '#111827' },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: '#E7F3EC',
    borderRadius: 12,
    padding: 12,
    marginTop: 24,
  },
  noteTextWrap: { flex: 1, marginLeft: 10 },
  noteTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  noteSubtitle: { fontSize: 11, color: '#4B5563', marginTop: 2, lineHeight: 16 },
  submitBtn: {
    backgroundColor: '#1B7A4A',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default VerifyBusinessScreen;