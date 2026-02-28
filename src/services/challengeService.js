import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { notificationService } from './notificationService';

// Collection reference
const challengesRef = collection(db, 'challenges');
const usersRef = collection(db, 'users');

export const challengeService = {

    // Create a new challenge
    createChallenge: async (challengeData) => {
        try {
            const docRef = await addDoc(challengesRef, {
                ...challengeData,
                status: 'open',
                createdAt: serverTimestamp(),
            });
            
            // Send notification to the creator
            if (challengeData.challengerId) {
                try {
                    await notificationService.notify({
                        userId: challengeData.challengerId,
                        type: 'challenge',
                        title: 'Challenge Created! 🏆',
                        message: `Your challenge "${challengeData.title}" is now live and visible to other players!`,
                        icon: 'emoji-events',
                        data: { challengeId: docRef.id }
                    });
                } catch (notifError) {
                    console.log('⚠️ Failed to send challenge creation notification:', notifError);
                }
            }
            
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error("Error creating challenge:", error);
            return { success: false, error: error.message };
        }
    },

    // Fetch open challenges (can filter by sport)
    getOpenChallenges: async (sport = null) => {
        try {
            let q = query(
                challengesRef,
                orderBy('createdAt', 'desc')
            );

            if (sport) {
                q = query(challengesRef, where('sport', '==', sport), orderBy('createdAt', 'desc'));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching challenges:", error);
            return [];
        }
    },

    // Get single challenge by ID
    getChallengeById: async (challengeId) => {
        try {
            const docRef = doc(db, 'challenges', challengeId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching challenge details:", error);
            return null;
        }
    },

    // Accept a challenge
    acceptChallenge: async (challengeId, opponentId, opponentName, opponentData = {}) => {
        try {
            const challengeDocRef = doc(db, 'challenges', challengeId);

            // Get challenge data first to notify the creator
            const challengeSnap = await getDoc(challengeDocRef);
            const challengeData = challengeSnap.exists() ? challengeSnap.data() : null;

            await updateDoc(challengeDocRef, {
                status: 'accepted',
                opponentId,
                opponentName,
                acceptedUser: {
                    id: opponentId,
                    name: opponentName,
                    photoURL: opponentData.photoURL || null,
                },
                matchedAt: serverTimestamp()
            });

            // Notify the challenge creator
            if (challengeData?.challengerId) {
                try {
                    await notificationService.notify({
                        userId: challengeData.challengerId,
                        type: 'challenge',
                        title: 'Challenge Accepted! 🏆',
                        message: `${opponentName} has accepted your ${challengeData.sport || ''} challenge!`,
                        icon: 'sports-soccer',
                        data: { challengeId },
                    });
                } catch (notifError) {
                    console.error('⚠️ Failed to send challenge accepted notification:', notifError);
                }
            }

            return { success: true };
        } catch (error) {
            console.error("Error accepting challenge:", error);
            return { success: false, error: error.message };
        }
    },

    // Update User's Team Profile
    updateTeamProfile: async (userId, teamProfile) => {
        try {
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, {
                teamProfile: {
                    ...teamProfile,
                    updatedAt: serverTimestamp()
                }
            });
            return { success: true };
        } catch (error) {
            console.error("Error updating team profile:", error);
            return { success: false, error: error.message };
        }
    },

    // Join a Tournament
    joinTournament: async (challengeId, teamId, teamProfile) => {
        try {
            const challengeRef = doc(db, 'challenges', challengeId);
            // using arrayUnion to add team to participants array
            // We must import arrayUnion from firebase/firestore
            const { arrayUnion } = require('firebase/firestore');

            await updateDoc(challengeRef, {
                participants: arrayUnion({
                    id: teamId,
                    name: teamProfile.name,
                    avatar: teamProfile.avatar || null,
                    joinedAt: new Date().toISOString()
                })
            });
            return { success: true };
        } catch (error) {
            console.error("Error joining tournament:", error);
            return { success: false, error: error.message };
        }
    },

    // Get User's Challenges
    getUserChallenges: async (userId) => {
        try {
            // Challenges created by user
            const createdQuery = query(challengesRef, where('challengerId', '==', userId), orderBy('createdAt', 'desc'));
            const createdSnapshot = await getDocs(createdQuery);

            // Challenges accepted by user
            const acceptedQuery = query(challengesRef, where('opponentId', '==', userId), orderBy('createdAt', 'desc'));
            const acceptedSnapshot = await getDocs(acceptedQuery);

            const created = createdSnapshot.docs.map(doc => ({ id: doc.id, role: 'challenger', ...doc.data() }));
            const accepted = acceptedSnapshot.docs.map(doc => ({ id: doc.id, role: 'opponent', ...doc.data() }));

            return [...created, ...accepted].sort((a, b) => b.createdAt - a.createdAt);
        } catch (error) {
            console.error("Error fetching user challenges:", error);
            return [];
        }
    },

    // Delete a Challenge
    deleteChallenge: async (challengeId) => {
        try {
            const challengeRef = doc(db, 'challenges', challengeId);
            await deleteDoc(challengeRef);
            return { success: true };
        } catch (error) {
            console.error("Error deleting challenge:", error);
            return { success: false, error: error.message };
        }
    }
};
