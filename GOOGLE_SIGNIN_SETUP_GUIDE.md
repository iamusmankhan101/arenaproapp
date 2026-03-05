# Google Sign-In Setup Guide - Fix OAuth Error 400

## Problem
Getting "Error 400: invalid_request" when trying to sign in with Google because the redirect URI is not authorized in Google Cloud Console.

**Why This Happens:**
- When using Expo Go for development, the OAuth redirect URI is `exp://YOUR_LOCAL_IP:8081`
- Your local IP (shown in error: `192.168.100.72`) is used instead of `localhost`
- Google OAuth requires ALL redirect URIs to be pre-registered in Google Cloud Console
- Since `exp://192.168.100.72:8081` isn't registered, Google rejects the request with Error 400

**The Fix:**
Add your development redirect URI to Google Cloud Console's authorized redirect URIs list.

## Solution

You need to add the correct redirect URIs to your Google Cloud Console OAuth configuration.

### Step 1: Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `arena-pro-97b5f`
3. Go to **APIs & Services** > **Credentials**

### Step 2: Find Your OAuth 2.0 Client ID

Look for the OAuth 2.0 Client IDs you're using:
- Web client ID: `960416327217-0evmllr420e5b8s2lpkb6rgt9a04kr39.apps.googleusercontent.com`
- Android client ID: `960416327217-87m8l6b8cjti5jg9mejv87v9eo652v6h.apps.googleusercontent.com`

### Step 3: Add Authorized Redirect URIs

#### For Development (Expo Go):

Click on your **Web client ID** and add these redirect URIs:

```
https://auth.expo.io/@your-expo-username/arena-pro
exp://192.168.100.72:8081
```

**Important Notes:**
- `192.168.100.72:8081` is your current local network IP (shown in the error)
- This IP may change if you restart your router or connect to a different network
- If the IP changes, you'll need to update it in Google Cloud Console
- Replace `your-expo-username` with your actual Expo username (if using Expo auth proxy)

#### For Production (Standalone App):

Add these redirect URIs:

```
arenapropk.online:/oauth2redirect/google
https://arenapropk.online/__/auth/handler
```

### Step 4: Configure Android OAuth Client

1. Click on your **Android client ID**
2. Make sure the package name matches: `arenapropk.online`
3. Add your SHA-1 certificate fingerprint

To get your SHA-1 fingerprint:

**For Debug Build:**
```bash
cd android
./gradlew signingReport
```

**For Release Build:**
```bash
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

### Step 5: Alternative Solution - Use Firebase Authentication UI

Instead of using `expo-auth-session`, you can use Firebase's built-in Google Sign-In which handles OAuth automatically.

#### Install Required Package:

```bash
npx expo install expo-google-sign-in
```

#### Update SignInScreen.js:

Replace the Google Sign-In implementation with:

```javascript
import * as Google from 'expo-google-sign-in';

// Initialize Google Sign-In
useEffect(() => {
  async function initAsync() {
    await Google.initAsync({
      clientId: '960416327217-0evmllr420e5b8s2lpkb6rgt9a04kr39.apps.googleusercontent.com',
    });
  }
  initAsync();
}, []);

const handleGoogleSignIn = async () => {
  try {
    await Google.askForPlayServicesAsync();
    const { type, user } = await Google.signInAsync();
    
    if (type === 'success') {
      // Get the ID token
      const credential = GoogleAuthProvider.credential(user.auth.idToken);
      // Sign in with Firebase
      dispatch(googleSignIn(user.auth.idToken));
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to sign in with Google');
  }
};
```

### Step 6: Verify Configuration

After adding the redirect URIs:

1. Wait 5-10 minutes for changes to propagate
2. Clear your app cache
3. Restart your Expo development server
4. Try Google Sign-In again

### Step 7: For Production Builds

When building for production (APK/AAB), make sure:

1. Your `google-services.json` is in the `android/app` directory
2. Your package name matches: `arenapropk.online`
3. Your SHA-1 fingerprint is added to Firebase Console
4. Your OAuth redirect URIs include the production URIs

### Common Issues

#### Issue 1: "Error 400: redirect_uri_mismatch"
**Solution**: Make sure the redirect URI in Google Cloud Console exactly matches what your app is using.

#### Issue 2: "Error 400: invalid_request"
**Solution**: This usually means the redirect URI is not authorized. Add all possible redirect URIs to Google Cloud Console.

#### Issue 3: Works in Expo Go but not in standalone app
**Solution**: Make sure you've added the production redirect URIs (`arenapropk.online:/oauth2redirect/google`) to Google Cloud Console.

### Testing

1. **In Development (Expo Go)**:
   - Use: `exp://192.168.100.72:8081` or `https://auth.expo.io/@username/arena-pro`

2. **In Production (APK/AAB)**:
   - Use: `arenapropk.online:/oauth2redirect/google`

### Quick Fix for Immediate Testing

If you need to test Google Sign-In immediately:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your **Web client ID** (the one ending in `0evmllr420e5b8s2lpkb6rgt9a04kr39.apps.googleusercontent.com`)
4. Under "Authorized redirect URIs", click **+ ADD URI**
5. Add this exact URI (from your error message):
   ```
   exp://192.168.100.72:8081
   ```
6. Click **SAVE**
7. Wait 5-10 minutes for changes to propagate
8. Restart your Expo development server: `npx expo start --clear`
9. Try Google Sign-In again

**Note**: This IP address (`192.168.100.72`) is your local network IP. If it changes (after router restart or network change), you'll need to update it in Google Cloud Console again.

### Alternative: Use Email/Password for Now

While setting up Google Sign-In, users can still sign in with email/password which is already working.

## Files Modified

- `src/screens/auth/SignInScreen.js` - Added redirect URI configuration

## Next Steps

1. Add redirect URIs to Google Cloud Console
2. Wait for changes to propagate (5-10 minutes)
3. Test Google Sign-In again
4. If still not working, check the error message and verify the redirect URI matches exactly

## Support

If you continue to have issues:
1. Check the exact redirect URI in the error message
2. Make sure it's added to Google Cloud Console
3. Clear app cache and restart
4. Check Firebase Console for any configuration issues
