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
    from: `"Munch Time Security" <${user || 'no-reply@restaurant.com'}>`,
    to: toEmail,
    subject: 'קוד אימות דו-שלבי - Munch Time',
    text: `קוד האימות שלך הוא: ${code}. הוא תקף ל-5 דקות בלבד.`,
    html: `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background-color: #0d0d0d; border: 3px solid #D4AF37; border-radius: 12px; max-width: 480px; margin: 20px auto; color: #ffffff; text-align: center; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);">
        <div style="margin-bottom: 25px;">
          <span style="font-size: 32px; font-weight: bold; color: #D4AF37; letter-spacing: 2px; text-transform: uppercase;">MUNCH TIME</span>
          <div style="width: 80px; height: 2px; background-color: #D4AF37; margin: 10px auto;"></div>
        </div>
        
        <h3 style="color: #ffffff; font-size: 22px; margin-top: 0; font-weight: 600; letter-spacing: 0.5px;">קוד אימות כניסה</h3>
        
        <p style="color: #b3b3b3; font-size: 15px; line-height: 1.6; margin: 20px 0;">
          שלום,<br>
          על מנת להשלים את ההתחברות למערכת Munch Time, אנא הזן את קוד האימות החד-פעמי הבא:
        </p>
        
        <div style="font-size: 42px; font-weight: bold; background-color: #000000; color: #D4AF37; border: 2px solid #D4AF37; padding: 15px 0; text-align: center; border-radius: 8px; letter-spacing: 8px; margin: 30px auto; width: 75%; box-shadow: inset 0 0 10px rgba(212, 175, 55, 0.2), 0 4px 15px rgba(0, 0, 0, 0.5);">
          ${code}
        </div>
        
        <p style="color: #777777; font-size: 12px; line-height: 1.6; margin-top: 30px; border-top: 1px solid #222222; padding-top: 20px;">
          * קוד זה יהיה בתוקף למשך 5 דקות בלבד.<br>
          אם לא ניסית להתחבר למערכת, ניתן להתעלם מהודעה זו בבטחה.
        </p>
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

