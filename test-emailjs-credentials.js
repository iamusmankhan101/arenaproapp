require('dotenv').config();

const SERVICE_ID = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID || 'service_fbv2xpl';
const TEMPLATE_ID = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_rvzdkla';
const USER_ID = process.env.EXPO_PUBLIC_EMAILJS_USER_ID || 'DeOJhRm2vDyqLXLIN';

const emailParams = {
    service_id: SERVICE_ID,
    template_id: TEMPLATE_ID,
    user_id: USER_ID,
    template_params: {
        to_name: 'Test User',
        to_email: 'test@example.com', // Replace if needed to see it arrive
        booking_id: 'TEST_123',
        turf_name: 'Test Venue',
        date: new Date().toDateString(),
        time_slot: '10:00 AM - 11:00 AM',
        total_amount: 1000,
        turf_address: 'Test Location'
    }
};

console.log('Testing EmailJS with params:');
console.log(`Service ID: ${SERVICE_ID}`);
console.log(`Template ID: ${TEMPLATE_ID}`);
console.log(`User ID: ${USER_ID}`);

fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailParams)
})
    .then(async (res) => {
        if (res.ok) {
            console.log('✅ Success! Email sent.');
        } else {
            const text = await res.text();
            console.error(`❌ Failed with status ${res.status}:`, text);
        }
    })
    .catch(err => {
        console.error('❌ Network error:', err);
    });
