# MumbleChat Mobile

React Native (Expo) app for MumbleChat leveraging XMTP for private messaging.

## Features

- ✅ WalletConnect integration for mobile wallet auth
- ✅ XMTP client initialization with @xmtp/browser-sdk
- ✅ React Native polyfills for crypto operations
- ✅ Welcome screen with wallet connection flow
- 🚧 Conversations list and thread views (coming next)

## Setup

### Prerequisites

- Node 18+ (Expo SDK 52 works with Node 18/20/22)
- Yarn or npm
- Xcode (for iOS), Android Studio (for Android)

### Configuration

**WalletConnect Project ID is pre-configured!**

The app uses the same Reown (WalletConnect) project ID as the web app:

- Project ID: `93299966b4d38b4e38b8d020ec4347c1`
- Already set in `app.json`

No additional configuration needed! Just install and run.

**Install dependencies**

```sh
yarn install
# or
npm install
```

**Start development**

```sh
yarn start
```

**Run on device/simulator**

```sh
# Android
yarn android

# iOS (macOS only)
yarn ios
```

## Architecture

- **WalletConnect**: Mobile wallet authentication via QR/deep links
- **XMTP SDK**: `@xmtp/browser-sdk` with RN polyfills (react-native-get-random-values, expo-crypto)
- **State**: Zustand for XMTP client and conversations
- **Navigation**: React Navigation (native stack)
- **UI**: React Native components styled to match web app

## Build APK/IPA

### Development build (local)

```sh
# Android
npx expo run:android --variant release

# iOS (requires Apple Developer account)
npx expo run:ios --configuration Release
```

### Production build (EAS)

```sh
# Install EAS CLI
npm install -g eas-cli

# Configure and build
eas build --platform android
eas build --platform ios
```

## Next Steps

- [ ] Conversations list screen
- [ ] Thread/chat view with real-time messages
- [ ] New DM and Group creation flows
- [ ] Profile/identity management
- [ ] Push notifications
- [ ] Message reactions, replies, attachments

## Tech Stack

- Expo 52
- React Native 0.76
- TypeScript 5.6
- @xmtp/browser-sdk 5.0
- WalletConnect v2
- Zustand (state)
- React Navigation 7
