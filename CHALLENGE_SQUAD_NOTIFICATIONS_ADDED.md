# Challenge & Squad Builder Notifications Added

## Summary
Added in-app notifications for challenge creation and squad builder game creation to keep users informed when they create new challenges or list games for other players to join.

## Changes Made

### 1. Challenge Creation Notifications (`src/services/challengeService.js`)
- Added notification when a challenge is successfully created
- Sends notification to the challenge creator
- Notification includes:
  - Title: "Challenge Created! 🏆"
  - Message: "Your challenge '[title]' is now live and visible to other players!"
  - Type: 'challenge'
  - Data: challengeId for navigation

### 2. Squad Builder Game Notifications (`src/services/firebaseAPI.js`)
- Added notification when a booking with `needPlayers: true` is created
- Sends notification to the game organizer
- Notification includes:
  - Title: "Game Listed on Squad Builder! 🎮"
  - Message: "Your game at [venue] is now visible to other players looking to join!"
  - Type: 'squad'
  - Data: bookingId for navigation

### 3. Firestore Index Added (`firestore.indexes.json`)
- Added composite index for notifications collection
- Fields: userId (ascending), createdAt (descending)
- Required for efficient notification queries

## How It Works

### Challenge Notifications
1. User creates a challenge via CreateChallengeModal
2. Challenge is saved to Firestore
3. Notification is created in the notifications collection
4. Local push notification is sent immediately
5. User sees notification in NotificationScreen and as a push notification

### Squad Builder Notifications
1. User creates a booking with "Need Players" enabled
2. Booking is saved to Firestore with `needPlayers: true`
3. Notification is created in the notifications collection
4. Local push notification is sent immediately
5. User sees notification confirming their game is listed

## Notification Flow
```
User Action → Service Layer → notificationService.notify()
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
        Create Firestore Document        Send Local Push Notification
        (for NotificationScreen)         (immediate feedback)
```

## Testing

### Test Challenge Notifications
1. Go to Challenges screen
2. Tap the "+" button to create a challenge
3. Fill in challenge details
4. Submit the challenge
5. Check for notification: "Challenge Created! 🏆"

### Test Squad Builder Notifications
1. Go to a venue and book a slot
2. Enable "Need Players?" toggle
3. Set number of players needed
4. Complete the booking
5. Check for notification: "Game Listed on Squad Builder! 🎮"

## Deploy Firestore Index

Run the deployment script to create the required index:
```bash
deploy-firestore-indexes.bat
```

Or manually:
```bash
firebase deploy --only firestore:indexes
```

The index will take a few minutes to build. Once complete, notifications will load without errors.

## Files Modified
- `src/services/challengeService.js` - Added challenge creation notification
- `src/services/firebaseAPI.js` - Added squad builder game notification
- `firestore.indexes.json` - Added notifications index
- `deploy-firestore-indexes.bat` - Created deployment script

## Notes
- Notifications are sent using the existing `notificationService`
- Both Firestore documents and local push notifications are created
- Errors in notification sending don't block the main action (challenge/booking creation)
- Users can view all notifications in the NotificationScreen
- Tapping notifications navigates to the relevant screen

## Next Steps
1. Deploy the Firestore index
2. Test both notification types
3. Consider adding more notification types for other events (challenge accepted, game full, etc.)
