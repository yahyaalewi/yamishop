require('dotenv').config({ path: __dirname + '/../.env' });
const { sendPasswordResetOtp } = require('./config/emailService');

const test = async () => {
  console.log("--- TEST D'ENVOI D'EMAIL ---");
  console.log("Email utilisé :", process.env.EMAIL_USER);
  console.log("Mot de passe app :", process.env.EMAIL_PASS ? "****" : "MANQUANT");
  
  try {
    await sendPasswordResetOtp('yamishop.store@gmail.com', '654321', 'Acheteur Test');
    console.log("✅ SUCCÈS : L'email a bien été envoyé !");
  } catch (error) {
    console.error("❌ ÉCHEC :", error.message);
    if (error.stack) console.log(error.stack);
  }
};

test();
