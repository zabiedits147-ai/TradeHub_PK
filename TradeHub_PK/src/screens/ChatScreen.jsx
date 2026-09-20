import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, typography, shadow } from '../utils/theme';
import { getConversation, deleteMessage } from '../services/chatService';
import { initSocket, getSocket } from '../services/socket';

const ChatScreen = ({ navigation, route }) => {
  const otherUserId = route?.params?.otherUserId;
  const contactName = route?.params?.name || 'Chat';
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    const setup = async () => {
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const currentUserId = userData?.id;
      setMyId(currentUserId);

      const targetUserId = otherUserId;

      if (currentUserId) {
        initSocket(currentUserId);
        const socket = getSocket();
        socket.off('receiveMessage');
        socket.on('receiveMessage', (msg) => {
          const isRelevant =
            (msg.sender === currentUserId && msg.receiver === targetUserId) ||
            (msg.sender === targetUserId && msg.receiver === currentUserId);

          if (isRelevant) {
            setMessages((prev) => {
              const alreadyExists = prev.some((m) => m._id === msg._id);
              if (alreadyExists) return prev;
              return [...prev, msg];
            });
          }
        });

        socket.off('messageDeleted');
        socket.on('messageDeleted', ({ messageId, mode }) => {
          if (mode === 'everyone') {
            setMessages((prev) =>
              prev.map((m) =>
                m._id === messageId ? { ...m, text: 'This message was deleted', isDeletedForEveryone: true } : m
              )
            );
          }
        });
      }

      if (targetUserId) {
        try {
          const history = await getConversation(targetUserId);
          setMessages(history);
        } catch (error) {
          console.log('Error fetching conversation:', error.message);
        }
      }
      setLoading(false);
    };

    setup();

    return () => {
      const socket = getSocket();
      socket?.off('receiveMessage');
      socket?.off('messageDeleted');
    };
  }, []);

  const handleSend = () => {
    if (!inputText.trim() || !myId || !otherUserId) return;

    const socket = getSocket();
    socket.emit('sendMessage', {
      senderId: myId,
      receiverId: otherUserId,
      text: inputText.trim(),
    });

    setInputText('');
  };

  const openDeleteMenu = (item) => {
    if (item.isDeletedForEveryone) return;
    setDeleteTarget(item);
  };

  const closeDeleteMenu = () => setDeleteTarget(null);

  const confirmDelete = async (mode) => {
    if (!deleteTarget) return;
    const messageId = deleteTarget._id;
    setDeleting(true);
    try {
      await deleteMessage(messageId, mode);
      if (mode === 'me') {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId ? { ...m, text: 'This message was deleted', isDeletedForEveryone: true } : m
          )
        );
      }
      setDeleteTarget(null);
    } catch (error) {
      alert('Failed to delete message.');
    } finally {
      setDeleting(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === myId;
    return (
      <TouchableOpacity
        style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowThem]}
        onLongPress={() => openDeleteMenu(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text
            style={[
              styles.bubbleText,
              isMe && styles.bubbleTextMe,
              item.isDeletedForEveryone && styles.bubbleTextDeleted,
            ]}
          >
            {item.isDeletedForEveryone && (
              <Icon name="cancel" size={12} color={isMe ? 'rgba(255,255,255,0.7)' : colors.textMuted} />
            )}
            {'  '}{item.text}
          </Text>
          <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const isMyMessage = deleteTarget && deleteTarget.sender === myId;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.contactInfo}>
          <View style={styles.avatarBox}>
            <Icon name="account" size={16} color={colors.textInverse} />
          </View>
          <View>
            <Text style={styles.contactName}>{contactName}</Text>
          </View>
        </View>
        <Icon name="dots-vertical" size={20} color={colors.textPrimary} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleSend}
            activeOpacity={0.85}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Icon name="send" size={18} color={colors.textInverse} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {deleteTarget && (
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={closeDeleteMenu}>
          <TouchableOpacity activeOpacity={1} style={styles.sheetCard}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetPreviewRow}>
              <View style={styles.sheetPreviewIconWrap}>
                <Icon name="message-text-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.sheetPreviewText} numberOfLines={1}>{deleteTarget.text}</Text>
            </View>

            <TouchableOpacity
              style={styles.sheetOption}
              activeOpacity={0.7}
              onPress={() => confirmDelete('me')}
              disabled={deleting}
            >
              <View style={styles.sheetOptionIconWrap}>
                <Icon name="eye-off-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.sheetOptionTitle}>Delete for Me</Text>
                <Text style={styles.sheetOptionSubtitle}>Removes this message only from your view</Text>
              </View>
            </TouchableOpacity>

            {isMyMessage && (
              <TouchableOpacity
                style={styles.sheetOption}
                activeOpacity={0.7}
                onPress={() => confirmDelete('everyone')}
                disabled={deleting}
              >
                <View style={styles.sheetOptionIconWrapDanger}>
                  <Icon name="delete-forever-outline" size={18} color="#DC2626" />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[styles.sheetOptionTitle, { color: '#DC2626' }]}>Delete for Everyone</Text>
                  <Text style={styles.sheetOptionSubtitle}>Removes it for both of you</Text>
                </View>
              </TouchableOpacity>
            )}

            {deleting ? (
              <View style={styles.sheetCancelBtn}>
                <ActivityIndicator color={colors.textMuted} size="small" />
              </View>
            ) : (
              <TouchableOpacity style={styles.sheetCancelBtn} activeOpacity={0.7} onPress={closeDeleteMenu}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
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
  contactInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: spacing.md },
  avatarBox: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  contactName: { ...typography.bodyBold, fontSize: 14, color: colors.textPrimary },
  listContent: { padding: spacing.lg, paddingBottom: spacing.md },
  bubbleRow: { flexDirection: 'row', marginBottom: spacing.md },
  bubbleRowMe: { justifyContent: 'flex-end' },
  bubbleRowThem: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  bubbleMe: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: colors.bgCard, borderBottomLeftRadius: 4, ...shadow.card },
  bubbleText: { fontSize: 14, color: colors.textPrimary, lineHeight: 19 },
  bubbleTextMe: { color: colors.textInverse },
  bubbleTextDeleted: { fontStyle: 'italic', opacity: 0.7 },
  bubbleTime: { fontSize: 10, color: colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  bubbleTimeMe: { color: colors.primaryLight },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.bgCard,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgScreen,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
    color: colors.textPrimary,
    maxHeight: 100,
    marginRight: spacing.sm,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgScreen,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sheetPreviewIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetPreviewText: { flex: 1, marginLeft: spacing.sm, fontSize: 12.5, color: colors.textSecondary, fontStyle: 'italic' },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
  },
  sheetOptionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOptionIconWrapDanger: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOptionTitle: { ...typography.bodyBold, fontSize: 14, color: colors.textPrimary },
  sheetOptionSubtitle: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  sheetCancelBtn: {
    marginTop: spacing.md,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.bgScreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCancelText: { ...typography.bodyBold, fontSize: 14, color: colors.textSecondary },
});

export default ChatScreen;

