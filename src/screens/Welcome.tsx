import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "../../App";
import { useXmtpStore } from "../store/xmtp";
import { useWallet } from "../wallet/WalletContext";
import { createSignerFromProvider, initXmtpClient } from "../xmtp/client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Welcome">;

export default function Welcome() {
  const navigation = useNavigation<NavigationProp>();
  const { provider, account, connect, isConnected } = useWallet();
  const { client, isInitializing, setClient, setIsInitializing } =
    useXmtpStore();
  const [isConnecting, setIsConnecting] = useState(false);

  // Navigate to conversations when XMTP is ready
  useEffect(() => {
    if (client) {
      navigation.replace("Conversations");
    }
  }, [client, navigation]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connect();
    } catch (error) {
      console.error("Wallet connection failed:", error);
      Alert.alert(
        "Connection Failed",
        "Could not connect to wallet. Please try again.",
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInitXmtp = async () => {
    if (!provider || !account) {
      Alert.alert("No Wallet", "Please connect your wallet first.");
      return;
    }

    try {
      setIsInitializing(true);
      const signer = createSignerFromProvider(provider, account);
      const xmtpClient = await initXmtpClient(signer, "production");
      setClient(xmtpClient);
      // Navigation handled by useEffect
    } catch (error) {
      console.error("XMTP initialization failed:", error);
      Alert.alert(
        "Initialization Failed",
        "Could not initialize XMTP. Please try again.",
      );
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>MumbleChat</Text>
      <Text style={styles.subtitle}>Private messaging with XMTP</Text>

      {!isConnected ? (
        <Pressable
          style={styles.button}
          onPress={handleConnect}
          disabled={isConnecting}>
          {isConnecting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Connect Wallet</Text>
          )}
        </Pressable>
      ) : (
        <View style={styles.connectedContainer}>
          <Text style={styles.addressText}>
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </Text>
          {!client ? (
            <Pressable
              style={styles.button}
              onPress={handleInitXmtp}
              disabled={isInitializing}>
              {isInitializing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Initialize XMTP</Text>
              )}
            </Pressable>
          ) : (
            <Text style={styles.successText}>✓ XMTP Ready</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b0f",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#c9c9cf",
    fontSize: 14,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 160,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  connectedContainer: {
    alignItems: "center",
    gap: 16,
  },
  addressText: {
    color: "#c9c9cf",
    fontSize: 14,
    fontFamily: "monospace",
  },
  successText: {
    color: "#10b981",
    fontSize: 16,
    fontWeight: "600",
  },
});
