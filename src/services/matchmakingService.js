import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const bookingsRef = collection(db, 'bookings');

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
                joinedAt: new Date().toISOString(),
                paidAmount: gameData.slotPricePerPlayer,
                paymentStatus: 'paid', // Assuming payment is handled before calling this
                paymentMethod: paymentData?.method || 'unknown'
            };

            await updateDoc(bookingDocRef, {
                playersJoined: arrayUnion(participant),
                updatedAt: serverTimestamp()
            });

            console.log('✅ Matchmaking: Joined game successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Matchmaking: Error joining game:', error);
            throw error;
        }
    }
};
