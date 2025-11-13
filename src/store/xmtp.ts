import type { Conversation } from "@xmtp/browser-sdk";
import { create } from "zustand";
import type { XmtpClient } from "../xmtp/client";

interface XmtpState {
  client: XmtpClient | null;
  isInitializing: boolean;
  conversations: Conversation[];
  setClient: (client: XmtpClient | null) => void;
  setIsInitializing: (value: boolean) => void;
  setConversations: (conversations: Conversation[]) => void;
  reset: () => void;
}

export const useXmtpStore = create<XmtpState>((set) => ({
  client: null,
  isInitializing: false,
  conversations: [],
  setClient: (client) => {
    set({ client });
  },
  setIsInitializing: (isInitializing) => {
    set({ isInitializing });
  },
  setConversations: (conversations) => {
    set({ conversations });
  },
  reset: () => {
    set({
      client: null,
      isInitializing: false,
      conversations: [],
    });
  },
}));
