const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');
const auth = require('../middleware/auth');

// Send booking confirmation email
router.post('/booking-confirmation', auth, async (req, res) => {
  try {
    const { bookingDetails, userEmail, userName } = req.body;
    
    if (!userEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'User email is required' 
      });
    }
    
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: 'Montserrat', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
          }
          .header { 
            background-color: #004d43; 
            color: #e8ee26; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content { 
            background-color: #f9f9f9; 
            padding: 30px 20px; 
          }
          .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
          }
          .details { 
            background-color: white; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 12px 0; 
            border-bottom: 1px solid #eee; 
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .label { 
            font-weight: 600; 
            color: #666; 
          }
          .value { 
            color: #333; 
            font-weight: 500;
            text-align: right;
          }
          .booking-id {
            background-color: #e8ee26;
            color: #004d43;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 700;
            display: inline-block;
          }
          .important-note {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .important-note strong {
            color: #856404;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px;
            background-color: #f5f5f5;
          }
          .footer p {
            margin: 5px 0;
          }
          .logo {
            font-size: 24px;
            font-weight: 700;
            color: #e8ee26;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚽ Arena Pro</div>
            <h1>🎉 Booking Confirmed!</h1>
          </div>
          
          <div class="content">
            <p class="greeting">Dear ${userName || 'Valued Customer'},</p>
            <p>Your booking has been confirmed successfully! We're excited to see you on the field.</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <span class="booking-id">Booking ID: ${bookingDetails.bookingId}</span>
            </div>
            
            <div class="details">
              <div class="detail-row">
                <span class="label">🏟️ Venue:</span>
                <span class="value">${bookingDetails.turfName}</span>
              </div>
              <div class="detail-row">
                <span class="label">📅 Date:</span>
                <span class="value">${bookingDetails.date}</span>
              </div>
              <div class="detail-row">
                <span class="label">⏰ Time:</span>
                <span class="value">${bookingDetails.timeSlot}</span>
              </div>
              <div class="detail-row">
                <span class="label">💰 Total Amount:</span>
                <span class="value">PKR ${bookingDetails.totalAmount}</span>
              </div>
              <div class="detail-row">
                <span class="label">📍 Location:</span>
                <span class="value">${bookingDetails.turfAddress}</span>
              </div>
            </div>
            
            <div class="important-note">
              <strong>⏱️ Important:</strong> Please arrive 10 minutes before your scheduled time to ensure a smooth check-in process.
            </div>
            
            <p>If you have any questions or need to make changes to your booking, please contact the venue directly.</p>
            <p style="margin-top: 20px;">Thank you for choosing Arena Pro! Have a great game! 🎯</p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2024 Arena Pro. All rights reserved.</p>
            <p style="margin-top: 10px;">
              <a href="https://arenapro.pk" style="color: #004d43; text-decoration: none;">Visit our website</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    console.log(`📧 Sending booking confirmation to ${userEmail}...`);
    
    const result = await sendEmail({
      email: userEmail,
      subject: `Booking Confirmed! - ${bookingDetails.turfName}`,
      message: emailContent
    });
    
    if (result.success) {
      console.log('✅ Booking confirmation email sent successfully');
      res.json({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: result.messageId 
      });
    } else {
      console.error('❌ Failed to send booking confirmation:', result.error);
      res.status(500).json({ 
        success: false, 
        error: result.error || 'Failed to send email' 
      });
    }
  } catch (error) {
    console.error('❌ Email notification error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Send challenge acceptance email to creator
router.post('/challenge-acceptance', auth, async (req, res) => {
  try {
    const { challenge, acceptorTeam, creatorEmail, creatorName } = req.body;
    
    if (!creatorEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'Creator email is required' 
      });
    }
    
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Montserrat', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background-color: #004d43; color: #e8ee26; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .content { background-color: #f9f9f9; padding: 30px 20px; }
          .details { background-color: white; padding: 20px; margin: 20px 0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: 600; color: #666; }
          .value { color: #333; font-weight: 500; text-align: right; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background-color: #f5f5f5; }
          .logo { font-size: 24px; font-weight: 700; color: #e8ee26; margin-bottom: 10px; }
          .highlight { background-color: #e8ee26; color: #004d43; padding: 8px 16px; border-radius: 6px; font-weight: 700; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚽ Arena Pro</div>
            <h1>🏆 Challenge Accepted!</h1>
          </div>
          <div class="content">
            <p>Dear ${creatorName || 'Team Captain'},</p>
            <p>Great news! Your challenge has been accepted!</p>
            <div style="text-align: center; margin: 20px 0;">
              <span class="highlight">${acceptorTeam.name}</span>
            </div>
            <p style="text-align: center;">has accepted your challenge!</p>
            <div class="details">
              <div class="detail-row">
                <span class="label">🏆 Challenge:</span>
                <span class="value">${challenge.title}</span>
              </div>
              <div class="detail-row">
                <span class="label">⚽ Sport:</span>
                <span class="value">${challenge.sport}</span>
              </div>
              <div class="detail-row">
                <span class="label">📅 Date:</span>
                <span class="value">${new Date(challenge.proposedDateTime).toDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="label">🏟️ Venue:</span>
                <span class="value">${challenge.venue?.name || 'TBD'}</span>
              </div>
            </div>
            <p>Get your team ready for an exciting match! Good luck! 🎯</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Arena Pro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const result = await sendEmail({
      email: creatorEmail,
      subject: `Challenge Accepted! - ${challenge.title}`,
      message: emailContent
    });
    
    if (result.success) {
      res.json({ success: true, message: 'Email sent successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('❌ Challenge email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
