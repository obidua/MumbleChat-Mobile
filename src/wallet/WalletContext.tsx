import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { WalletConnectModal } from "@walletconnect/modal-react-native";
import Constants from "expo-constants";
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface WalletContextValue {
  provider: EthereumProvider | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

// Use the same Reown project ID as the web app
const projectId =
  Constants.expoConfig?.extra?.walletConnectProjectId ||
  "93299966b4d38b4e38b8d020ec4347c1";

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
        // Match the web app's chain configuration - prioritize most used chains
        chains: [1295], // Ramestta primary chain
        optionalChains: [
          137, // Polygon
          8453, // Base
          42161, // Arbitrum
          10, // Optimism
          11155111, // Sepolia testnet
          // Secondary chains
          84532, // Base Sepolia
          80002, // Polygon Amoy
          421614, // Arbitrum Sepolia
          11155420, // Optimism Sepolia
          59144, // Linea
          59141, // Linea Sepolia
          480, // Worldchain
          4801, // Worldchain Sepolia
          324, // zkSync
          300, // zkSync Sepolia
          7777777, // Lens
          37111, // Lens Testnet
        ],
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
      }}>
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
        onModalClose={() => {
          setIsModalOpen(false);
        }}
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
