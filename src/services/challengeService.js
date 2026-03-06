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
    acceptChallenge: async (challengeId, opponentId, opponentName, opponentData = {}, acceptAsTeam = false, teamData = null) => {
        try {
            const { arrayUnion } = require('firebase/firestore');
            const challengeDocRef = doc(db, 'challenges', challengeId);

            // Get challenge data first
            const challengeSnap = await getDoc(challengeDocRef);
            const challengeData = challengeSnap.exists() ? challengeSnap.data() : null;

            if (!challengeData) {
                return { success: false, error: 'Challenge not found' };
            }

            // Check if this is a team vs team challenge
            const isTeamChallenge = challengeData.creatorTeam?.isIndividual === false;
            
            // If creator created as team, opponent must also accept as team
            if (isTeamChallenge && !acceptAsTeam) {
                return { success: false, error: 'This is a team challenge. You must accept as a team.' };
            }

            // If creator created as individual, handle individual player joining
            if (!isTeamChallenge) {
                // Individual challenge logic
                let totalSpots, creatorCount, neededPlayers;
                
                // First check if custom player counts are specified (takes priority)
                const hasCustomCounts = challengeData.currentPlayers || challengeData.needPlayers;
                
                if (hasCustomCounts) {
                    creatorCount = parseInt(challengeData.currentPlayers) || 0;
                    neededPlayers = parseInt(challengeData.needPlayers) || 0;
                    totalSpots = creatorCount + neededPlayers;
                } else if (challengeData.sport === 'Padel' && challengeData.format) {
                    // Use Padel format defaults only if no custom counts
                    if (challengeData.format === '1v1') {
                        totalSpots = 2;
                        creatorCount = 1;
                        neededPlayers = 1;
                    } else if (challengeData.format === '2v2') {
                        totalSpots = 4;
                        creatorCount = 2;
                        neededPlayers = 2;
                    }
                } else {
                    // Default fallback
                    creatorCount = 1;
                    neededPlayers = 1;
                    totalSpots = 2;
                }

                const participants = challengeData.participants || [];
                const filledSpots = creatorCount + participants.length;
                const availableSpots = neededPlayers - participants.length;

                if (availableSpots <= 0) {
                    return { success: false, error: 'No spots available' };
                }

                const alreadyJoined = participants.some(p => p.id === opponentId);
                if (alreadyJoined) {
                    return { success: false, error: 'You have already joined this challenge' };
                }

                // Add individual player to participants
                const newParticipant = {
                    id: opponentId,
                    name: opponentName,
                    photoURL: opponentData.photoURL || null,
                    phoneNumber: opponentData.phoneNumber || null,
                    joinedAt: new Date().toISOString()
                };

                console.log('👤 Adding participant to challenge:', {
                    challengeId,
                    participant: newParticipant,
                    hasPhoneNumber: !!newParticipant.phoneNumber
                });

                const willBeFull = availableSpots === 1;

                await updateDoc(challengeDocRef, {
                    participants: arrayUnion(newParticipant),
                    status: willBeFull ? 'accepted' : 'open',
                    ...(willBeFull && {
                        acceptedUser: newParticipant,
                        opponentId,
                        opponentName,
                        matchedAt: serverTimestamp()
                    })
                });

                // Notify the challenge creator
                if (challengeData?.challengerId) {
                    try {
                        await notificationService.notify({
                            userId: challengeData.challengerId,
                            type: 'challenge',
                            title: willBeFull ? 'Challenge Full! 🏆' : 'Player Joined! 👥',
                            message: `${opponentName} has joined your ${challengeData.sport || ''} challenge!${willBeFull ? ' All spots filled!' : ` ${availableSpots - 1} spot${availableSpots - 1 > 1 ? 's' : ''} left.`}`,
                            icon: 'sports-soccer',
                            data: { challengeId },
                        });
                    } catch (notifError) {
                        console.error('⚠️ Failed to send challenge accepted notification:', notifError);
                    }
                }

                return { success: true };
            } else {
                // Team vs Team challenge logic
                if (!teamData) {
                    return { success: false, error: 'Team data is required for team challenges' };
                }

                // Check if team already accepted
                if (challengeData.status === 'accepted') {
                    return { success: false, error: 'This challenge has already been accepted by another team' };
                }

                // Accept as team (full team vs team match)
                const acceptedTeam = {
                    id: teamData.id,
                    name: teamData.name,
                    avatar: teamData.avatar || null,
                    wins: teamData.wins || 0,
                    losses: teamData.losses || 0,
                    draws: teamData.draws || 0,
                    eloRating: teamData.eloRating || 1200,
                    fairPlayScore: teamData.fairPlayScore || 5.0,
                    captain: teamData.captain || opponentName,
                    phoneNumber: opponentData.phoneNumber || null,
                };

                console.log('🏆 Team accepting challenge:', {
                    challengeId,
                    team: acceptedTeam,
                    hasPhoneNumber: !!acceptedTeam.phoneNumber
                });

                await updateDoc(challengeDocRef, {
                    status: 'accepted',
                    acceptedTeam: acceptedTeam,
                    opponentId: teamData.id,
                    opponentName: teamData.name,
                    opponentTeamName: teamData.name,
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
                            message: `${teamData.name} has accepted your team challenge!`,
                            icon: 'sports-soccer',
                            data: { challengeId },
                        });
                    } catch (notifError) {
                        console.error('⚠️ Failed to send challenge accepted notification:', notifError);
                    }
                }

                return { success: true };
            }
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
