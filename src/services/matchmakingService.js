import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, serverTimestamp, getDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { emailService } from './emailService';
import { notificationService } from './notificationService';

const bookingsRef = collection(db, 'bookings');
const notificationsRef = collection(db, 'notifications');
const usersRef = collection(db, 'users');

export const matchmakingService = {
    /**
     * Get all games that need players
     */
    getOpenGames: async (sport = null) => {
        try {
            console.log('🏸 Matchmaking: Fetching open games...');
            let q = query(
                bookingsRef,
                where('needPlayers', '==', true),
                where('status', '==', 'confirmed')
            );

            if (sport && sport !== 'All') {
                q = query(q, where('sport', '==', sport));
            }

            const snapshot = await getDocs(q);
            const games = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter out games that are already full or in the past
            const now = new Date();
            const availableGames = games.filter(game => {
                const isFull = (game.playersJoined?.length || 0) >= game.playersNeeded;
                const gameDate = new Date(game.dateTime);
                const isPast = gameDate < now;
                return !isFull && !isPast;
            });

            console.log(`✅ Matchmaking: Found ${availableGames.length} available games`);
            return availableGames;
        } catch (error) {
            console.error('❌ Matchmaking: Error fetching games:', error);
            throw error;
        }
    },

    /**
     * Join a game
     */
    joinGame: async (bookingId, user, paymentData) => {
        try {
            console.log(`🤝 Matchmaking: User ${user.uid} joining game ${bookingId}`);

            const bookingDocRef = doc(db, 'bookings', bookingId);
            const bookingSnap = await getDoc(bookingDocRef);

            if (!bookingSnap.exists()) {
                throw new Error('Game not found');
            }

            const gameData = bookingSnap.data();

            // Check if user already joined
            const alreadyJoined = gameData.playersJoined?.some(p => p.uid === user.uid);
            if (alreadyJoined) {
                throw new Error('You have already joined this game');
            }

            // Check if game is full
            if ((gameData.playersJoined?.length || 0) >= gameData.playersNeeded) {
                throw new Error('This game is already full');
            }

            const participant = {
                uid: user.uid,
                name: user.fullName || user.displayName || 'Player',
                photoURL: user.photoURL || null,
                joinedAt: new Date().toISOString(),
                paidAmount: gameData.slotPricePerPlayer,
                paymentStatus: 'paid',
                paymentMethod: paymentData?.method || 'unknown'
            };

            await updateDoc(bookingDocRef, {
                playersJoined: arrayUnion(participant),
                updatedAt: serverTimestamp()
            });

            // Send notification to organizer
            await addDoc(notificationsRef, {
                userId: gameData.userId,
                type: 'squad',
                title: 'New Player Joined! 🎉',
                message: `${participant.name} joined your game at ${gameData.turfName}`,
                icon: 'group-add',
                data: {
                    bookingId: bookingId,
                    playerName: participant.name,
                    turfName: gameData.turfName
                },
                read: false,
                createdAt: serverTimestamp()
            });

            // Send local push notification
            try {
                await notificationService.sendLocalNotification({
                    title: 'New Player Joined! 🎉',
                    body: `${participant.name} joined your game at ${gameData.turfName}`,
                    data: { type: 'squad', bookingId },
                });
            } catch (pushErr) {
                console.log('⚠️ Local push failed:', pushErr);
            }

            // Send email to organizer
            try {
                const organizerDoc = await getDoc(doc(usersRef, gameData.userId));
                if (organizerDoc.exists()) {
                    const organizerData = organizerDoc.data();
                    if (organizerData.email) {
                        const currentPlayers = (gameData.numberOfPlayers || 1) + (gameData.playersJoined?.length || 0) + 1;
                        const totalPlayers = (gameData.numberOfPlayers || 1) + (gameData.playersNeeded || 0);

                        await emailService.sendSquadPlayerJoinedEmail(
                            {
                                turfName: gameData.turfName,
                                dateTime: gameData.dateTime,
                                startTime: gameData.startTime,
                                endTime: gameData.endTime,
                                currentPlayers,
                                totalPlayers
                            },
                            {
                                name: organizerData.fullName || organizerData.displayName,
                                email: organizerData.email
                            },
                            {
                                name: participant.name
                            }
                        );
                        console.log('✅ Matchmaking: Email sent to organizer');
                    }
                }
            } catch (emailError) {
                console.error('⚠️ Matchmaking: Failed to send email to organizer:', emailError);
                // Don't fail the join if email fails
            }

            // Send confirmation email to player
            try {
                const playerDoc = await getDoc(doc(usersRef, user.uid));
                if (playerDoc.exists()) {
                    const playerData = playerDoc.data();
                    if (playerData.email) {
                        const currentPlayers = (gameData.numberOfPlayers || 1) + (gameData.playersJoined?.length || 0) + 1;
                        const totalPlayers = (gameData.numberOfPlayers || 1) + (gameData.playersNeeded || 0);

                        await emailService.sendSquadJoinConfirmationEmail(
                            {
                                turfName: gameData.turfName,
                                dateTime: gameData.dateTime,
                                startTime: gameData.startTime,
                                endTime: gameData.endTime,
                                pricePerPlayer: gameData.slotPricePerPlayer,
                                currentPlayers,
                                totalPlayers,
                                organizerName: gameData.userName
                            },
                            {
                                name: playerData.fullName || playerData.displayName,
                                email: playerData.email
                            }
                        );
                        console.log('✅ Matchmaking: Confirmation email sent to player');
                    }
                }
            } catch (emailError) {
                console.error('⚠️ Matchmaking: Failed to send confirmation email to player:', emailError);
                // Don't fail the join if email fails
            }

            console.log('✅ Matchmaking: Joined game successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Matchmaking: Error joining game:', error);
            throw error;
        }
    },

    /**
     * Delete a squad builder game (organizer only)
     */
    deleteGame: async (bookingId, userId) => {
        try {
            console.log(`🗑️ Matchmaking: User ${userId} deleting game ${bookingId}`);

            const bookingDocRef = doc(db, 'bookings', bookingId);
            const bookingSnap = await getDoc(bookingDocRef);

            if (!bookingSnap.exists()) {
                throw new Error('Game not found');
            }

            const gameData = bookingSnap.data();

            // Check if user is the organizer
            if (gameData.userId !== userId) {
                throw new Error('Only the organizer can delete this game');
            }

            // Send notifications to all participants
            const participants = gameData.playersJoined || [];
            const notificationPromises = participants.map(participant =>
                addDoc(notificationsRef, {
                    userId: participant.uid,
                    type: 'squad',
                    title: 'Game Cancelled ❌',
                    message: `The game at ${gameData.turfName} on ${new Date(gameData.dateTime).toLocaleDateString()} has been cancelled by the organizer`,
                    icon: 'cancel',
                    data: {
                        bookingId: bookingId,
                        turfName: gameData.turfName,
                        organizerName: gameData.userName
                    },
                    read: false,
                    createdAt: serverTimestamp()
                })
            );

            await Promise.all(notificationPromises);

            // Send emails to all participants
            try {
                const emailPromises = participants.map(async (participant) => {
                    try {
                        const participantDoc = await getDoc(doc(usersRef, participant.uid));
                        if (participantDoc.exists()) {
                            const participantData = participantDoc.data();
                            if (participantData.email) {
                                await emailService.sendSquadGameCancelledEmail(
                                    {
                                        turfName: gameData.turfName,
                                        dateTime: gameData.dateTime,
                                        startTime: gameData.startTime,
                                        endTime: gameData.endTime,
                                        organizerName: gameData.userName
                                    },
                                    {
                                        name: participantData.fullName || participantData.displayName,
                                        email: participantData.email
                                    }
                                );
                                console.log(`✅ Matchmaking: Email sent to participant ${participant.uid}`);
                            }
                        }
                    } catch (emailError) {
                        console.error(`⚠️ Matchmaking: Failed to send email to participant ${participant.uid}:`, emailError);
                        // Continue with other emails even if one fails
                    }
                });

                await Promise.all(emailPromises);
                console.log('✅ Matchmaking: All cancellation emails sent');
            } catch (emailError) {
                console.error('⚠️ Matchmaking: Error sending cancellation emails:', emailError);
                // Don't fail the cancellation if emails fail
            }

            // Update booking to mark as cancelled instead of deleting
            await updateDoc(bookingDocRef, {
                status: 'cancelled',
                needPlayers: false,
                cancelledAt: serverTimestamp(),
                cancelledBy: userId
            });

            console.log('✅ Matchmaking: Game cancelled successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Matchmaking: Error deleting game:', error);
            throw error;
        }
    }
};
