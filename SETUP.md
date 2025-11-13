# Setup Instructions

## WalletConnect Configuration

Before running the app, you need to configure WalletConnect:

1. Visit https://cloud.walletconnect.com/
2. Create a new project (or use existing)
3. Copy your Project ID
4. Open `app.json` and replace `YOUR_PROJECT_ID_HERE` with your actual project ID:

```json
{
  "expo": {
    "extra": {
      "walletConnectProjectId": "paste-your-project-id-here"
    }
  }
}
```

## Installation

```bash
# Install dependencies
yarn install

# For iOS, also install pods (macOS only)
cd ios && pod install && cd ..
```

## Running

```bash
# Start dev server
yarn start

# Run on Android device/emulator
yarn android

# Run on iOS simulator (macOS only)
yarn ios
```

## Building APK for Android

### Option 1: Local build (requires Android Studio)

```bash
# Development APK
npx expo run:android --variant release

# The APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

### Option 2: EAS Build (cloud build, easier)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project (first time only)
eas build:configure

# Build APK
eas build --platform android --profile preview

# For production
eas build --platform android --profile production
```

## Troubleshooting

### Metro bundler issues
```bash
yarn start --clear
```

### iOS build errors
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android build errors
```bash
cd android
./gradlew clean
cd ..
```

## Next Steps

After setup:
1. Connect a wallet (MetaMask, Coinbase Wallet, etc.)
2. Initialize XMTP client
3. Start chatting!
