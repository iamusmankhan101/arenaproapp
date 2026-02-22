import { collection, query, where, getDocs, doc, getDoc, updateDoc, increment, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Verify if a referral code is valid
 * @param {string} referralCode - The referral code to verify
 * @returns {Promise<{valid: boolean, referrerId: string|null, referrerName: string|null}>}
 */
export const verifyReferralCode = async (referralCode) => {
  try {
    if (!referralCode || !referralCode.trim()) {
      return { valid: false, referrerId: null, referrerName: null };
    }

    const normalizedCode = referralCode.trim().toUpperCase();
    console.log('🔍 Verifying referral code:', normalizedCode);

    // Query users collection for matching referral code
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('myReferralCode', '==', normalizedCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('❌ Referral code not found:', normalizedCode);
      return { valid: false, referrerId: null, referrerName: null };
    }

    const referrerDoc = querySnapshot.docs[0];
    const referrerData = referrerDoc.data();

    // Check if referrer has completed at least one booking
    if (!referrerData.hasCompletedFirstBooking) {
      console.log('❌ Referrer has not completed first booking yet');
      return { valid: false, referrerId: null, referrerName: null };
    }

    console.log('✅ Valid referral code from:', referrerData.fullName);
    return {
      valid: true,
      referrerId: referrerDoc.id,
      referrerName: referrerData.fullName || referrerData.displayName
    };
  } catch (error) {
    console.error('❌ Error verifying referral code:', error);
    return { valid: false, referrerId: null, referrerName: null };
  }
};

/**
 * Process referral reward when new user completes first booking
 * @param {string} userId - The new user's ID
 * @returns {Promise<boolean>}
 */
export const processReferralReward = async (userId) => {
  try {
    console.log('🎁 Processing referral reward for user:', userId);

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log('❌ User not found');
      return false;
    }

    const userData = userDoc.data();

    // Check if user was referred and hasn't received reward yet
    if (!userData.referredBy || userData.referralStatus !== 'PENDING') {
      console.log('ℹ️ User was not referred or reward already processed');
      return false;
    }

    const referrerRef = doc(db, 'users', userData.referredBy);
    const referrerDoc = await getDoc(referrerRef);

    if (!referrerDoc.exists()) {
      console.log('❌ Referrer not found');
      return false;
    }

    // Reward amounts
    const REFERRER_REWARD = 200; // PKR 200 for referrer (discount on next booking)
    const REFEREE_REWARD = 200;  // PKR 200 for new user (discount on first booking)

    // Update referrer's wallet and stats
    await updateDoc(referrerRef, {
      walletBalance: increment(REFERRER_REWARD),
      'stats.totalReferrals': increment(1),
      referralHistory: arrayUnion({
        userId: userId,
        userName: userData.fullName,
        reward: REFERRER_REWARD,
        date: new Date().toISOString(),
        status: 'COMPLETED'
      }),
      updatedAt: serverTimestamp()
    });

    // Update new user's wallet and referral status
    await updateDoc(userRef, {
      walletBalance: increment(REFEREE_REWARD),
      referralStatus: 'COMPLETED',
      referralRewardReceived: true,
      referralRewardAmount: REFEREE_REWARD,
      referralRewardDate: new Date().toISOString(),
      updatedAt: serverTimestamp()
    });

    console.log('✅ Referral rewards processed successfully');
    console.log(`   Referrer received: PKR ${REFERRER_REWARD}`);
    console.log(`   New user received: PKR ${REFEREE_REWARD}`);

    return true;
  } catch (error) {
    console.error('❌ Error processing referral reward:', error);
    return false;
  }
};

/**
 * Get referral statistics for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>}
 */
export const getReferralStats = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return {
        myReferralCode: null,
        totalReferrals: 0,
        totalEarned: 0,
        referralHistory: []
      };
    }

    const userData = userDoc.data();

    return {
      myReferralCode: userData.myReferralCode || null,
      totalReferrals: userData.stats?.totalReferrals || 0,
      totalEarned: userData.referralHistory?.reduce((sum, ref) => sum + (ref.reward || 0), 0) || 0,
      referralHistory: userData.referralHistory || []
    };
  } catch (error) {
    console.error('❌ Error getting referral stats:', error);
    return {
      myReferralCode: null,
      totalReferrals: 0,
      totalEarned: 0,
      referralHistory: []
    };
  }
};
