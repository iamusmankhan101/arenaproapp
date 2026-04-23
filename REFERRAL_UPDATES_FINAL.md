# Referral System Updates - Final Configuration

## Changes Made

### 1. ✅ Website URL Updated
- Changed from: `https://arenapro.pk`
- Changed to: `https://arenapropk.online`
- Location: `src/components/ReferralModal.js`

### 2. ✅ Discount Amount Updated to PKR 200
- Previous: PKR 100 for both parties
- Updated: PKR 200 for both parties
- Locations updated:
  - `src/services/referralService.js` - Reward constants
  - `src/screens/auth/SignUpScreen.js` - Helper text
  - `src/components/ReferralModal.js` - Benefits description
  - `src/services/firebaseAuth.js` - Success message

---

## Current Configuration

### Reward Structure

```javascript
// In referralService.js
const REFERRER_REWARD = 200; // PKR 200 for referrer (discount on next booking)
const REFEREE_REWARD = 200;  // PKR 200 for new user (discount on first booking)
```

### How It Works

1. **Referrer (User who shares code)**
   - Must have completed at least 1 booking to be eligible
   - Gets PKR 200 discount on their NEXT booking
   - Discount applied when referred user completes first booking

2. **New User (Uses referral code)**
   - Enters referral code during signup
   - Gets PKR 200 discount on their FIRST booking
   - Discount applied automatically when they complete first booking

---

## User Messages

### Sign Up Screen Helper Text
```
"Have a referral code? Enter it to get PKR 200 discount on your first booking!"
```

### Sign Up Success Message (with referral)
```
"Account created successfully! Please check your email for verification. You have PKR 200 discount on your first booking!"
```

### Referral Modal - How It Works
```
"Both get PKR 200 discount on booking"
```

### Share Message
```
"Join Arena Pro and book your favorite sports venues! Use my referral code: [CODE]

Download now: https://arenapropk.online/ref/[CODE]"
```

---

## Implementation Details

### Discount Application

The discount is stored in the user's `walletBalance` field and should be applied during booking:

```javascript
// When creating a booking
const finalAmount = bookingAmount - user.walletBalance;

// Update user's wallet after applying discount
user.walletBalance = Math.max(0, user.walletBalance - bookingAmount);
```

### Database Fields

```javascript
{
  // Referrer (after referred user completes first booking)
  walletBalance: 200,  // PKR 200 discount available
  stats: {
    totalReferrals: 1
  },
  referralHistory: [{
    userId: "referred_user_id",
    userName: "New User",
    reward: 200,
    date: "2024-01-15",
    status: "COMPLETED"
  }]
}

{
  // New User (after completing first booking)
  walletBalance: 200,  // PKR 200 discount available
  referredBy: "referrer_uid",
  referralStatus: "COMPLETED",
  referralRewardReceived: true,
  referralRewardAmount: 200
}
```

---

## Booking Integration

To apply the referral discount during booking, add this logic to your booking creation:

```javascript
// In booking creation flow
const applyReferralDiscount = (userId, bookingAmount) => {
  const user = getUserFromFirestore(userId);
  
  if (user.walletBalance > 0) {
    const discountAmount = Math.min(user.walletBalance, bookingAmount);
    const finalAmount = bookingAmount - discountAmount;
    
    // Update user's wallet
    updateUserWallet(userId, user.walletBalance - discountAmount);
    
    return {
      originalAmount: bookingAmount,
      discountApplied: discountAmount,
      finalAmount: finalAmount,
      remainingBalance: user.walletBalance - discountAmount
    };
  }
  
  return {
    originalAmount: bookingAmount,
    discountApplied: 0,
    finalAmount: bookingAmount,
    remainingBalance: 0
  };
};
```

---

## Testing Checklist

### Test Case 1: Referrer Receives Discount
- [ ] User A completes a booking (becomes eligible)
- [ ] User A shares referral code
- [ ] User B signs up with User A's code
- [ ] User B completes first booking
- [ ] Verify: User A's walletBalance = 200
- [ ] User A makes next booking
- [ ] Verify: PKR 200 discount applied
- [ ] Verify: User A's walletBalance = 0

### Test Case 2: New User Receives Discount
- [ ] User B signs up with referral code
- [ ] Verify: Success message mentions PKR 200 discount
- [ ] User B makes first booking
- [ ] Verify: User B's walletBalance = 200
- [ ] Verify: PKR 200 discount applied to booking
- [ ] Verify: User B's walletBalance = 0

### Test Case 3: Partial Discount Usage
- [ ] User has PKR 200 in wallet
- [ ] User books venue for PKR 150
- [ ] Verify: PKR 150 discount applied
- [ ] Verify: Final amount = PKR 0
- [ ] Verify: Remaining wallet balance = PKR 50

### Test Case 4: Discount Exceeds Booking Amount
- [ ] User has PKR 200 in wallet
- [ ] User books venue for PKR 300
- [ ] Verify: PKR 200 discount applied
- [ ] Verify: Final amount = PKR 100
- [ ] Verify: Wallet balance = PKR 0

---

## URLs Updated

### Referral Link Format
```
https://arenapropk.online/ref/[REFERRAL_CODE]
```

Example:
```
https://arenapropk.online/ref/JOHNA3B7
```

### Share Message
```
Join Arena Pro and book your favorite sports venues! Use my referral code: JOHNA3B7

Download now: https://arenapropk.online/ref/JOHNA3B7
```

---

## Summary of Changes

| Item | Old Value | New Value |
|------|-----------|-----------|
| Website URL | arenapro.pk | arenapropk.online |
| Referrer Reward | PKR 100 | PKR 200 |
| New User Reward | PKR 100 | PKR 200 |
| Reward Type | Wallet Credit | Booking Discount |
| Application | First booking (both) | Referrer: Next booking, New user: First booking |

---

## Important Notes

1. **Discount vs Credit**: The PKR 200 is stored as wallet balance but should be applied as a discount during booking checkout.

2. **Discount Application**: The discount should be automatically applied at checkout when the user has a wallet balance > 0.

3. **Remaining Balance**: If the discount exceeds the booking amount, the remaining balance stays in the wallet for future bookings.

4. **One-Time Reward**: Each referral relationship only generates rewards once (when the new user completes their first booking).

5. **Eligibility**: Only users who have completed at least one booking can refer others.

---

## Next Steps

1. ✅ Update referral reward amounts to PKR 200
2. ✅ Update website URL to arenapropk.online
3. ✅ Update all user-facing messages
4. ⏳ Implement discount application in booking flow
5. ⏳ Add wallet balance display in profile
6. ⏳ Add transaction history for wallet
7. ⏳ Test complete referral flow end-to-end

---

## Files Modified

1. `src/components/ReferralModal.js` - URL and reward amount
2. `src/services/referralService.js` - Reward constants
3. `src/screens/auth/SignUpScreen.js` - Helper text
4. `src/services/firebaseAuth.js` - Success message

All changes have been applied and are ready for testing!
