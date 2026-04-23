require('dotenv').config({ path: './backend/.env' });
const sendEmail = require('./backend/utils/sendEmail');

async function testEmail() {
  console.log('🧪 Testing Backend Email Service...\n');
  
  console.log('📋 Configuration Check:');
  console.log('  SMTP_HOST:', process.env.SMTP_HOST || '❌ NOT SET');
  console.log('  SMTP_PORT:', process.env.SMTP_PORT || '❌ NOT SET');
  console.log('  SMTP_EMAIL:', process.env.SMTP_EMAIL ? '✅ SET' : '❌ NOT SET');
  console.log('  SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✅ SET' : '❌ NOT SET');
  console.log('  FROM_EMAIL:', process.env.FROM_EMAIL || '❌ NOT SET');
  console.log('  FROM_NAME:', process.env.FROM_NAME || '❌ NOT SET');
  console.log('');
  
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log('⚠️  SMTP credentials not configured!');
    console.log('');
    console.log('📝 To configure email service:');
    console.log('1. Sign up for Brevo (free): https://www.brevo.com/');
    console.log('2. Go to Settings → SMTP & API');
    console.log('3. Create SMTP key');
    console.log('4. Add credentials to backend/.env:');
    console.log('');
    console.log('   SMTP_HOST=smtp-relay.brevo.com');
    console.log('   SMTP_PORT=587');
    console.log('   SMTP_EMAIL=your-brevo-login-email@example.com');
    console.log('   SMTP_PASSWORD=xsmtpsib-your-smtp-key-here');
    console.log('   FROM_EMAIL=noreply@arenapro.pk');
    console.log('   FROM_NAME=Arena Pro');
    console.log('');
    console.log('📧 Email will be simulated (not actually sent)');
    console.log('');
  }
  
  // Replace with your test email
  const testEmailAddress = process.env.TEST_EMAIL || 'test@example.com';
  
  console.log(`📤 Sending test email to: ${testEmailAddress}`);
  console.log('');
  
  const result = await sendEmail({
    email: testEmailAddress,
    subject: 'Test Email from Arena Pro Backend',
    message: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #004d43; color: #e8ee26; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .success { color: #4CAF50; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚽ Arena Pro</h1>
            <h2>Email Service Test</h2>
          </div>
          <div class="content">
            <p class="success">✅ Success!</p>
            <p>If you're reading this, the backend email service is working correctly!</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Sent at: ${new Date().toLocaleString()}</li>
              <li>SMTP Host: ${process.env.SMTP_HOST}</li>
              <li>From: ${process.env.FROM_NAME} &lt;${process.env.FROM_EMAIL}&gt;</li>
            </ul>
            <p>You can now use this email service for booking confirmations and notifications.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
  
  console.log('');
  if (result.success) {
    console.log('✅ Test email sent successfully!');
    if (result.messageId) {
      console.log('📧 Message ID:', result.messageId);
    }
    console.log('');
    console.log('📬 Check your inbox at:', testEmailAddress);
    console.log('💡 If you don\'t see it, check your spam folder');
  } else {
    console.log('❌ Test email failed!');
    console.log('Error:', result.error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Verify SMTP credentials in backend/.env');
    console.log('2. Check if Brevo account is active');
    console.log('3. Ensure SMTP key is valid');
    console.log('4. Check network connectivity');
  }
  console.log('');
}

testEmail().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
