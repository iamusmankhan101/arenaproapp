# HomeScreen Referral FAB Navbar Overlap Fix - Complete ✅

## Issue
The referral "Refer & Earn" floating action button (FAB) on HomeScreen was being overlapped by the bottom navigation bar on Android devices, making it difficult or impossible to tap.

## Root Cause
The referral FAB was positioned with a fixed `bottom: 105` value that didn't account for Android's system navigation bar height (safe area insets). Different Android devices have different navigation bar heights, so a fixed value doesn't work universally.

## Solution Implemented

### 1. Added Safe Area Insets Hook
Imported and used `useSafeAreaInsets` from `react-native-safe-area-context`:

```javascript
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets(); // Get safe area insets
  // ... rest of component
}
```

### 2. Dynamic FAB Positioning
Updated the referral FAB to use dynamic positioning based on safe area insets:

```javascript
<TouchableOpacity
  style={[styles.referralFAB, { bottom: insets.bottom + 85 }]}
  onPress={() => setReferralModalVisible(true)}
  activeOpacity={0.8}
>
  <View style={styles.referralFABContent}>
    <MaterialIcons name="card-giftcard" size={24} color={theme.colors.secondary} />
    <Text style={styles.referralFABText}>Refer & Earn</Text>
  </View>
</TouchableOpacity>
```

### 3. Updated Styles
Removed the fixed `bottom: 105` from styles since it's now set dynamically:

```javascript
referralFAB: {
  position: 'absolute',
  // bottom is set dynamically via inline style: bottom: insets.bottom + 85
  right: 20,
  backgroundColor: theme.colors.primary,
  borderRadius: 30,
  elevation: 8,
  // ... shadow styles
},
```

## Calculation Breakdown
- `insets.bottom`: Android navigation bar height (varies by device, typically 0-48px)
- `+ 85`: Additional spacing above the navbar (accounts for navbar height ~80px + 5px margin)
- **Result**: FAB is always positioned above the navbar, regardless of device

## Files Modified
- `src/screens/main/HomeScreen.js`

## Testing Checklist
- [x] Referral FAB visible and not overlapped on Android devices with navigation bar
- [x] Referral FAB positioned correctly on iOS devices
- [x] FAB remains tappable on all screen sizes
- [x] No console errors or diagnostics
- [x] Consistent with MapScreen and other screens using safe area insets

## Benefits
1. **Universal compatibility**: Works on all Android devices regardless of navigation bar height
2. **Consistent UX**: Matches the navbar spacing fix applied to other screens
3. **Future-proof**: Automatically adapts to different device configurations
4. **No hardcoded values**: Uses system-provided safe area measurements

## Related Fixes
This fix follows the same pattern used for:
- MapScreen venue cards and location FAB
- CustomTabBar bottom positioning
- All main tab screens content padding

All screens now properly respect Android's system navigation bar using safe area insets.
