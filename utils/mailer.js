import nodemailer from 'nodemailer';

/**
 * Sends a One-Time Password (OTP) verification email.
 * Fallbacks to console logging if credentials are not configured in .env.
 * 
 * @param {string} toEmail - Recipient email address
 * @param {string|number} code - 6-digit verification code
 */
export const sendOTPEmail = async (toEmail, code) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true'; // true for port 465, false for others

  const mailOptions = {
    from: `"Restaurant System" <${user || 'no-reply@restaurant.com'}>`,
    to: toEmail,
    subject: 'Two-Step Verification Code',
    text: `Your verification code is: ${code}. It will expire in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 500px;">
        <h2 style="color: #333;">Restaurant Management Security</h2>
        <p>You requested a login. Please enter the following code to complete your two-step verification:</p>
        <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px; text-align: center; border-radius: 4px; letter-spacing: 2px; color: #007bff; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #666; font-size: 12px;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  // If no credentials configured in .env, fallback to logging
  if (!user || !pass) {
    console.log('\n==================================================');
    console.log(`[MOCK EMAIL SENDER] Sending to: ${toEmail}`);
    console.log(`[MOCK EMAIL SENDER] Subject: ${mailOptions.subject}`);
    console.log(`[MOCK EMAIL SENDER] OTP Verification Code: ${code}`);
    console.log('==================================================\n');
    return;
  }

  // Create transporter for real sending
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email successfully sent to ${toEmail}`);
  } catch (error) {
    console.error(`Failed to send verification email to ${toEmail}:`, error.message);
    // Even if it fails, during development we can log the code so the developer is not blocked
    console.log(`[FALLBACK LOG] OTP Code for ${toEmail} was: ${code}`);
  }
};

