/**
 * Migration Script: Update Existing Accepted Challenges
 * 
 * This script updates existing accepted challenges to include the
 * complete acceptedUser object for proper opponent display.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, getDoc, query, where } = require('firebase/firestore');

// Firebase configuration - update with your config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateExistingChallenges() {
  console.log('🔄 Starting migration of existing accepted challenges...\n');
  console.log('=' .repeat(70));

  try {
    // Get all accepted challenges
    const challengesRef = collection(db, 'challenges');
    const acceptedQuery = query(challengesRef, where('status', '==', 'accepted'));
    const snapshot = await getDocs(acceptedQuery);

    console.log(`\n📊 Found ${snapshot.size} accepted challenges\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const challengeDoc of snapshot.docs) {
      const challenge = challengeDoc.data();
      const challengeId = challengeDoc.id;

      console.log(`\n📝 Processing challenge: ${challengeId}`);
      console.log(`   Title: ${challenge.title || 'Untitled'}`);
      console.log(`   Creator: ${challenge.teamName || challenge.userName || 'Unknown'}`);

      // Check if acceptedUser object already exists
      if (challenge.acceptedUser && challenge.acceptedUser.id) {
        console.log(`   ✅ Already has acceptedUser object - skipping`);
        skippedCount++;
        continue;
      }

      // Check if we have opponentId to migrate
      if (!challenge.opponentId) {
        console.log(`   ⚠️  No opponentId found - cannot migrate`);
        skippedCount++;
        continue;
      }

      console.log(`   🔍 Found opponentId: ${challenge.opponentId}`);

      try {
        // Fetch opponent user data
        const userRef = doc(db, 'users', challenge.opponentId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          console.log(`   ❌ User not found in database`);
          
          // Still create acceptedUser with available data
          const acceptedUser = {
            id: challenge.opponentId,
            name: challenge.opponentName || 'Opponent',
            photoURL: null
          };

          await updateDoc(doc(db, 'challenges', challengeId), {
            acceptedUser
          });

          console.log(`   ✅ Updated with basic opponent data`);
          updatedCount++;
          continue;
        }

        const userData = userDoc.data();
        console.log(`   ✅ Found user: ${userData.displayName || userData.name || userData.email}`);

        // Create acceptedUser object
        const acceptedUser = {
          id: challenge.opponentId,
          name: userData.displayName || userData.name || userData.email || challenge.opponentName || 'Opponent',
          photoURL: userData.photoURL || null
        };

        // Update the challenge
        await updateDoc(doc(db, 'challenges', challengeId), {
          acceptedUser,
          // Also update opponentName if it was missing or different
          opponentName: acceptedUser.name
        });

        console.log(`   ✅ Successfully updated with complete opponent data`);
        console.log(`      Name: ${acceptedUser.name}`);
        console.log(`      Photo: ${acceptedUser.photoURL ? 'Yes' : 'No'}`);
        updatedCount++;

      } catch (error) {
        console.error(`   ❌ Error updating challenge: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n📊 Migration Summary:');
    console.log(`   Total challenges processed: ${snapshot.size}`);
    console.log(`   ✅ Successfully updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped (already migrated): ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    if (updatedCount > 0) {
      console.log('\n✅ Migration completed successfully!');
      console.log('   All accepted challenges now have proper opponent data.');
      console.log('   Opponent avatars and names will display correctly.');
    } else if (skippedCount === snapshot.size) {
      console.log('\n✅ All challenges already migrated - no action needed!');
    } else {
      console.log('\n⚠️  Migration completed with some issues.');
      console.log('   Check the logs above for details.');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('   Error details:', error.message);
    process.exit(1);
  }
}

// Run migration
console.log('🚀 Challenge Migration Tool');
console.log('   This will update existing accepted challenges with opponent data\n');

migrateExistingChallenges()
  .then(() => {
    console.log('\n✅ Migration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration process failed:', error);
    process.exit(1);
  });
