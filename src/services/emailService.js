import { API_URL } from '../config/apiConfig';

/**
 * Backend Email Service
 * Sends emails through the backend API using Nodemailer
 */

export const emailService = {
    /**
     * Sends a booking confirmation email
     * @param {Object} details - Booking details
     * @param {Object} user - User details
     */
    sendBookingConfirmation: async (details, user) => {
        console.log('📧 Sending Booking Confirmation via Backend...');
        try {
            const response = await fetch(`${API_URL}/notifications/booking-confirmation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookingDetails: {
                        bookingId: details.bookingId,
                        turfName: details.turfName,
                        date: details.date,
                        timeSlot: details.timeSlot,
                        totalAmount: details.totalAmount,
                        turfAddress: details.turfAddress
                    },
                    userEmail: user.email,
                    userName: user.name || user.fullName
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Booking confirmation email sent');
                return { success: true };
            } else {
                console.error('❌ Failed to send booking confirmation:', result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('❌ Email service error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Sends a challenge acceptance email to the Creator
     * @param {Object} challenge - Challenge details
     * @param {Object} acceptorTeam - Team accepting the challenge
     * @param {Object} creator - Creator details
     */
    sendChallengeAcceptanceToCreator: async (challenge, acceptorTeam, creator) => {
        console.log('📧 Sending Challenge Acceptance to Creator via Backend...');
        try {
            const response = await fetch(`${API_URL}/notifications/challenge-acceptance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    challenge: {
                        title: challenge.title,
                        sport: challenge.sport,
                        proposedDateTime: challenge.proposedDateTime,
                        venue: challenge.venue
                    },
                    acceptorTeam: {
                        name: acceptorTeam.name
                    },
                    creatorEmail: creator.email,
                    creatorName: creator.fullName
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Challenge acceptance email sent');
                return { success: true };
            } else {
                console.error('❌ Failed to send challenge acceptance:', result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('❌ Email service error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Sends a challenge joined confirmation to the Acceptor
     * @param {Object} challenge - Challenge details
     * @param {Object} user - Acceptor user details
     */
    sendChallengeJoinConfirmation: async (challenge, user) => {
        console.log('📧 Sending Challenge Join Confirmation via Backend...');
        // This can be implemented later if needed
        return { success: true };
    },

    /**
     * Sends email to organizer when a player joins their Squad Builder game
     * @param {Object} gameDetails - Game details
     * @param {Object} organizer - Organizer details
     * @param {Object} player - Player who joined
     */
    sendSquadPlayerJoinedEmail: async (gameDetails, organizer, player) => {
        console.log('📧 Sending Squad Player Joined Email to Organizer via Backend...');
        try {
            const response = await fetch(`${API_URL}/notifications/squad-player-joined`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameDetails: {
                        turfName: gameDetails.turfName,
                        dateTime: gameDetails.dateTime,
                        startTime: gameDetails.startTime,
                        endTime: gameDetails.endTime,
                        currentPlayers: gameDetails.currentPlayers,
                        totalPlayers: gameDetails.totalPlayers
                    },
                    organizerEmail: organizer.email,
                    organizerName: organizer.name,
                    playerName: player.name
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Squad player joined email sent');
                return { success: true };
            } else {
                console.error('❌ Failed to send squad player joined email:', result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('❌ Email service error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Sends email to participants when organizer cancels a Squad Builder game
     * @param {Object} gameDetails - Game details
     * @param {Object} participant - Participant details
     */
    sendSquadGameCancelledEmail: async (gameDetails, participant) => {
        console.log('📧 Sending Squad Game Cancelled Email to Participant via Backend...');
        try {
            const response = await fetch(`${API_URL}/notifications/squad-game-cancelled`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameDetails: {
                        turfName: gameDetails.turfName,
                        dateTime: gameDetails.dateTime,
                        startTime: gameDetails.startTime,
                        endTime: gameDetails.endTime,
                        organizerName: gameDetails.organizerName
                    },
                    participantEmail: participant.email,
                    participantName: participant.name
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Squad game cancelled email sent');
                return { success: true };
            } else {
                console.error('❌ Failed to send squad game cancelled email:', result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('❌ Email service error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Sends confirmation email to player when they join a Squad Builder game
     * @param {Object} gameDetails - Game details
     * @param {Object} player - Player details
     */
    sendSquadJoinConfirmationEmail: async (gameDetails, player) => {
        console.log('📧 Sending Squad Join Confirmation Email to Player via Backend...');
        try {
            const response = await fetch(`${API_URL}/notifications/squad-join-confirmation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameDetails: {
                        turfName: gameDetails.turfName,
                        dateTime: gameDetails.dateTime,
                        startTime: gameDetails.startTime,
                        endTime: gameDetails.endTime,
                        pricePerPlayer: gameDetails.pricePerPlayer,
                        currentPlayers: gameDetails.currentPlayers,
                        totalPlayers: gameDetails.totalPlayers,
                        organizerName: gameDetails.organizerName
                    },
                    playerEmail: player.email,
                    playerName: player.name
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Squad join confirmation email sent');
                return { success: true };
            } else {
                console.error('❌ Failed to send squad join confirmation email:', result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('❌ Email service error:', error);
            return { success: false, error: error.message };
        }
    }
};
