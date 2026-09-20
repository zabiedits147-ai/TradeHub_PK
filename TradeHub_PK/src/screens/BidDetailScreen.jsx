import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';
import { createBid, getBidsForProduct, respondToBid } from '../services/bidService';
import { getEscrowByBid, releaseEscrow } from '../services/escrowService';

const BidDetailScreen = ({ navigation, route }) => {
  const { product } = route.params;
  const [offerAmount, setOfferAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [myId, setMyId] = useState(null);
  const [respondingId, setRespondingId] = useState(null);
  const [counterInputs, setCounterInputs] = useState({});
  const [escrows, setEscrows] = useState({});
  const [releasingId, setReleasingId] = useState(null);

  const isSeller = myId && product.seller && (product.seller._id === myId || product.seller === myId);

  const fetchHistory = async () => {
    try {
      const bids = await getBidsForProduct(product._id);
      setHistory(bids);

      const acceptedBids = bids.filter((b) => b.status === 'accepted');
      const escrowResults = {};
      for (const bid of acceptedBids) {
        try {
          const escrow = await getEscrowByBid(bid._id);
          escrowResults[bid._id] = escrow;
        } catch (err) {
          // no escrow found, skip
        }
      }
      setEscrows(escrowResults);
    } catch (error) {
      console.log('Error fetching bid history:', error.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      setMyId(userData?.id);
      fetchHistory();
    };
    init();
  }, []);

  const handleSubmitOffer = async () => {
    if (!offerAmount) {
      alert('Please enter your offer amount.');
      return;
    }

    setSubmitting(true);
    try {
      await createBid(product._id, Number(offerAmount));
      alert('Offer submitted successfully!');
      setOfferAmount('');
      fetchHistory();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit offer.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (bidId, action) => {
    setRespondingId(bidId);
    try {
      const counterAmount = action === 'countered' ? Number(counterInputs[bidId]) : undefined;
      if (action === 'countered' && !counterAmount) {
        alert('Please enter a counter offer amount.');
        setRespondingId(null);
        return;
      }
      await respondToBid(bidId, action, counterAmount);
      fetchHistory();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to respond to bid.';
      alert(message);
    } finally {
      setRespondingId(null);
    }
  };

  const handleConfirmDelivery = async (bidId) => {
    const escrow = escrows[bidId];
    if (!escrow) return;

    setReleasingId(bidId);
    try {
      await releaseEscrow(escrow._id);
      alert('Delivery confirmed! Funds released to seller.');
      fetchHistory();
    } catch (error) {
      alert('Failed to release funds.');
    } finally {
      setReleasingId(null);
    }
  };

  const statusColor = (status) => {
    if (status === 'accepted') return colors.primary;
    if (status === 'rejected') return '#DC2626';
    if (status === 'countered') return colors.accentOrange;
    return colors.textMuted;
  };

  const statusBg = (status) => {
    if (status === 'accepted') return colors.primaryLight;
    if (status === 'rejected') return '#FEF2F2';
    if (status === 'countered') return colors.accentOrangeLight || '#FFF1E9';
    return colors.divider;
  };

  const statusIcon = (status) => {
    if (status === 'accepted') return 'check-circle-outline';
    if (status === 'rejected') return 'close-circle-outline';
    if (status === 'countered') return 'swap-horizontal-circle-outline';
    return 'clock-outline';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bid Details</Text>
        <View style={styles.avatarCircle}>
          <Icon name="account" size={17} color={colors.textInverse} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: product.imageUrl || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800' }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.priceFloatingBadge}>
            <Text style={styles.priceFloatingText}>Rs. {product.originalPrice?.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <View style={styles.badgeRow}>
            <Icon name="package-variant" size={13} color={colors.primary} />
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>

          {isSeller ? (
            <View style={styles.sellerNote}>
              <View style={styles.sellerNoteIconWrap}>
                <Icon name="store-check-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.sellerNoteText}>This is your listing. Respond to offers below.</Text>
            </View>
          ) : (
            <View style={styles.offerCard}>
              <Text style={styles.label}>Enter your Offer</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.rsPrefix}>Rs.</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 65000"
                  placeholderTextColor={colors.textMuted}
                  value={offerAmount}
                  onChangeText={setOfferAmount}
                  keyboardType="numeric"
                  editable={!submitting}
                />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitOffer} activeOpacity={0.85} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <>
                    <Icon name="check-circle-outline" size={18} color={colors.textInverse} />
                    <Text style={styles.submitText}>Submit Custom Offer</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{isSeller ? 'Offers Received' : 'Negotiation History'}</Text>
            {history.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{history.length}</Text>
              </View>
            )}
          </View>

          {loadingHistory ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : history.length === 0 ? (
            <View style={styles.emptyHistoryWrap}>
              <Icon name="tag-off-outline" size={30} color={colors.textMuted} />
              <Text style={styles.emptyText}>No offers yet.</Text>
            </View>
          ) : (
            history.map((bid) => (
              <View key={bid._id} style={styles.historyCard}>
                <View style={styles.historyRow}>
                  <View style={[styles.historyIconWrap, { backgroundColor: statusBg(bid.status) }]}>
                    <Icon name={statusIcon(bid.status)} size={17} color={statusColor(bid.status)} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={styles.historyLabel}>{bid.buyer?.shopName || bid.buyer?.mobileNumber}</Text>
                    <View style={[styles.statusPill, { backgroundColor: statusBg(bid.status) }]}>
                      <Text style={[styles.historyStatus, { color: statusColor(bid.status) }]}>{bid.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.historyAmount}>Rs. {bid.offerAmount?.toLocaleString()}</Text>
                </View>

                {bid.status === 'countered' && bid.counterAmount && (
                  <Text style={styles.counterNote}>Your counter: Rs. {bid.counterAmount.toLocaleString()}</Text>
                )}

                {bid.status === 'accepted' && escrows[bid._id] && (
                  <View style={styles.escrowBox}>
                    <View style={styles.escrowRow}>
                      <Icon
                        name={escrows[bid._id].status === 'released' ? 'lock-open-variant-outline' : 'lock-outline'}
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={styles.escrowText}>
                        {escrows[bid._id].status === 'released'
                          ? 'Funds released to seller'
                          : `Rs. ${escrows[bid._id].amount.toLocaleString()} held in escrow`}
                      </Text>
                    </View>
                    {!isSeller && escrows[bid._id].status === 'holding' && (
                      <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={() => handleConfirmDelivery(bid._id)}
                        disabled={releasingId === bid._id}
                      >
                        {releasingId === bid._id ? (
                          <ActivityIndicator size="small" color={colors.textInverse} />
                        ) : (
                          <Text style={styles.confirmBtnText}>Confirm Delivery & Release Funds</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {isSeller && bid.status === 'pending' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.acceptBtn]}
                      onPress={() => handleRespond(bid._id, 'accepted')}
                      disabled={respondingId === bid._id}
                    >
                      <Icon name="check" size={14} color={colors.primary} />
                      <Text style={styles.acceptText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleRespond(bid._id, 'rejected')}
                      disabled={respondingId === bid._id}
                    >
                      <Icon name="close" size={14} color="#DC2626" />
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {isSeller && bid.status === 'pending' && (
                  <View style={styles.counterRow}>
                    <TextInput
                      style={styles.counterInput}
                      placeholder="Counter amount"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={counterInputs[bid._id] || ''}
                      onChangeText={(text) => setCounterInputs((prev) => ({ ...prev, [bid._id]: text }))}
                    />
                    <TouchableOpacity
                      style={styles.counterBtnSmall}
                      onPress={() => handleRespond(bid._id, 'countered')}
                      disabled={respondingId === bid._id}
                    >
                      {respondingId === bid._id ? (
                        <ActivityIndicator size="small" color={colors.textInverse} />
                      ) : (
                        <Text style={styles.counterBtnSmallText}>Send</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
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
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bgScreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: { width: '100%', height: 220, backgroundColor: colors.border },
  productImage: { width: '100%', height: '100%' },
  priceFloatingBadge: {
    position: 'absolute',
    bottom: 14,
    right: 16,
    backgroundColor: 'rgba(17,24,39,0.85)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  priceFloatingText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg + 2, paddingBottom: spacing.xxxl },
  productTitle: { ...typography.h3, color: colors.textPrimary },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  badgeText: { ...typography.small, color: colors.primary, marginLeft: spacing.xs, fontWeight: '700' },
  sellerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  sellerNoteIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerNoteText: { ...typography.caption, color: colors.textPrimary, marginLeft: spacing.sm, flex: 1, fontWeight: '600' },
  offerCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.card,
  },
  label: { ...typography.bodyBold, fontSize: 13, color: colors.textPrimary, marginBottom: spacing.sm },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    backgroundColor: colors.bgScreen,
  },
  rsPrefix: { fontSize: 14, color: colors.textSecondary, marginRight: spacing.sm, fontWeight: '700' },
  input: { flex: 1, fontSize: 14, color: colors.textPrimary },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    ...shadow.card,
  },
  submitText: { color: colors.textInverse, fontSize: 15, fontWeight: '700', marginLeft: spacing.sm },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxxl - 2,
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h4, fontSize: 15, color: colors.textPrimary },
  countBadge: {
    backgroundColor: colors.primaryLight,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: { color: colors.primary, fontWeight: '700', fontSize: 11 },
  emptyHistoryWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 30, marginBottom: 10 },
  emptyText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  historyCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  historyRow: { flexDirection: 'row', alignItems: 'center' },
  historyIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyLabel: { ...typography.captionBold, fontWeight: '700', color: colors.textPrimary },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radius.sm,
    marginTop: 3,
  },
  historyStatus: { fontSize: 10.5, textTransform: 'capitalize', fontWeight: '700' },
  historyAmount: { ...typography.captionBold, color: colors.textPrimary, fontSize: 14 },
  counterNote: { ...typography.small, color: colors.accentOrange, marginTop: spacing.sm, marginLeft: 46, fontWeight: '600' },
  actionRow: { flexDirection: 'row', marginTop: spacing.sm + 2, marginLeft: 46 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: radius.md,
    marginRight: spacing.sm,
  },
  acceptBtn: { backgroundColor: colors.primaryLight },
  acceptText: { color: colors.primary, fontWeight: '700', fontSize: 12, marginLeft: 4 },
  rejectBtn: { backgroundColor: '#FEF2F2' },
  rejectText: { color: '#DC2626', fontWeight: '700', fontSize: 12, marginLeft: 4 },
  counterRow: { flexDirection: 'row', marginTop: spacing.sm, marginLeft: 46, alignItems: 'center' },
  counterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 38,
    fontSize: 12,
    color: colors.textPrimary,
    marginRight: spacing.sm,
    backgroundColor: colors.bgScreen,
  },
  counterBtnSmall: {
    backgroundColor: colors.accentOrange,
    paddingHorizontal: spacing.md,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnSmallText: { color: colors.textInverse, fontWeight: '700', fontSize: 12 },
  escrowBox: {
    marginTop: spacing.sm + 2,
    marginLeft: 46,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
  },
  escrowRow: { flexDirection: 'row', alignItems: 'center' },
  escrowText: { ...typography.small, color: colors.textPrimary, marginLeft: spacing.xs, fontWeight: '600', flex: 1 },
  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  confirmBtnText: { color: colors.textInverse, fontWeight: '700', fontSize: 12 },
});

export default BidDetailScreen;
