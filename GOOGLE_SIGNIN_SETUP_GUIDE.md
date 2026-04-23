# Google Sign-In Setup Guide (Final Version)

Google blocks `exp://` redirect URIs. To fix "Error 400", the app now dynamically switches its configuration based on whether you are in **Expo Go** or a **Standalone APK**.

## 1. Google Cloud Console Configuration

### CRITICAL: Redirect URIs
Many users mistakenly try to add `arenapro://redirect` to the **Web Client ID**. **Google will NOT allow this** because Web clients must use `https`.

Follow these steps instead:

### Step A: Configure Android Client ID
This is what your app uses when running on an Android device (including Expo Go).

1. Go to [Google Cloud Console](https://console.cloud.google.com/) > **APIs & Services** > **Credentials**.
2. Find or create an **OAuth 2.0 Client ID** of type **Android**.
3. **Client ID**: `960416327217-12il70sju3qg9f11uh7ll5erj74s7vuq.apps.googleusercontent.com` (as you provided).
4. **Package Name**: Use `arenapropk.online` or `host.exp.exponent` (depending on your environment).
5. **SHA-1 Fingerprint**: Paste this exact SHA1 Fingerprint:
   **`5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`**

### Step B: Web Client ID (Tokens)
Your app still needs the **Web Client ID** to exchange tokens with Firebase.

1. Find your **Web Client ID** (e.g., `...-0evmllr4...`).
2. **Authorized Redirect URIs**: Add this exact URI:
   `https://auth.expo.io/@imusmankhan101/arena-pro`
3. **DO NOT** add `arenapro://` here.

## 2. Verify in App

1. Restart your Expo server:
   ```bash
   npx expo start --clear
   ```
2. The app's terminal logs should show:
   `Final Redirect URI: https://auth.expo.io/@imusmankhan101/arena-pro`
3. Tap Google Sign-In.
