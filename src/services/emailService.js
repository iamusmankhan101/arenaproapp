import Constants from 'expo-constants';

const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

// Helper to send email via EmailJS REST API
const sendEmailJS = async (templateParams, specificTemplateId = null) => {
    // Get credentials from expo-constants (bundled in APK)
    const serviceId = Constants.expoConfig?.extra?.emailjs?.serviceId;
    const templateId = specificTemplateId || Constants.expoConfig?.extra?.emailjs?.templateId;
    const userId = Constants.expoConfig?.extra?.emailjs?.userId;

    // Debug logging
    console.log('📧 EmailJS Config Check:', {
        serviceId: serviceId ? '✅ SET' : '❌ MISSING',
        templateId: templateId ? '✅ SET' : '❌ MISSING',
        userId: userId ? '✅ SET' : '❌ MISSING'
    });

    if (!serviceId || !templateId || !userId) {
        console.warn('⚠️ EmailJS: Missing configuration. Emails will not be sent.');
        console.warn('⚠️ Check app.json extra.emailjs configuration');
        return { success: false, error: 'Missing configuration' };
    }

    const payload = {
        service_id: serviceId,
        template_id: templateId,
        user_id: userId,
        template_params: templateParams
    };

    try {
        console.log('📤 EmailJS: Sending request to:', EMAILJS_API_URL);
        
        const response = await fetch(EMAILJS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('✅ EmailJS: Email sent successfully!');
            return { success: true };
        } else {
            const errorText = await response.text();
            console.error('❌ EmailJS: Failed to send email:', errorText);
            return { success: false, error: errorText };
        }
    } catch (error) {
        console.error('❌ EmailJS: Network error:', error);
        return { success: false, error: error.message };
    }
};

export const emailService = {
    /**
     * Sends a booking confirmation email
     * @param {Object} details - Booking details
     * @param {Object} user - User details
     */
    sendBookingConfirmation: async (details, user) => {
        console.log('📧 Sending Booking Confirmation...');
        const params = {
            to_name: user.name || user.email.split('@')[0],
            to_email: user.email,
            subject: `Booking Confirmed! - ${details.turfName}`,
            message: `
        Booking ID: ${details.bookingId}
        Venue: ${details.turfName}
        Date: ${details.date}
        Time: ${details.timeSlot}
        Amount: ${details.totalAmount}
        Location: ${details.turfAddress}
      `,
            // Map to template variables if using specific template fields
            booking_id: details.bookingId,
            turf_name: details.turfName,
            date: details.date,
            time_slot: details.timeSlot,
            total_amount: details.totalAmount,
            turf_address: details.turfAddress
        };
        return await sendEmailJS(params);
    },

    /**
     * Sends a challenge acceptance email to the Creator
     * @param {Object} challenge - Challenge details
     * @param {Object} acceptorTeam - Team accepting the challenge
     * @param {Object} creator - Creator details
     */
    sendChallengeAcceptanceToCreator: async (challenge, acceptorTeam, creator) => {
        console.log('📧 Sending Challenge Acceptance to Creator...');
        const params = {
            to_name: creator.fullName,
            to_email: creator.email,
            subject: `Challenge Accepted! - ${challenge.title}`,
            message: `
        Your challenge "${challenge.title}" has been accepted by ${acceptorTeam.name}!
        Sport: ${challenge.sport}
        Date: ${new Date(challenge.proposedDateTime).toDateString()}
        Venue: ${challenge.venue?.name || 'TBD'}
      `,
            // Specific fields for template
            creator_name: creator.fullName,
            acceptor_team: acceptorTeam.name,
            challenge_title: challenge.title,
            sport: challenge.sport,
            date: new Date(challenge.proposedDateTime).toDateString(),
            venue: challenge.venue?.name || 'TBD'
        };
        // Use specific challenge template
        return await sendEmailJS(params, 'template_y43apqr');
    },

    /**
     * Sends a challenge joined confirmation to the Acceptor
     * @param {Object} challenge - Challenge details
     * @param {Object} user - Acceptor user details
     */
    sendChallengeJoinConfirmation: async (challenge, user) => {
        console.log('📧 Sending Challenge Join Confirmation...');
        const params = {
            to_name: user.fullName,
            to_email: user.email,
            subject: `You Joined a Challenge! - ${challenge.title}`,
            message: `
        You have successfully joined the challenge "${challenge.title}".
        Get ready for the match!
      `,
            // Specific fields for template
            challenge_title: challenge.title,
            date: new Date(challenge.proposedDateTime).toDateString(),
        };
        // Use default template for acceptor (or add specific one if user provides)
        return await sendEmailJS(params);
    }
};
