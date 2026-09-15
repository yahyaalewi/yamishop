require('dotenv').config();
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
    console.error('[EMAIL_SERVICE] CRITICAL ERROR: RESEND_API_KEY is missing from environment variables.');
}

const resend = new Resend(apiKey || 'dummy_key_to_prevent_immediate_crash');

/**
 * Send OTP email for password reset via Resend API
 * @param {string} toEmail - Recipient email address
 * @param {string} otpCode - 6-digit OTP code
 * @param {string} userName - User's name
 */
const sendPasswordResetOtp = async (toEmail, otpCode, userName) => {
  try {
    const fromEmail = "YamiShop 🛍️ <noreply@yamishop.store>"; 

    const logoPath = path.join(__dirname, '../assets/logo.png');
    let attachments = [];
    
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

const sendStoreAdminLoginOtp = async (toEmail, otpCode, userName) => {
  try {
    const fromEmail = "YamiShop 🛍️ <noreply@yamishop.store>";

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: 'Code de connexion 2FA - YamiShop 🔐',
      html: `
        <!DOCTYPE html>
        <html dir="ltr" lang="fr">
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#f8f9fa;font-family:'Inter', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:30px 10px;">
            <tr>
              <td align="center">
                <table width="100%" maxWidth="550" cellpadding="0" cellspacing="0" 
                  style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.06);border:1px solid #eee;max-width:550px;">
                  <tr>
                    <td style="padding:40px 40px 20px;text-align:center;">
                        <img src="https://res.cloudinary.com/dzknjtpa4/image/upload/v1/assets/logo_resized.png" alt="YamiShop Logo" style="height:50px;width:auto;display:block;margin:0 auto;">
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 40px 40px;">
                      <h2 style="color:#111827;font-size:22px;margin:0 0 16px;font-weight:800;text-align:center;">
                        Bonjour, ${userName} 🔐
                      </h2>
                      <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:center;">
                        Authentification 2FA — Espace Administrateur.<br>
                        Voici votre code de vérification à 6 chiffres :
                      </p>
                      <div style="background:#f0fdf4;border:2px dashed #10B981;border-radius:20px;padding:30px;text-align:center;margin-bottom:24px;">
                        <p style="color:#059669;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 10px;">Code OTP de connexion</p>
                        <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#059669;font-family:'Courier New', monospace;display:block;">${otpCode}</span>
                        <p style="color:#6B7280;font-size:12px;margin:15px 0 0;">
                          ⏱ Ce code expire dans <b>3 minutes</b>.
                        </p>
                      </div>
                      <div style="background:#FEF2F2;border-radius:12px;padding:15px;margin-top:20px;">
                        <p style="color:#B91C1C;font-size:12px;margin:0;line-height:1.5;text-align:center;">
                          Ne partagez jamais ce code avec quiconque.
                        </p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#F9FAFB;padding:20px 40px;text-align:center;border-top:1px solid #F3F4F6;">
                      <p style="color:#9CA3AF;font-size:12px;margin:0;">YamiShop - Authentification Sécurisée</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('[RESEND 2FA] API Error:', error);
    } else {
      console.log(`[EMAIL 2FA] Code OTP envoyé via Resend à ${toEmail} (ID: ${data?.id})`);
    }
  } catch (error) {
    console.error('[EMAIL 2FA] Erreur d\'envoi :', error.message);
  }
};

/**
 * Send email notification to a store admin when a new order containing their products is placed
 */
const sendStoreAdminOrderNotification = async ({ toEmail, storeName, order, storeItems, adminName }) => {
  try {
    if (!toEmail) return;
    const fromEmail = "YamiShop 🛍️ <noreply@yamishop.store>";
    const orderIdStr = order._id ? order._id.toString() : '';
    const orderIdShort = orderIdStr.substring(Math.max(0, orderIdStr.length - 6)).toUpperCase();
    
    const itemsHtml = storeItems.map(item => `
      <tr>
        <td style="padding:12px 8px;border-bottom:1px solid #f3f4f6;">
          <div style="font-weight:700;color:#111827;font-size:14px;">${item.name}</div>
          ${item.color || item.size ? `<div style="font-size:11px;color:#6b7280;margin-top:2px;">${item.color ? `Couleur: <b>${item.color}</b> ` : ''}${item.size ? `Taille: <b>${item.size}</b>` : ''}</div>` : ''}
        </td>
        <td style="padding:12px 8px;border-bottom:1px solid #f3f4f6;text-align:center;font-weight:700;color:#4b5563;font-size:13px;">
          x${item.qty || item.quantity || 1}
        </td>
        <td style="padding:12px 8px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:800;color:#E2725B;font-size:14px;">
          ${((item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString()} MRU
        </td>
      </tr>
    `).join('');

    const storeTotal = storeItems.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || item.quantity || 1)), 0);
    const clientName = order.shippingAddress?.name || order.user?.name || 'Client YamiShop';
    const clientPhone = order.shippingAddress?.phone || order.user?.phone || 'Non renseigné';
    const clientAddress = [order.shippingAddress?.street, order.shippingAddress?.district, order.shippingAddress?.city].filter(Boolean).join(', ');

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `Nouvelle commande #${orderIdShort} reçue pour ${storeName} 🛍️`,
      html: `
        <!DOCTYPE html>
        <html dir="ltr" lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#f8f9fa;font-family:'Inter', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:30px 10px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" 
                  style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.06);border:1px solid #eee;max-width:580px;">
                  
                  <!-- Header Banner -->
                  <tr>
                    <td style="background:#111827;padding:32px 40px;text-align:center;">
                      <img src="https://res.cloudinary.com/dzknjtpa4/image/upload/v1/assets/logo_resized.png" alt="YamiShop Logo" style="height:45px;width:auto;display:block;margin:0 auto 15px;">
                      <span style="display:inline-block;background:#059669;color:#ffffff;font-size:11px;font-weight:800;padding:5px 15px;border-radius:20px;text-transform:uppercase;letter-spacing:1.5px;">
                        Nouvelle Commande Reçue 🛍️
                      </span>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding:30px 40px;">
                      <h2 style="color:#111827;font-size:20px;margin:0 0 10px;font-weight:800;">
                        Bonjour ${adminName || storeName} 👋
                      </h2>
                      <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 25px;">
                        Une nouvelle commande comportant des articles de votre boutique <b>${storeName}</b> vient d'être enregistrée sur <b>YamiShop</b>.
                      </p>

                      <!-- Order Info Card -->
                      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:16px;padding:20px;margin-bottom:25px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-bottom:10px;">
                              <span style="font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;">N° Commande :</span><br>
                              <b style="font-size:16px;color:#E2725B;font-family:monospace;">#${orderIdShort}</b>
                            </td>
                            <td style="padding-bottom:10px;text-align:right;">
                              <span style="font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;">Mode Paiement :</span><br>
                              <b style="font-size:13px;color:#111827;">${order.paymentMethod || 'Paiement à la livraison'}</b>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" style="border-top:1px dashed #e5e7eb;padding-top:12px;">
                              <span style="font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;">Client :</span>
                              <b style="font-size:13px;color:#111827;">${clientName}</b> (${clientPhone})<br>
                              <span style="font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;">Adresse de livraison :</span>
                              <span style="font-size:13px;color:#4b5563;">${clientAddress}</span>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Items Table -->
                      <h3 style="color:#111827;font-size:14px;font-weight:800;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.8px;">
                        Articles de votre boutique (${storeItems.length})
                      </h3>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-collapse:collapse;">
                        <thead>
                          <tr style="background:#f3f4f6;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">
                            <th style="padding:8px;text-align:left;border-radius:8px 0 0 8px;">Produit</th>
                            <th style="padding:8px;text-align:center;">Qté</th>
                            <th style="padding:8px;text-align:right;border-radius:0 8px 8px 0;">Sous-total</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsHtml}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colspan="2" style="padding:15px 8px 5px;font-weight:800;font-size:14px;color:#111827;text-transform:uppercase;">
                              Total boutique :
                            </td>
                            <td style="padding:15px 8px 5px;text-align:right;font-weight:900;font-size:18px;color:#E2725B;">
                              ${storeTotal.toLocaleString()} MRU
                            </td>
                          </tr>
                        </tfoot>
                      </table>

                      <!-- Arabic Notice -->
                      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:15px;margin:25px 0;direction:rtl;text-align:right;">
                        <p style="color:#1e40af;font-size:13px;line-height:1.7;margin:0;">
                          مرحباً <b>${adminName || storeName}</b>، تم استلام طلبية جديدة لمنتجات من متجركم. يرجى مراجعة لوحة التحكم لتجهيز الطلبية للمندوب.
                        </p>
                      </div>

                      <!-- Action CTA Button -->
                      <div style="text-align:center;margin:30px 0 10px;">
                        <a href="https://yamishop.store/store-admin/orders" 
                           style="background:#E2725B;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:14px;font-size:14px;font-weight:800;display:inline-block;box-shadow:0 4px 15px rgba(226,114,91,0.3);">
                          Accéder à mon espace Boutique →
                        </a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#F9FAFB;padding:20px 40px;text-align:center;border-top:1px solid #F3F4F6;">
                      <p style="color:#9CA3AF;font-size:12px;margin:0;line-height:1.5;">
                        <b>YamiShop</b> — Plateforme E-Commerce en Mauritanie<br>
                        منصة التجارة الإلكترونية في موريتانيا
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('[EMAIL ORDER NOTIF] Resend error:', error);
    } else {
      console.log(`[EMAIL ORDER NOTIF] Notification de commande envoyée avec succès à ${toEmail} pour la boutique ${storeName} (ID: ${data?.id})`);
    }
  } catch (error) {
    console.error('[EMAIL ORDER NOTIF] Erreur d\'envoi :', error.message);
  }
};

module.exports = { sendPasswordResetOtp, sendStoreAdminLoginOtp, sendStoreAdminOrderNotification };
