import "react-native-gesture-handler";
import "react-native-get-random-values";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Conversations from "./src/screens/Conversations";
import Welcome from "./src/screens/Welcome";
import { WalletProvider } from "./src/wallet/WalletContext";

export type RootStackParamList = {
  Welcome: undefined;
  Conversations: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <WalletProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="Conversations" component={Conversations} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </WalletProvider>
    </SafeAreaProvider>
  );
}
