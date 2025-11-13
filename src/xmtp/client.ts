// XMTP client bootstrap (React Native)
// NOTE: In RN we'll rely on @xmtp/browser-sdk with polyfills.
// We'll wire WalletConnect to obtain an EVM signer, then pass it to XMTP Client.create.

import type { Client, Signer } from '@xmtp/browser-sdk';

export type XmtpClient = Client;

export async function initXmtpClient(_signer: Signer): Promise<XmtpClient> {
  // TODO: implement Client.create(signer, options)
  // import { Client } from '@xmtp/browser-sdk'
  // return await Client.create(_signer, { env: 'production' });
  throw new Error('Not implemented: initXmtpClient');
}
