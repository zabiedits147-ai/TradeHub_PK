import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'react-native-camera-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../utils/theme';

const BarcodeScannerScreen = ({ navigation }) => {
  const [scanned, setScanned] = React.useState(false);

  const onReadCode = (event) => {
    if (scanned) return;
    const value = event.nativeEvent.codeStringValue;
    if (value) {
      setScanned(true);
      navigation.replace('InventoryScanResult', { barcode: value });
    }
  };

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        cameraType={CameraType.Back}
        scanBarcode={true}
        onReadCode={onReadCode}
        showFrame={false}
      />
      <SafeAreaView style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Icon name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Scan Barcode</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.scanFrame} />
        <Text style={styles.hint}>Align barcode within the frame</Text>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  scanFrame: {
    width: 260,
    height: 160,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
  },
  hint: { color: '#FFFFFF', textAlign: 'center', marginBottom: spacing.xxxl, ...typography.caption },
});

export default BarcodeScannerScreen;