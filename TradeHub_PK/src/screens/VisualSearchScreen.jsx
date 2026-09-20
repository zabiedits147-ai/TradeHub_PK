import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';
import { searchByImage } from '../services/visualSearchService';

const VisualSearchScreen = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);

  const handlePickImage = (fromCamera) => {
    const options = { mediaType: 'photo', includeBase64: true, quality: 0.6, maxWidth: 800, maxHeight: 800 };
    const callback = (response) => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (asset?.base64) {
        setSelectedImage(`data:${asset.type};base64,${asset.base64}`);
        runSearch(asset.base64);
      }
    };

    if (fromCamera) {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
  };

  const runSearch = async (base64Image) => {
    setSearching(true);
    setResults(null);
    try {
      const matches = await searchByImage(base64Image);
      setResults(matches);
    } catch (error) {
      console.log('Visual search error:', error.message);
      alert('Visual search failed. Make sure the AI service is running.');
    } finally {
      setSearching(false);
    }
  };

  const renderResult = ({ item }) => {
    if (!item.product) return null;
    const matchPercent = Math.max(0, Math.round(item.similarity * 100));
    return (
      <TouchableOpacity
        style={styles.resultCard}
onPress={() => navigation.getParent()?.navigate('Bidding', { screen: 'BidDetail', params: { product: item.product } })}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.product.imageUrl }} style={styles.resultImage} />
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle}>{item.product.title}</Text>
          <Text style={styles.resultPrice}>Rs. {item.product.originalPrice?.toLocaleString()}</Text>
        </View>
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>{matchPercent}% match</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Visual Search</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.imagePreviewBox}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderBox}>
              <Icon name="image-search-outline" size={40} color={colors.textMuted} />
              <Text style={styles.placeholderText}>Take or select a product photo</Text>
            </View>
          )}
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.pickBtn} onPress={() => handlePickImage(true)}>
            <Icon name="camera-outline" size={18} color={colors.textInverse} />
            <Text style={styles.pickBtnText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pickBtn, styles.galleryBtn]} onPress={() => handlePickImage(false)}>
            <Icon name="image-outline" size={18} color={colors.primary} />
            <Text style={[styles.pickBtnText, styles.galleryBtnText]}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {searching && (
          <View style={styles.searchingBox}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.searchingText}>Searching similar products...</Text>
          </View>
        )}

        {results && (
          <FlatList
            data={results}
            keyExtractor={(item, index) => item.productId || index.toString()}
            renderItem={renderResult}
            style={{ marginTop: spacing.lg }}
            ListEmptyComponent={<Text style={styles.emptyText}>No matches found.</Text>}
            ListHeaderComponent={<Text style={styles.sectionTitle}>Similar Products</Text>}
          />
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
  content: { flex: 1, padding: spacing.lg },
  imagePreviewBox: {
    height: 220,
    borderRadius: radius.xl,
    backgroundColor: colors.bgCard,
    overflow: 'hidden',
    ...shadow.card,
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  btnRow: { flexDirection: 'row', marginTop: spacing.lg },
  pickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  galleryBtn: { backgroundColor: colors.primaryLight, marginRight: 0 },
  pickBtnText: { color: colors.textInverse, fontWeight: '700', marginLeft: spacing.xs, fontSize: 13 },
  galleryBtnText: { color: colors.primary },
  searchingBox: { alignItems: 'center', marginTop: spacing.xl },
  searchingText: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  sectionTitle: { ...typography.h4, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.md },
  emptyText: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  resultImage: { width: 50, height: 50, borderRadius: radius.md, backgroundColor: colors.border },
  resultInfo: { flex: 1, marginLeft: spacing.md },
  resultTitle: { ...typography.bodyBold, fontSize: 13, color: colors.textPrimary },
  resultPrice: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  matchBadge: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  matchText: { ...typography.small, color: colors.primary, fontWeight: '700' },
});

export default VisualSearchScreen;