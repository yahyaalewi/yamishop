const nodemailer = require('nodemailer');

/**
 * Creates and returns a Gmail SMTP transporter.
 * 
 * ⚠️  IMPORTANT — Gmail requires an "App Password", NOT your regular Gmail password.
 *     Steps to create one:
 *     1. Go to https://myaccount.google.com/security
 *     2. Enable 2-Step Verification (if not already done)
 *     3. Search for "App passwords" → create one for "Mail"
 *     4. Use that 16-character code as EMAIL_PASS in your .env
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send OTP email for password reset.
 * Falls back to console log in development if email sending fails.
 * @param {string} toEmail - Recipient email address
 * @param {string} otpCode - 6-digit OTP code
 * @param {string} userName - User's name for personalization
 */
const sendPasswordResetOtp = async (toEmail, otpCode, userName) => {
  const mailOptions = {
    from: `"YamiShop 🛍️" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Code de réinitialisation - YamiShop / رمز إعادة تعيين كلمة المرور',
    html: `
      <!DOCTYPE html>
      <html dir="ltr" lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="580" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.10);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#6c3483,#a93226);padding:36px 40px;text-align:center;">
                    <h1 style="color:#fff;margin:0;font-size:30px;font-weight:900;letter-spacing:-0.5px;">
                      YamiShop 🛍️
                    </h1>
                    <p style="color:rgba(255,255,255,0.80);margin:6px 0 0;font-size:15px;">يامي شوب</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 44px;">

                    <h2 style="color:#1a1a2e;font-size:20px;margin:0 0 14px;font-weight:700;">
                      Bonjour ${userName} 👋
                    </h2>
                    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 24px;">
                      Vous avez demandé à réinitialiser votre mot de passe YamiShop.<br>
                      Voici votre code valable pendant <strong>10 minutes</strong> :
                    </p>

                    <!-- OTP Box -->
                    <div style="background:linear-gradient(135deg,#fdf2f8,#fce4ec);
                                border:2px dashed #e91e8c44;border-radius:16px;
                                padding:32px;text-align:center;margin:0 0 28px;">
                      <p style="color:#999;font-size:11px;font-weight:700;letter-spacing:3px;
                                 text-transform:uppercase;margin:0 0 14px;">Code de vérification</p>
                      <span style="font-size:46px;font-weight:900;letter-spacing:14px;
                                   color:#6c3483;font-family:'Courier New',monospace;
                                   display:inline-block;padding:0 8px;">
                        ${otpCode}
                      </span>
                      <p style="color:#bbb;font-size:12px;margin:18px 0 0;">
                        ⏱ Ce code expire dans 10 minutes
                      </p>
                    </div>

                    <!-- Arabic -->
                    <div style="border-top:1px solid #f0f0f0;padding-top:22px;text-align:right;direction:rtl;">
                      <p style="color:#555;font-size:14px;line-height:1.9;margin:0;">
                        مرحباً <strong>${userName}</strong>،<br>
                        طلبت إعادة تعيين كلمة مرورك في يامي شوب.<br>
                        استخدم الرمز أعلاه — صلاحيته <strong>10 دقائق</strong> فقط.
                      </p>
                    </div>

                    <!-- Warning -->
                    <div style="background:#fffbea;border-left:4px solid #f59e0b;
                                border-radius:10px;padding:14px 16px;margin-top:24px;">
                      <p style="color:#92400e;font-size:13px;margin:0;line-height:1.6;">
                        ⚠️ Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
                        <span style="display:block;direction:rtl;text-align:right;margin-top:6px;">
                          ⚠️ إذا لم تطلب ذلك، تجاهل هذا البريد. حسابك بأمان.
                        </span>
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f9f9f9;padding:18px 40px;
                             text-align:center;border-top:1px solid #eee;">
                    <p style="color:#bbb;font-size:12px;margin:0;">
                      © 2025 YamiShop · Mauritanie<br>
                      يامي شوب · موريتانيا
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] OTP sent to ${toEmail}`);
  } catch (error) {
    // In development: log to console as fallback so you can still test
    console.error('[EMAIL] Failed to send email:', error.message);
    console.log(`\n========================================`);
    console.log(`[DEV FALLBACK] OTP for ${toEmail}: ${otpCode}`);
    console.log(`========================================\n`);
    
    // Re-throw so the controller knows — it will still respond with userId
    // but we surface the Gmail auth issue clearly
    throw new Error(
      `Échec de l'envoi de l'email. ` +
      `Vérifiez que EMAIL_PASS est un "App Password" Gmail (pas le mot de passe normal). ` +
      `Créez-le sur: https://myaccount.google.com/apppasswords`
    );
  }
};

module.exports = { sendPasswordResetOtp };
