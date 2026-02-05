/**
 * Referral Service
 * Handles all referral-related operations with Firebase
 */

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    increment,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
    validateReferralCodeFormat,
    normalizeReferralCode,
    REFERRAL_CONSTANTS
} from '../utils/referralUtils';

/**
 * Verify if a referral code exists and get the referrer's user ID
 * @param {string} code - Referral code to verify
 * @returns {Promise<{valid: boolean, referrerId: string|null, referrerName: string|null}>}
 */
export const verifyReferralCode = async (code) => {
    try {
        // Validate format first
        const normalizedCode = normalizeReferralCode(code);
        if (!validateReferralCodeFormat(normalizedCode)) {
            return { valid: false, referrerId: null, referrerName: null };
        }

        // Query Firestore for user with this referral code
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('myReferralCode', '==', normalizedCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log('❌ Referral code not found:', normalizedCode);
            return { valid: false, referrerId: null, referrerName: null };
        }

        // Get the first matching user (should be unique)
        const referrerDoc = querySnapshot.docs[0];
        const referrerData = referrerDoc.data();

        console.log('✅ Referral code verified:', normalizedCode, 'Referrer:', referrerData.fullName);
        return {
            valid: true,
            referrerId: referrerDoc.id,
            referrerName: referrerData.fullName || 'User',
        };
    } catch (error) {
        console.error('❌ Error verifying referral code:', error);
        return { valid: false, referrerId: null, referrerName: null };
    }
};

/**
 * Apply referral reward to referrer's wallet
 * @param {string} referrerId - ID of the user who referred
 * @param {string} refereeId - ID of the user who was referred
 * @param {string} refereeName - Name of the user who was referred
 * @returns {Promise<{success: boolean, newBalance: number}>}
 */
export const applyReferralReward = async (referrerId, refereeId, refereeName) => {
    try {
        console.log('💰 Applying referral reward to:', referrerId, 'for referring:', refereeName);

        const referrerRef = doc(db, 'users', referrerId);

        // Create referral history entry
        const referralEntry = {
            userId: refereeId,
            userName: refereeName,
            completedAt: new Date().toISOString(),
            rewardAmount: REFERRAL_CONSTANTS.REFERRER_REWARD,
        };

        // Update referrer's wallet and add to referral history
        await updateDoc(referrerRef, {
            walletBalance: increment(REFERRAL_CONSTANTS.REFERRER_REWARD),
            referralHistory: arrayUnion(referralEntry),
            updatedAt: serverTimestamp(),
        });

        // Get updated balance
        const updatedDoc = await getDoc(referrerRef);
        const newBalance = updatedDoc.data()?.walletBalance || REFERRAL_CONSTANTS.REFERRER_REWARD;

        console.log('✅ Referral reward applied. New balance:', newBalance);
        return { success: true, newBalance };
    } catch (error) {
        console.error('❌ Error applying referral reward:', error);
        return { success: false, newBalance: 0 };
    }
};

/**
 * Mark referral as completed (called after first booking)
 * @param {string} userId - ID of the user who completed first booking
 * @returns {Promise<boolean>}
 */
export const markReferralCompleted = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            referralStatus: 'COMPLETED',
            hasCompletedFirstBooking: true,
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Referral marked as completed for user:', userId);
        return true;
    } catch (error) {
        console.error('❌ Error marking referral as completed:', error);
        return false;
    }
};

/**
 * Get referral history for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of referral history entries
 */
export const getReferralHistory = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return [];
        }

        const userData = userDoc.data();
        return userData.referralHistory || [];
    } catch (error) {
        console.error('❌ Error getting referral history:', error);
        return [];
    }
};

/**
 * Get wallet balance for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Wallet balance
 */
export const getWalletBalance = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return 0;
        }

        const userData = userDoc.data();
        return userData.walletBalance || 0;
    } catch (error) {
        console.error('❌ Error getting wallet balance:', error);
        return 0;
    }
};

/**
 * Add credit to user's wallet
 * @param {string} userId - User ID
 * @param {number} amount - Amount to add
 * @param {string} reason - Reason for credit
 * @returns {Promise<{success: boolean, newBalance: number}>}
 */
export const addWalletCredit = async (userId, amount, reason = 'Credit added') => {
    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            walletBalance: increment(amount),
            updatedAt: serverTimestamp(),
        });

        // Get updated balance
        const updatedDoc = await getDoc(userRef);
        const newBalance = updatedDoc.data()?.walletBalance || amount;

        console.log(`✅ Added Rs. ${amount} to wallet. Reason: ${reason}. New balance: ${newBalance}`);
        return { success: true, newBalance };
    } catch (error) {
        console.error('❌ Error adding wallet credit:', error);
        return { success: false, newBalance: 0 };
    }
};

/**
 * Deduct amount from user's wallet
 * @param {string} userId - User ID
 * @param {number} amount - Amount to deduct
 * @returns {Promise<{success: boolean, newBalance: number}>}
 */
export const deductWalletBalance = async (userId, amount) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return { success: false, newBalance: 0 };
        }

        const currentBalance = userDoc.data()?.walletBalance || 0;

        // Don't allow negative balance
        if (currentBalance < amount) {
            console.warn('⚠️ Insufficient wallet balance');
            return { success: false, newBalance: currentBalance };
        }

        await updateDoc(userRef, {
            walletBalance: increment(-amount),
            updatedAt: serverTimestamp(),
        });

        const newBalance = currentBalance - amount;
        console.log(`✅ Deducted Rs. ${amount} from wallet. New balance: ${newBalance}`);
        return { success: true, newBalance };
    } catch (error) {
        console.error('❌ Error deducting wallet balance:', error);
        return { success: false, newBalance: 0 };
    }
};

/**
 * Get referral statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<{totalReferrals: number, pendingReferrals: number, completedReferrals: number, totalEarned: number}>}
 */
export const getReferralStats = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return {
                totalReferrals: 0,
                pendingReferrals: 0,
                completedReferrals: 0,
                totalEarned: 0,
            };
        }

        const userData = userDoc.data();
        const referralHistory = userData.referralHistory || [];

        // Count pending referrals (users who signed up but haven't completed first booking)
        const usersRef = collection(db, 'users');
        const pendingQuery = query(
            usersRef,
            where('referredBy', '==', userId),
            where('referralStatus', '==', 'PENDING')
        );
        const pendingSnapshot = await getDocs(pendingQuery);

        const completedReferrals = referralHistory.length;
        const pendingReferrals = pendingSnapshot.size;
        const totalReferrals = completedReferrals + pendingReferrals;
        const totalEarned = completedReferrals * REFERRAL_CONSTANTS.REFERRER_REWARD;

        return {
            totalReferrals,
            pendingReferrals,
            completedReferrals,
            totalEarned,
        };
    } catch (error) {
        console.error('❌ Error getting referral stats:', error);
        return {
            totalReferrals: 0,
            pendingReferrals: 0,
            completedReferrals: 0,
            totalEarned: 0,
        };
    }
};

export default {
    verifyReferralCode,
    applyReferralReward,
    markReferralCompleted,
    getReferralHistory,
    getWalletBalance,
    addWalletCredit,
    deductWalletBalance,
    getReferralStats,
};
