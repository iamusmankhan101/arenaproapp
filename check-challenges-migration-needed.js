/**
 * Check Existing Challenges - Migration Assessment
 * 
 * This script checks existing accepted challenges to see which ones
 * need migration to include the acceptedUser object.
 * 
 * This is a READ-ONLY script - it doesn't modify any data.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, query, where } = require('firebase/firestore');

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

async function checkChallenges() {
  console.log('🔍 Checking existing accepted challenges...\n');
  console.log('=' .repeat(70));

  try {
    // Get all accepted challenges
    const challengesRef = collection(db, 'challenges');
    const acceptedQuery = query(challengesRef, where('status', '==', 'accepted'));
    const snapshot = await getDocs(acceptedQuery);

    console.log(`\n📊 Found ${snapshot.size} accepted challenges\n`);

    const needsMigration = [];
    const alreadyMigrated = [];
    const noOpponentData = [];

    for (const challengeDoc of snapshot.docs) {
      const challenge = challengeDoc.data();
      const challengeId = challengeDoc.id;

      const info = {
        id: challengeId,
        title: challenge.title || 'Untitled',
        creator: challenge.teamName || challenge.userName || 'Unknown',
        hasAcceptedUser: !!(challenge.acceptedUser && challenge.acceptedUser.id),
        hasOpponentId: !!challenge.opponentId,
        hasOpponentName: !!challenge.opponentName,
        opponentId: challenge.opponentId || null,
        opponentName: challenge.opponentName || null,
        acceptedUser: challenge.acceptedUser || null
      };

      if (info.hasAcceptedUser) {
        alreadyMigrated.push(info);
      } else if (info.hasOpponentId) {
        needsMigration.push(info);
      } else {
        noOpponentData.push(info);
      }
    }

    // Display results
    console.log('\n📊 MIGRATION ASSESSMENT RESULTS\n');
    console.log('='.repeat(70));

    console.log(`\n✅ Already Migrated (${alreadyMigrated.length} challenges):`);
    if (alreadyMigrated.length > 0) {
      alreadyMigrated.forEach(c => {
        console.log(`   • ${c.title}`);
        console.log(`     Creator: ${c.creator}`);
        console.log(`     Opponent: ${c.acceptedUser.name}`);
        console.log(`     Photo: ${c.acceptedUser.photoURL ? 'Yes' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('   None - all challenges need migration\n');
    }

    console.log(`\n🔄 Needs Migration (${needsMigration.length} challenges):`);
    if (needsMigration.length > 0) {
      needsMigration.forEach(c => {
        console.log(`   • ${c.title}`);
        console.log(`     Creator: ${c.creator}`);
        console.log(`     Opponent ID: ${c.opponentId}`);
        console.log(`     Opponent Name: ${c.opponentName || 'Not set'}`);
        console.log('');
      });
    } else {
      console.log('   None - all challenges already have acceptedUser object\n');
    }

    console.log(`\n⚠️  Missing Opponent Data (${noOpponentData.length} challenges):`);
    if (noOpponentData.length > 0) {
      noOpponentData.forEach(c => {
        console.log(`   • ${c.title}`);
        console.log(`     Creator: ${c.creator}`);
        console.log(`     Issue: No opponentId found - cannot migrate`);
        console.log('');
      });
    } else {
      console.log('   None - all accepted challenges have opponent data\n');
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n📋 SUMMARY:');
    console.log(`   Total accepted challenges: ${snapshot.size}`);
    console.log(`   ✅ Already migrated: ${alreadyMigrated.length}`);
    console.log(`   🔄 Need migration: ${needsMigration.length}`);
    console.log(`   ⚠️  Missing data: ${noOpponentData.length}`);

    if (needsMigration.length > 0) {
      console.log('\n💡 RECOMMENDATION:');
      console.log('   Run the migration script to update these challenges:');
      console.log('   node migrate-existing-challenges.js');
    } else if (alreadyMigrated.length === snapshot.size) {
      console.log('\n✅ GOOD NEWS:');
      console.log('   All challenges already have proper opponent data!');
      console.log('   No migration needed.');
    }

    console.log('\n📝 NOTE:');
    console.log('   The current code already has fallback logic, so existing');
    console.log('   challenges will still display (using opponentName), but');
    console.log('   migration will ensure consistent data structure and enable');
    console.log('   proper avatar display.');

  } catch (error) {
    console.error('\n❌ Check failed:', error);
    console.error('   Error details:', error.message);
    process.exit(1);
  }
}

// Run check
console.log('🔍 Challenge Migration Assessment Tool');
console.log('   This will check which challenges need migration (READ-ONLY)\n');

checkChallenges()
  .then(() => {
    console.log('\n✅ Assessment completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Assessment failed:', error);
    process.exit(1);
  });
