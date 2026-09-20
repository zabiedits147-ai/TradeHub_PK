import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';
import { getConversationsList } from '../services/chatService';
import { getAllUsers } from '../services/userService';

const ChatListScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  const fetchData = async () => {
    try {
      const [convos, users] = await Promise.all([getConversationsList(), getAllUsers()]);
      setConversations(convos);
      setAllUsers(users);
    } catch (error) {
      console.log('Error fetching chat data:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const openChat = (userId, name) => {
    navigation.navigate('ChatConversation', { otherUserId: userId, name });
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => openChat(item.contactId, item.shopName || item.mobileNumber)}
    >
      <View style={styles.avatarBox}>
        <Icon name="account" size={20} color={colors.textInverse} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{item.shopName || item.mobileNumber}</Text>
        <Text style={styles.rowLastMsg} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <Text style={styles.rowTime}>
        {new Date(item.lastMessageTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
      </Text>
    </TouchableOpacity>
  );

  const renderContact = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => openChat(item._id, item.shopName || item.mobileNumber)}
    >
      <View style={[styles.avatarBox, { backgroundColor: colors.primary }]}>
        <Icon name="account" size={20} color={colors.textInverse} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{item.shopName || item.mobileNumber}</Text>
        <Text style={styles.rowLastMsg}>{item.isVerified ? 'Verified Business' : 'Not Verified'}</Text>
      </View>
      <Icon name="message-plus-outline" size={20} color={colors.primary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity onPress={() => setShowContacts(!showContacts)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name={showContacts ? 'message-outline' : 'account-plus-outline'} size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {showContacts ? (
        <FlatList
          data={allUsers}
          keyExtractor={item => item._id}
          renderItem={renderContact}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<Text style={styles.sectionLabel}>ALL USERS — TAP TO START CHAT</Text>}
          ListEmptyComponent={<Text style={styles.emptyText}>No other users registered yet</Text>}
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.contactId}
          renderItem={renderConversation}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="chat-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyText}>No conversations yet</Text>
              <TouchableOpacity onPress={() => setShowContacts(true)}>
                <Text style={styles.emptyLink}>Start a new chat</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  listContent: { padding: spacing.lg, flexGrow: 1 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: { flex: 1, marginLeft: spacing.md },
  rowName: { ...typography.bodyBold, fontSize: 14, color: colors.textPrimary },
  rowLastMsg: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  rowTime: { ...typography.small, color: colors.textMuted },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  emptyLink: { ...typography.captionBold, color: colors.primary, marginTop: spacing.md },
});

export default ChatListScreen;