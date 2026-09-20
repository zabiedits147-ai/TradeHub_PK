import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation?.replace('OTPLogin');
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoWrap}>
        <Icon name="bank-outline" size={48} color="#1B7A4A" />
      </View>
      <Text style={styles.title}>TradeHub PK</Text>
      <Text style={styles.subtitle}>Pakistan's Digital Wholesale Market</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: '#E7F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 12, color: '#6B7280', marginTop: 6 },
});

export default SplashScreen;