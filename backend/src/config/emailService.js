const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send OTP email for password reset via Resend API
 * @param {string} toEmail - Recipient email address
 * @param {string} otpCode - 6-digit OTP code
 * @param {string} userName - User's name
 */
const sendPasswordResetOtp = async (toEmail, otpCode, userName) => {
  try {
    // Note: Resend requiere un domaine vérifié.
    // Si pas encore vérifié, utilisez 'onboarding@resend.dev' pour les tests.
    // Mais pour la "vraie" utilisation, utilisez votre adresse enregistrée sur Resend.
    const fromEmail = "YamiShop 🛍️ <onboarding@resend.dev>"; 

    const logoPath = path.join(__dirname, '../assets/logo.png');
    let attachments = [];
    
    // Tentative de joindre le logo en base64 (format Resend)
    try {
        if (fs.existsSync(logoPath)) {
            const logoBase64 = fs.readFileSync(logoPath).toString('base64');
            attachments = [
                {
                    filename: 'logo.png',
                    content: logoBase64,
                    cid: 'yamishoplogo'
                }
            ];
        }
    } catch (err) {
        console.error("[RESEND] LOGO ATTACH ERROR:", err.message);
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: 'Code de réinitialisation - YamiShop / رمز إعادة تعيين كلمة المرور',
      attachments: attachments,
      html: `
        <!DOCTYPE html>
        <html dir="ltr" lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#f8f9fa;font-family:'Inter', 'Segoe UI', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:30px 10px;">
            <tr>
              <td align="center">
                <table width="100%" maxWidth="550" cellpadding="0" cellspacing="0" 
                  style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.06);border:1px solid #eee;max-width:550px;">
  
                  <!-- Logo Header -->
                  <tr>
                    <td style="padding:40px 40px 20px;text-align:center;">
                        <img src="https://res.cloudinary.com/dzknjtpa4/image/upload/v1/assets/logo_resized.png" alt="YamiShop Logo" style="height:50px;width:auto;display:block;margin:0 auto;">
                    </td>
                  </tr>
  
                  <!-- Content -->
                  <tr>
                    <td style="padding:20px 40px 40px;">
                      <h2 style="color:#111827;font-size:22px;margin:0 0 16px;font-weight:800;text-align:center;">
                        Bonjour, ${userName} 👋
                      </h2>
                      <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:center;">
                        Vous avez demandé la réinitialisation de votre compte. 
                        Utilisez le code de validation ci-dessous.
                      </p>
  
                      <!-- OTP Code Box -->
                      <div style="background:#fff7f5;border:2px dashed #E2725B;border-radius:20px;padding:30px;text-align:center;margin-bottom:24px;">
                        <p style="color:#E2725B;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 10px;">Votre code secret</p>
                        <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#E2725B;font-family:'Courier New', monospace;display:block;">${otpCode}</span>
                        <p style="color:#9CA3AF;font-size:12px;margin:15px 0 0;">
                          ⏱ Ce code est valable pendant <b>3 minutes</b> seulement.
                        </p>
                      </div>
  
                      <!-- Arabic Area -->
                      <div style="border-top:1px solid #f3f4f6;padding-top:20px;margin-top:20px;text-align:right;direction:rtl;">
                        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0;">
                          مرحباً <b>${userName}</b>، لقد طلبت إعادة تعيين كلمة مرورك.<br>
                          استخدم الرمز أعلاه لإتمام العملية. الرمز صالح لمدة <b>3 دقائق</b> فقط.
                        </p>
                      </div>
  
                      <!-- Security Alert -->
                      <div style="margin-top:30px;background:#FEF2F2;border-radius:12px;padding:15px;">
                        <p style="color:#B91C1C;font-size:13px;margin:0;line-height:1.5;">
                           Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.<br>
                           إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد.
                        </p>
                      </div>
                    </td>
                  </tr>
  
                  <!-- Footer -->
                  <tr>
                    <td style="background:#F9FAFB;padding:24px 40px;text-align:center;border-top:1px solid #F3F4F6;">
                      <p style="color:#9CA3AF;font-size:12px;margin:0;line-height:1.5;">
                        <b>YamiShop</b> - Fièrement fabriqué en Mauritanie<br>
                        صنع بكل فخر في موريتانيا
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
    });

    if (error) {
      console.error('[RESEND] API Error:', error);
      throw new Error(`Resend Error: ${error.message}`);
    }

    console.log(`[EMAIL] OTP envoyée via RESEND API à ${toEmail} (ID: ${data.id})`);
  } catch (error) {
    console.error('[EMAIL] Erreur Resend API détectée :', error.message);
    throw new Error(`Erreur Service Email : ${error.message}`);
  }
};

module.exports = { sendPasswordResetOtp };
