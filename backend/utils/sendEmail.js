const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter
    // For production, use environment variables.
    // For testing, we can use Ethereal or just log if no creds.

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp-relay.brevo.com', // Default to Brevo
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465 (SSL), false for other ports (TLS)
        auth: {
            user: process.env.SMTP_EMAIL, // Your SMTP email
            pass: process.env.SMTP_PASSWORD // Your SMTP password
        }
    });

    // Define email options
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Arena Pro'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    // Send email
    console.log(`📧 Backend: Sending email to ${options.email}...`);

    try {
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.warn('⚠️ Backend: SMTP credentials missing in .env. Email simulation only.');
            console.log('📧 [SIMULATED EMAIL CONTENT]:', mailOptions);
            return { success: true, message: 'Email simulated (missing credentials)' };
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Backend: Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Backend: Email send failed:', error);
        // Don't throw logic error, just return failure so app doesn't crash
        return { success: false, error: error.message };
    }
};

module.exports = sendEmail;
