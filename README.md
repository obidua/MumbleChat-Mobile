# MumbleChat Mobile

React Native (Expo) app for MumbleChat leveraging XMTP.

## Status
- Scaffolded with Expo config, TS, navigation, and a Welcome screen.
- XMTP + WalletConnect wiring is stubbed.

## Requirements
- Node 18+ (Expo SDK 52 works well with Node 18/20)
- Yarn or npm
- Xcode (for iOS), Android Studio (for Android)

## Run (optional)
```sh
# install deps
# yarn install

# start dev server
# yarn start

# run on Android
# yarn android

# run on iOS (macOS)
# yarn ios
```

## Next
- Add WalletConnect integration to obtain a signer
- Initialize XMTP Client with @xmtp/browser-sdk
- Build conversations list and thread views
