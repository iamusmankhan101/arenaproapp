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

// Send Squad Builder player joined email to organizer
router.post('/squad-player-joined', auth, async (req, res) => {
  try {
    const { gameDetails, organizerEmail, organizerName, playerName } = req.body;
    
    if (!organizerEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'Organizer email is required' 
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
            <h1>🎉 New Player Joined!</h1>
          </div>
          <div class="content">
            <p>Dear ${organizerName || 'Organizer'},</p>
            <p>Great news! <span class="highlight">${playerName}</span> has joined your game!</p>
            <div class="details">
              <div class="detail-row">
                <span class="label">🏟️ Venue:</span>
                <span class="value">${gameDetails.turfName}</span>
              </div>
              <div class="detail-row">
                <span class="label">📅 Date:</span>
                <span class="value">${new Date(gameDetails.dateTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="label">⏰ Time:</span>
                <span class="value">${gameDetails.startTime} - ${gameDetails.endTime}</span>
              </div>
              <div class="detail-row">
                <span class="label">👥 Players:</span>
                <span class="value">${gameDetails.currentPlayers}/${gameDetails.totalPlayers}</span>
              </div>
            </div>
            <p>Keep an eye on your Squad Builder for more players joining! 🎯</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Arena Pro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const result = await sendEmail({
      email: organizerEmail,
      subject: `New Player Joined Your Game! - ${gameDetails.turfName}`,
      message: emailContent
    });
    
    if (result.success) {
      res.json({ success: true, message: 'Email sent successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('❌ Squad player joined email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send Squad Builder join confirmation email to player
router.post('/squad-join-confirmation', auth, async (req, res) => {
  try {
    const { gameDetails, playerEmail, playerName } = req.body;
    
    if (!playerEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'Player email is required' 
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
          .price-highlight { background-color: #e8ee26; color: #004d43; padding: 12px 20px; border-radius: 8px; font-weight: 700; font-size: 20px; display: inline-block; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚽ Arena Pro</div>
            <h1>✅ You Joined a Game!</h1>
          </div>
          <div class="content">
            <p>Dear ${playerName || 'Player'},</p>
            <p>Congratulations! You've successfully joined a game at <strong>${gameDetails.turfName}</strong>.</p>
            <div class="details">
              <div class="detail-row">
                <span class="label">🏟️ Venue:</span>
                <span class="value">${gameDetails.turfName}</span>
              </div>
              <div class="detail-row">
                <span class="label">📅 Date:</span>
                <span class="value">${new Date(gameDetails.dateTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="label">⏰ Time:</span>
                <span class="value">${gameDetails.startTime} - ${gameDetails.endTime}</span>
              </div>
              <div class="detail-row">
                <span class="label">👥 Players:</span>
                <span class="value">${gameDetails.currentPlayers}/${gameDetails.totalPlayers}</span>
              </div>
              <div class="detail-row">
                <span class="label">👤 Organizer:</span>
                <span class="value">${gameDetails.organizerName}</span>
              </div>
            </div>
            <div style="text-align: center;">
              <div class="price-highlight">Your Share: PKR ${gameDetails.pricePerPlayer}</div>
            </div>
            <p>Get ready for the match! The organizer will contact you with more details. 🎯</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Arena Pro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const result = await sendEmail({
      email: playerEmail,
      subject: `You Joined a Game! - ${gameDetails.turfName}`,
      message: emailContent
    });
    
    if (result.success) {
      res.json({ success: true, message: 'Email sent successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('❌ Squad join confirmation email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send Squad Builder game cancelled email to participants
router.post('/squad-game-cancelled', auth, async (req, res) => {
  try {
    const { gameDetails, participantEmail, participantName } = req.body;
    
    if (!participantEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'Participant email is required' 
      });
    }
    
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Montserrat', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background-color: #DC2626; color: #ffffff; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .content { background-color: #f9f9f9; padding: 30px 20px; }
          .details { background-color: white; padding: 20px; margin: 20px 0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: 600; color: #666; }
          .value { color: #333; font-weight: 500; text-align: right; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background-color: #f5f5f5; }
          .logo { font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 10px; }
          .notice { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚽ Arena Pro</div>
            <h1>❌ Game Cancelled</h1>
          </div>
          <div class="content">
            <p>Dear ${participantName || 'Player'},</p>
            <p>We're sorry to inform you that the game you joined has been cancelled by the organizer.</p>
            <div class="details">
              <div class="detail-row">
                <span class="label">🏟️ Venue:</span>
                <span class="value">${gameDetails.turfName}</span>
              </div>
              <div class="detail-row">
                <span class="label">📅 Date:</span>
                <span class="value">${new Date(gameDetails.dateTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="label">⏰ Time:</span>
                <span class="value">${gameDetails.startTime} - ${gameDetails.endTime}</span>
              </div>
              <div class="detail-row">
                <span class="label">👤 Organizer:</span>
                <span class="value">${gameDetails.organizerName}</span>
              </div>
            </div>
            <div class="notice">
              <strong>💡 Don't worry!</strong> Check out other games in Squad Builder to find your next match.
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 Arena Pro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const result = await sendEmail({
      email: participantEmail,
      subject: `Game Cancelled - ${gameDetails.turfName}`,
      message: emailContent
    });
    
    if (result.success) {
      res.json({ success: true, message: 'Email sent successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('❌ Squad game cancelled email error:', error);
    res.status(500).json({ success: false, error: error.message });
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
