// XMTP client bootstrap (React Native)
// Uses @xmtp/browser-sdk with polyfills for RN environment

import { Client } from "@xmtp/browser-sdk";
import type { Signer, XmtpEnv } from "@xmtp/browser-sdk";
import { createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";
import type { EthereumProvider } from "@walletconnect/ethereum-provider";

export type XmtpClient = Client;

/**
 * Create a viem signer from WalletConnect provider
 */
export function createSignerFromProvider(provider: EthereumProvider, address: string): Signer {
  const walletClient = createWalletClient({
    account: address as `0x${string}`,
    chain: mainnet,
    transport: custom(provider),
  });

  return {
    getAddress: async () => address as `0x${string}`,
    signMessage: async (message: string | Uint8Array) => {
      const messageStr = typeof message === "string" ? message : new TextDecoder().decode(message);
      return (await walletClient.signMessage({
        account: address as `0x${string}`,
        message: messageStr,
      })) as `0x${string}`;
    },
  };
}

/**
 * Initialize XMTP client with a signer
 */
export async function initXmtpClient(
  signer: Signer,
  env: XmtpEnv = "production",
): Promise<XmtpClient> {
  try {
    const client = await Client.create(signer, {
      env,
    });
    return client;
  } catch (error) {
    console.error("XMTP client initialization failed:", error);
    throw error;
  }
}

