const { Resend } = require('resend');

// Initialize Resend. If no key, we log to console in development.
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

/**
 * Send an HTML email using Resend, with an elegant terminal fallback.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML body content
 * @param {string} text - Plain text fallback
 */
async function sendEmail({ to, subject, html, text }) {
  console.log(`\n✉️ [Email System] Attempting to send email to: ${to}`);
  console.log(`✉️ Subject: ${subject}`);
  
  if (resend) {
    try {
      const data = await resend.emails.send({
        from: 'WishCart <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
        text: text
      });
      console.log('✅ Email sent successfully via Resend API!', data);
      return data;
    } catch (err) {
      console.error('❌ Error sending email via Resend API. Falling back to console logging:', err.message);
    }
  } else {
    console.log('⚠️ RESEND_API_KEY is not configured. Falling back to console logging.');
  }

  // Visual terminal logging box for testing
  const border = '═'.repeat(60);
  console.log(`\n╔${border}╗`);
  console.log(`║ ${'WISHCART EMAIL EMULATOR (NO API KEY SET)'.padEnd(58)} ║`);
  console.log(`╠${border}╣`);
  console.log(`║ To: ${to.padEnd(54)} ║`);
  console.log(`║ Subject: ${subject.padEnd(49)} ║`);
  console.log(`╠${border}╣`);
  
  // Extract OTP or print message content nicely
  const otpMatch = html.match(/<h2[^>]*>([0-9]{6})<\/h2>/i) || html.match(/([0-9]{6})/);
  if (otpMatch) {
    console.log(`║ OTP CODE: ${otpMatch[1].padEnd(50)} ║`);
  } else {
    // Print first few lines of text
    const lines = text.split('\n').filter(Boolean);
    lines.slice(0, 3).forEach(line => {
      console.log(`║ ${line.substring(0, 56).padEnd(58)} ║`);
    });
  }
  
  console.log(`╚${border}╝\n`);
  return { id: 'mock-id-' + Date.now() };
}

/**
 * Send an OTP code email.
 */
async function sendOtpEmail(to, otp) {
  const subject = `${otp} is your WishCart Verification Code`;
  const html = `
    <div style="font-family: 'Manrope', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #faf9f7; color: #2f3331;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 0.2em; text-transform: uppercase; color: #2f3331; margin: 0;">WISHCART</h1>
        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #6c5c47; margin: 5px 0 0 0;">Management Suite</p>
      </div>
      <div style="background-color: #ffffff; padding: 40px; border-radius: 4px; box-shadow: 0 4px 16px rgba(108,92,71,0.04); border: 1px solid #f3f4f1;">
        <h2 style="font-size: 20px; font-weight: 300; margin-top: 0; color: #2f3331;">Verify Your Email Address</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #5c605d; font-weight: 300;">
          Use the following verification code to complete your login or registration. This code is valid for 5 minutes.
        </p>
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f3f4f1; border-radius: 2px;">
          <h2 style="font-size: 36px; font-weight: 700; letter-spacing: 0.1em; color: #6c5c47; margin: 0; font-family: monospace;">${otp}</h2>
        </div>
        <p style="font-size: 12px; color: #afb3b0; line-height: 1.5; font-weight: 300; margin-bottom: 0;">
          If you did not request this verification, please ignore this email.
        </p>
      </div>
      <div style="text-align: center; margin-top: 40px; font-size: 10px; color: #afb3b0; letter-spacing: 0.1em;">
        © 2026 WISHCART. ALL RIGHTS RESERVED.
      </div>
    </div>
  `;

  const text = `
Welcome to WishCart!

Your verification code is: ${otp}

This code is valid for 5 minutes. If you did not request this code, please ignore this email.

© 2026 WISHCART. All rights reserved.
  `;

  return sendEmail({ to, subject, html, text });
}

/**
 * Send a login alert email.
 */
async function sendLoginAlertEmail(to, name) {
  const subject = `New Login to your WishCart Account`;
  const html = `
    <div style="font-family: 'Manrope', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #faf9f7; color: #2f3331;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 0.2em; text-transform: uppercase; color: #2f3331; margin: 0;">WISHCART</h1>
      </div>
      <div style="background-color: #ffffff; padding: 40px; border-radius: 4px; box-shadow: 0 4px 16px rgba(108,92,71,0.04); border: 1px solid #f3f4f1;">
        <h2 style="font-size: 20px; font-weight: 300; margin-top: 0; color: #2f3331;">New Login Detected</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #5c605d; font-weight: 300;">
          Hi ${name},
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #5c605d; font-weight: 300;">
          A new login was detected on your WishCart account on <strong>${new Date().toLocaleString()}</strong>.
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #5c605d; font-weight: 300;">
          If this was you, no action is needed. If you suspect unauthorized access, please update your password immediately in your profile settings.
        </p>
      </div>
      <div style="text-align: center; margin-top: 40px; font-size: 10px; color: #afb3b0; letter-spacing: 0.1em;">
        © 2026 WISHCART. ALL RIGHTS RESERVED.
      </div>
    </div>
  `;

  const text = `
Hi ${name},

A new login was detected on your WishCart account on ${new Date().toLocaleString()}.

If this was you, no action is needed. If you suspect unauthorized access, please update your password immediately.

© 2026 WISHCART. All rights reserved.
  `;

  return sendEmail({ to, subject, html, text });
}

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendLoginAlertEmail
};
