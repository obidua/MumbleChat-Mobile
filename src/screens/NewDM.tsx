import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { useXmtpStore } from "../store/xmtp";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "NewDM">;

export default function NewDM() {
  const navigation = useNavigation<NavigationProp>();
  const { client } = useXmtpStore();
  const [address, setAddress] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!client || !address.trim()) {
      Alert.alert("Error", "Please enter a valid wallet address");
      return;
    }

    // Basic validation: starts with 0x and is 42 chars
    const trimmedAddress = address.trim();
    if (!trimmedAddress.startsWith("0x") || trimmedAddress.length !== 42) {
      Alert.alert(
        "Invalid Address",
        "Please enter a valid Ethereum address (0x...)",
      );
      return;
    }

    try {
      setIsCreating(true);

      // Check if user can message this address
      const canMessage = await client.canMessage([trimmedAddress]);
      if (!canMessage[trimmedAddress]) {
        Alert.alert(
          "Cannot Message",
          "This address is not registered on XMTP network yet.",
        );
        setIsCreating(false);
        return;
      }

      // Create conversation
      const conversation = await client.conversations.newDm(trimmedAddress);

      // Navigate to thread
      navigation.replace("Thread", { conversationId: conversation.id });
    } catch (error) {
      console.error("Failed to create conversation:", error);
      Alert.alert(
        "Error",
        "Failed to create conversation. Please try again.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>New Message</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.label}>Wallet Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="0x..."
          placeholderTextColor="#6c757d"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
        />

        <Text style={styles.hint}>
          Enter the Ethereum wallet address of the person you want to message
        </Text>

        <Pressable
          style={[styles.createButton, !address.trim() && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!address.trim() || isCreating}>
          {isCreating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Start Chat</Text>
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
  content: {
    padding: 24,
  },
  label: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "white",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  hint: {
    color: "#6c757d",
    fontSize: 13,
    marginTop: 8,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
