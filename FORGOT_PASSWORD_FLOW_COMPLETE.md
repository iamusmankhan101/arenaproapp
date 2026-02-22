# Forgot Password Flow - Complete Implementation

## Overview
Complete forgot password flow with three screens matching the modern design pattern used throughout the app.

## Flow Screens

### 1. ForgotPasswordScreen
**Route**: `ForgotPassword`
**Purpose**: User enters their email to receive a password reset code

**Features**:
- Email input with validation
- Firebase `sendPasswordResetEmail` integration
- Circular back button with shadow
- Brand colors (primary #004d43, secondary #e8ee26)
- Montserrat font family
- Clean, modern design matching other auth screens

**Navigation**: 
- From: SignInScreen (via "Forgot Password?" link)
- To: VerifyResetCodeScreen (after sending code)

### 2. VerifyResetCodeScreen
**Route**: `VerifyResetCode`
**Purpose**: User enters the 4-digit verification code sent to their email

**Features**:
- 4-digit code input with auto-focus
- Individual input boxes for each digit
- Auto-advance to next input on entry
- Backspace navigation between inputs
- Resend code functionality
- Email display with brand color highlight
- Verify button disabled until all 4 digits entered

**Navigation**:
- From: ForgotPasswordScreen (after code sent)
- To: NewPasswordScreen (after code verification)

### 3. NewPasswordScreen
**Route**: `NewPassword`
**Purpose**: User sets a new password

**Features**:
- Password input with show/hide toggle
- Confirm password input with show/hide toggle
- Real-time password validation indicators:
  - Minimum 6 characters
  - Passwords match
- Visual checkmarks for met requirements
- Firebase `confirmPasswordReset` integration
- Success alert with navigation to SignIn
- Error handling for invalid/expired codes

**Navigation**:
- From: VerifyResetCodeScreen (after code verified)
- To: SignInScreen (after successful password reset)

## Design Consistency

All three screens follow the same design pattern:

1. **Layout**:
   - White background (#FFFFFF)
   - 24px horizontal padding
   - 60px top padding
   - Circular back button (48x48) with shadow

2. **Typography**:
   - Title: 32px, Montserrat_700Bold, #333
   - Subtitle: 16px, Montserrat_400Regular, #666
   - Labels: 14px, Montserrat_600SemiBold, #333
   - Input text: 16px, Montserrat_400Regular, #333

3. **Inputs**:
   - Background: #F5F5F5
   - Border radius: 12px
   - Height: 56px
   - Padding: 16px horizontal

4. **Buttons**:
   - Background: theme.colors.primary (#004d43)
   - Text color: theme.colors.secondary (#e8ee26)
   - Border radius: 28px
   - Height: 56px
   - Font: Montserrat_700Bold

5. **StatusBar**:
   - LightStatusBar component (dark-content for light background)

## Firebase Integration

### Email/Password Reset Flow:
1. **ForgotPasswordScreen**: Calls `sendPasswordResetEmail(auth, email)`
   - Firebase sends email with reset link and code
   - User receives email with verification code

2. **VerifyResetCodeScreen**: Validates the code
   - Code is passed to NewPasswordScreen
   - Can resend code if needed

3. **NewPasswordScreen**: Calls `confirmPasswordReset(auth, code, password)`
   - Resets password in Firebase
   - Navigates to SignIn on success

## Error Handling

### ForgotPasswordScreen:
- `auth/user-not-found`: "No account found with this email address."
- `auth/invalid-email`: "Invalid email address format."
- `auth/too-many-requests`: "Too many attempts. Please try again later."

### NewPasswordScreen:
- `auth/invalid-action-code`: "Invalid or expired reset code. Please request a new one."
- `auth/weak-password`: "Password is too weak. Please use a stronger password."

## Validation

### Email Validation:
- Not empty
- Valid email format (regex)

### Password Validation:
- Not empty
- Minimum 6 characters
- Password and confirm password match

## User Experience Features

1. **Auto-focus**: First input focuses automatically
2. **Auto-advance**: Code inputs advance automatically
3. **Visual feedback**: Real-time validation indicators
4. **Loading states**: Activity indicators during API calls
5. **Error messages**: Clear, user-friendly error alerts
6. **Success confirmation**: Alert before navigation to SignIn
7. **Keyboard handling**: KeyboardAvoidingView for iOS/Android
8. **Gesture control**: Appropriate gesture enabled/disabled per screen

## Files Modified/Created

### Created:
- `src/screens/auth/NewPasswordScreen.js` - New password entry screen

### Modified:
- `src/screens/auth/ForgotPasswordScreen.js` - Email entry screen (already existed, cleaned up)
- `src/screens/auth/VerifyResetCodeScreen.js` - Code verification screen (already existed, cleaned up)
- `src/navigation/AppNavigator.js` - Added VerifyResetCode and NewPassword routes

## Testing the Flow

1. Start from SignInScreen
2. Tap "Forgot Password?"
3. Enter email and tap "Send Code"
4. Check email for verification code
5. Enter 4-digit code in VerifyResetCodeScreen
6. Tap "Verify"
7. Enter new password (min 6 chars)
8. Confirm password (must match)
9. Tap "Reset Password"
10. See success alert
11. Tap "OK" to return to SignIn
12. Sign in with new password

## Notes

- Firebase handles the actual code generation and email sending
- The code from the email is used in `confirmPasswordReset`
- All screens use the same brand colors and fonts
- Design matches the modern, clean aesthetic of other auth screens
- Proper error handling for all Firebase auth errors
- Password requirements are clearly displayed with visual indicators
