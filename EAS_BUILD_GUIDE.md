# EAS Build Guide - Arena Pro

## Prerequisites

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```
   Use your Expo account credentials (username: imusmankhan10)

## Build Profiles

Your `eas.json` has three build profiles:

### 1. Development Build
- For testing with development features
- Includes dev tools and debugging
- **Command**: `eas build --profile development --platform android`

### 2. Preview Build (APK)
- Creates an APK file for testing
- Smaller file size, easier to share
- **Command**: `eas build --profile preview --platform android`
- **Recommended for testing Google Sign-In**

### 3. Production Build (AAB)
- For Google Play Store submission
- Creates Android App Bundle (.aab)
- **Command**: `eas build --profile production --platform android`

## Quick Start - Build APK for Testing

To build an APK that you can install and test (including Google Sign-In):

```bash
eas build --profile preview --platform android
```

This will:
1. Upload your code to Expo's build servers
2. Build the APK
3. Provide a download link when complete (usually 10-20 minutes)

## Step-by-Step Build Process

### Step 1: Ensure Everything is Committed

```bash
git add .
git commit -m "Ready for build"
```

### Step 2: Run the Build Command

For APK (testing):
```bash
eas build --profile preview --platform android
```

For AAB (Play Store):
```bash
eas build --profile production --platform android
```

### Step 3: Follow the Prompts

EAS will ask you:

1. **Generate a new Android Keystore?**
   - First time: Choose **Yes**
   - EAS will generate and store your keystore securely
   - Subsequent builds: It will use the same keystore automatically

2. **Build Configuration**
   - EAS will show you what it's building
   - Confirm to proceed

### Step 4: Wait for Build

- Build typically takes 10-20 minutes
- You'll see progress in the terminal
- You can close the terminal and check status later

### Step 5: Download and Install

Once complete:
1. EAS provides a download link
2. Download the APK to your phone
3. Install it (you may need to enable "Install from Unknown Sources")
4. Test the app!

## Checking Build Status

If you closed the terminal, check build status:

```bash
eas build:list
```

Or visit: https://expo.dev/accounts/imusmankhan10/projects/arena-pro/builds

## Building for Both Platforms

### Android APK:
```bash
eas build --profile preview --platform android
```

### iOS (requires Apple Developer account):
```bash
eas build --profile preview --platform ios
```

### Both at once:
```bash
eas build --profile preview --platform all
```

## Local Builds (Optional)

If you want to build locally instead of on Expo's servers:

```bash
eas build --profile preview --platform android --local
```

Requirements:
- Android Studio installed
- Android SDK configured
- More setup required

## Troubleshooting

### Error: "No credentials found"

Run:
```bash
eas credentials
```

Then select "Android" and "Set up new credentials"

### Error: "Build failed"

1. Check the build logs on expo.dev
2. Common issues:
   - Missing dependencies
   - Invalid configuration
   - Network issues

### Error: "Keystore not found"

Run:
```bash
eas credentials
```

Select "Android" > "Keystore" > "Generate new keystore"

## After Building

### Testing the APK

1. **Download** the APK from the link provided
2. **Transfer** to your Android device
3. **Enable** "Install from Unknown Sources" in Settings
4. **Install** the APK
5. **Test** all features including:
   - Google Sign-In (works in APK builds!)
   - Password reset deep linking (email link opens app)
   - Location permissions
   - Booking flow
   - All other features

### Sharing the APK

You can share the download link with testers:
- Link is valid for 30 days
- Anyone with the link can download
- No Expo account needed to install

## Building for Production (Play Store)

When ready to publish:

1. **Build AAB**:
   ```bash
   eas build --profile production --platform android
   ```

2. **Download the AAB** from the build page

3. **Upload to Play Store**:
   - Go to Google Play Console
   - Create a new release
   - Upload the AAB file
   - Fill in store listing details
   - Submit for review

## Automated Builds

You can also set up automatic builds:

```bash
eas build --profile preview --platform android --auto-submit
```

This will automatically submit to Play Store after building (requires setup).

## Build Configuration

Your current `eas.json`:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  }
}
```

## Environment Variables

If you need to add environment variables for the build:

1. Create `.env.production` file
2. Add variables
3. They'll be included in the build automatically

## Useful Commands

```bash
# List all builds
eas build:list

# View specific build
eas build:view [build-id]

# Cancel a build
eas build:cancel

# Configure credentials
eas credentials

# View project info
eas project:info
```

## Next Steps

1. **Build Preview APK**: Test Google Sign-In and all features
2. **Fix any issues**: Iterate and rebuild as needed
3. **Build Production AAB**: When ready for Play Store
4. **Submit to Play Store**: Publish your app!

## Important Notes

- **First build** takes longer (15-25 minutes)
- **Subsequent builds** are faster (10-15 minutes)
- **Keystore** is stored securely by Expo
- **APK size** will be larger than AAB
- **Google Sign-In** will work in the APK build!
- **Deep linking** (password reset) works in APK builds
- **Domain verification** needed for production deep links (see PASSWORD_RESET_DEEP_LINKING_COMPLETE.md)

## Support

- EAS Build Docs: https://docs.expo.dev/build/introduction/
- Expo Forums: https://forums.expo.dev/
- Your builds: https://expo.dev/accounts/imusmankhan10/projects/arena-pro/builds

---

## Quick Reference

**Build APK for testing:**
```bash
eas build --profile preview --platform android
```

**Build AAB for Play Store:**
```bash
eas build --profile production --platform android
```

**Check build status:**
```bash
eas build:list
```

That's it! Run the command and wait for your APK to be ready! 🚀
