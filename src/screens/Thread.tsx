import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { useXmtpStore } from "../store/xmtp";
import type { DecodedMessage } from "@xmtp/browser-sdk";

type ThreadRouteProp = RouteProp<RootStackParamList, "Thread">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Thread">;

export default function Thread() {
  const route = useRoute<ThreadRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { client } = useXmtpStore();
  const { conversationId } = route.params;

  const [messages, setMessages] = useState<DecodedMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const streamRef = useRef<AsyncGenerator | null>(null);

  // Load conversation and messages
  useEffect(() => {
    if (!client) return;

    const loadConversation = async () => {
      try {
        const convos = await client.conversations.list();
        const conversation = convos.find((c) => c.id === conversationId);

        if (!conversation) {
          console.error("Conversation not found");
          navigation.goBack();
          return;
        }

        // Load existing messages
        const msgs = await conversation.messages();
        setMessages(msgs.reverse()); // Reverse to show newest at bottom

        // Start streaming new messages
        const stream = conversation.streamMessages();
        streamRef.current = stream as any;

        (async () => {
          for await (const message of stream) {
            setMessages((prev) => [...prev, message]);
            // Auto-scroll to bottom
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        })();

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load conversation:", error);
        setIsLoading(false);
      }
    };

    loadConversation();

    // Cleanup stream on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.return?.();
      }
    };
  }, [client, conversationId, navigation]);

  const handleSend = async () => {
    if (!client || !inputText.trim() || isSending) return;

    try {
      setIsSending(true);
      const convos = await client.conversations.list();
      const conversation = convos.find((c) => c.id === conversationId);

      if (!conversation) {
        console.error("Conversation not found");
        return;
      }

      await conversation.send(inputText.trim());
      setInputText("");
      // Message will appear via stream
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: DecodedMessage; index: number }) => {
    const isMe = item.senderInboxId === client?.inboxId;
    const showTimestamp =
      index === 0 ||
      new Date(item.sentAt).getTime() - new Date(messages[index - 1].sentAt).getTime() >
        5 * 60 * 1000; // 5 minutes

    return (
      <View>
        {showTimestamp && (
          <View style={styles.timestampContainer}>
            <Text style={styles.timestamp}>
              {new Date(item.sentAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        )}
        <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
          <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
            <Text style={[styles.messageText, isMe && styles.myMessageText]}>
              {typeof item.content === "string" ? item.content : JSON.stringify(item.content)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Send a message to start the conversation</Text>
          </View>
        }
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#6c757d"
          multiline
          maxLength={1000}
        />
        <Pressable
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSending}>
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b0f",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#0b0b0f",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#c9c9cf",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "white",
    fontSize: 28,
    fontWeight: "600",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  headerRight: {
    width: 40,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timestampContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  timestamp: {
    color: "#6c757d",
    fontSize: 12,
  },
  messageRow: {
    flexDirection: "row",
    marginVertical: 4,
  },
  messageRowMe: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "75%",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  myMessage: {
    backgroundColor: "#4f46e5",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: "#c9c9cf",
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#ffffff",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#c9c9cf",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptySubtext: {
    color: "#6c757d",
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "white",
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
});
