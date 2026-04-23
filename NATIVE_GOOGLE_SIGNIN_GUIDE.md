# Native Google Sign-In Setup Guide

We have migrated to `@react-native-google-signin/google-signin`. This approach is more reliable and does **not** use redirect URIs.

## 1. Google Cloud Console Configuration

### Step A: Configure Android Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/) > **APIs & Services** > **Credentials**.
2. Find your **Android Client ID**.
3. **SHA-1 Fingerprint**: Ensure you have pasted your development fingerprint:
   **`5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`**
4. **Package Name**: Use `host.exp.exponent` for testing in Expo Go.

### Step B: Web Client ID
1. Find your **Web Client ID** (`960416327217-0evmllr4...`).
2. You **no longer need** to add `https://auth.expo.io` to the Authorized Redirect URIs for this to work natively.

## 2. Verify in App

1. Restart your Expo server:
   ```bash
   npx expo start --clear
   ```
2. Tap the Google Sign-In button.
3. You should see a **native Google popup** (the phone's own account picker) instead of a browser window.
