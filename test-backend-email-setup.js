/**
 * Test Backend Email Setup
 * 
 * This script tests if your backend email service is configured correctly.
 * Run this after setting up your SMTP credentials in backend/.env
 * 
 * Usage: node test-backend-email-setup.js
 */

require('dotenv').config({ path: './backend/.env' });
const nodemailer = require('nodemailer');

const testEmailSetup = async () => {
    console.log('\n🧪 Testing Backend Email Setup...\n');

    // Check environment variables
    console.log('📋 Checking Environment Variables:');
    console.log(`   SMTP_HOST: ${process.env.SMTP_HOST ? '✅ SET' : '❌ MISSING'}`);
    console.log(`   SMTP_PORT: ${process.env.SMTP_PORT ? '✅ SET' : '❌ MISSING'}`);
    console.log(`   SMTP_EMAIL: ${process.env.SMTP_EMAIL ? '✅ SET' : '❌ MISSING'}`);
    console.log(`   SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? '✅ SET' : '❌ MISSING'}`);
    console.log(`   FROM_EMAIL: ${process.env.FROM_EMAIL ? '✅ SET' : '❌ MISSING'}`);
    console.log(`   FROM_NAME: ${process.env.FROM_NAME ? '✅ SET' : '❌ MISSING'}\n`);

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        console.error('❌ ERROR: SMTP credentials are missing!');
        console.log('\n📝 Setup Instructions:');
        console.log('   1. Copy backend/.env.example to backend/.env');
        console.log('   2. Add your SMTP credentials to backend/.env');
        console.log('   3. Run this test again\n');
        console.log('   See BACKEND_EMAIL_SETUP_GUIDE.md for detailed instructions\n');
        process.exit(1);
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    // Test connection
    console.log('🔌 Testing SMTP Connection...');
    try {
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!\n');
    } catch (error) {
        console.error('❌ SMTP Connection Failed:', error.message);
        console.log('\n📝 Common Issues:');
        console.log('   - Gmail: Make sure you\'re using an app password (not your regular password)');
        console.log('   - Gmail: Enable 2-factor authentication first');
        console.log('   - Brevo: Check your SMTP key is correct (starts with "xsmtpsib-")');
        console.log('   - Check SMTP_HOST and SMTP_PORT are correct\n');
        process.exit(1);
    }

    // Send test email
    const testEmail = process.env.SMTP_EMAIL; // Send to yourself
    console.log(`📧 Sending Test Email to ${testEmail}...`);

    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Arena Pro'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
        to: testEmail,
        subject: '✅ Arena Pro Email Service Test',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Montserrat', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background-color: #004d43; color: #e8ee26; padding: 30px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
                    .content { background-color: #f9f9f9; padding: 30px 20px; }
                    .success-box { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background-color: #f5f5f5; }
                    .logo { font-size: 24px; font-weight: 700; color: #e8ee26; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">⚽ Arena Pro</div>
                        <h1>✅ Email Service Test</h1>
                    </div>
                    <div class="content">
                        <div class="success-box">
                            <strong>🎉 Success!</strong> Your backend email service is configured correctly.
                        </div>
                        <p>This is a test email from your Arena Pro backend email service.</p>
                        <p><strong>Configuration Details:</strong></p>
                        <ul>
                            <li>SMTP Host: ${process.env.SMTP_HOST}</li>
                            <li>SMTP Port: ${process.env.SMTP_PORT}</li>
                            <li>From Email: ${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}</li>
                            <li>From Name: ${process.env.FROM_NAME || 'Arena Pro'}</li>
                        </ul>
                        <p>Your email service is ready to send:</p>
                        <ul>
                            <li>✅ Booking confirmations</li>
                            <li>✅ Challenge notifications</li>
                            <li>✅ Squad Builder notifications</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Arena Pro. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Test Email Sent Successfully!');
        console.log(`   Message ID: ${info.messageId}\n`);
        
        console.log('🎉 Email Service Setup Complete!\n');
        console.log('📝 Next Steps:');
        console.log('   1. Check your inbox for the test email');
        console.log('   2. If not in inbox, check spam folder');
        console.log('   3. Start your backend server: cd backend && npm start');
        console.log('   4. Your mobile app will now send emails through the backend\n');
    } catch (error) {
        console.error('❌ Failed to Send Test Email:', error.message);
        console.log('\n📝 Troubleshooting:');
        console.log('   - Check your SMTP credentials are correct');
        console.log('   - For Gmail, use app password (not regular password)');
        console.log('   - Check your SMTP provider\'s dashboard for errors');
        console.log('   - Make sure you haven\'t hit rate limits\n');
        process.exit(1);
    }
};

// Run the test
testEmailSetup().catch(error => {
    console.error('❌ Test Failed:', error);
    process.exit(1);
});
