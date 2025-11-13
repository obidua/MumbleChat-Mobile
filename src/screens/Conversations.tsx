import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { useXmtpStore } from "../store/xmtp";
import type { Conversation } from "@xmtp/browser-sdk";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Conversations">;

export default function Conversations() {
  const navigation = useNavigation<NavigationProp>();
  const { client, conversations, setConversations } = useXmtpStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadConversations = async () => {
    if (!client) return;

    try {
      const convos = await client.conversations.list();
      setConversations(convos);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [client]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadConversations();
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    // Determine if it's a group or DM
    const isGroup = item.version === "GROUP";
    const title = isGroup ? "Group Chat" : "Direct Message";
    
    // Get peer info for DMs
    let subtitle = "";
    if (isGroup) {
      // For groups, we'd need to get member count differently
      subtitle = "Group conversation";
    } else {
      // For DMs, try to get peer address
      const dmConvo = item as any;
      const peerAddr = dmConvo.peerAddress || dmConvo.createdByInboxId || "Unknown";
      subtitle = typeof peerAddr === "string" 
        ? peerAddr.slice(0, 6) + "..." + peerAddr.slice(-4)
        : "Direct message";
    }

    return (
      <Pressable
        style={styles.conversationItem}
        onPress={() => {
          // TODO: Navigate to thread
          console.log("Open conversation:", item.id);
        }}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{isGroup ? "👥" : "👤"}</Text>
        </View>
        <View style={styles.conversationContent}>
          <Text style={styles.conversationTitle}>{title}</Text>
          <Text style={styles.conversationSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.conversationMeta}>
          <Text style={styles.timestamp}>Now</Text>
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Pressable
          style={styles.newButton}
          onPress={() => {
            // TODO: Navigate to new conversation
            console.log("New conversation");
          }}>
          <Text style={styles.newButtonText}>+</Text>
        </Pressable>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>
            Start a new chat to begin messaging
          </Text>
          <Pressable style={styles.startButton} onPress={() => {}}>
            <Text style={styles.startButtonText}>Start a Conversation</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#4f46e5"
            />
          }
        />
      )}
    </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
  },
  newButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
  },
  newButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#c9c9cf",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  startButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(79, 70, 229, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
  },
  conversationContent: {
    flex: 1,
    gap: 4,
  },
  conversationTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  conversationSubtitle: {
    color: "#c9c9cf",
    fontSize: 14,
  },
  conversationMeta: {
    alignItems: "flex-end",
  },
  timestamp: {
    color: "#6c757d",
    fontSize: 12,
  },
});
