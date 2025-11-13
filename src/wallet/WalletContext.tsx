import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { WalletConnectModal } from "@walletconnect/modal-react-native";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import Constants from "expo-constants";

interface WalletContextValue {
  provider: EthereumProvider | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const projectId = Constants.expoConfig?.extra?.walletConnectProjectId || "";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<EthereumProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const connect = useCallback(async () => {
    try {
      const wcProvider = await EthereumProvider.init({
        projectId,
        showQrModal: false,
        chains: [1], // Ethereum mainnet
        optionalChains: [10, 8453, 84532, 137], // Optimism, Base, Base Sepolia, Polygon
        methods: ["eth_sendTransaction", "personal_sign"],
        events: ["chainChanged", "accountsChanged"],
        metadata: {
          name: "MumbleChat",
          description: "Private messaging with XMTP",
          url: "https://mumblechat.app",
          icons: ["https://mumblechat.app/icon.png"],
        },
      });

      wcProvider.on("display_uri", (uri: string) => {
        console.log("WalletConnect URI:", uri);
        setIsModalOpen(true);
      });

      wcProvider.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });

      wcProvider.on("chainChanged", (chain: string) => {
        setChainId(parseInt(chain));
      });

      const accounts = await wcProvider.enable();
      setProvider(wcProvider);
      setAccount(accounts[0]);
      setChainId(wcProvider.chainId);
      setIsModalOpen(false);
    } catch (error) {
      console.error("WalletConnect connection failed:", error);
      setIsModalOpen(false);
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (provider) {
      await provider.disconnect();
      setProvider(null);
      setAccount(null);
      setChainId(null);
    }
  }, [provider]);

  return (
    <WalletContext.Provider
      value={{
        provider,
        account,
        chainId,
        isConnected: !!account,
        connect,
        disconnect,
      }}
    >
      {children}
      <WalletConnectModal
        projectId={projectId}
        providerMetadata={{
          name: "MumbleChat",
          description: "Private messaging with XMTP",
          url: "https://mumblechat.app",
          icons: ["https://mumblechat.app/icon.png"],
        }}
        isVisible={isModalOpen}
        onModalClose={() => setIsModalOpen(false)}
      />
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
