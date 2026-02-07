const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');

// Initialize Twilio Client (only if env vars are present)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Mock OTP Model/Usage (In production, use Redis or DB with TTL)
const otpStore = new Map();

// Regex for Mauritania: starts with optional +222, then 2, 3, or 4, then 7 digits.
const phoneRegex = /^(?:\+222)?(2|3|4)\d{7}$/;

const sendSms = async (to, otp) => {
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        try {
            console.log(`[Twilio] Sending OTP to ${to}...`);
            await twilioClient.messages.create({
                body: `Votre code de vérification Yamishop est : ${otp}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: to
            });
            console.log('[Twilio] SMS sent successfully.');
        } catch (error) {
            console.error('[Twilio] Error sending SMS:', error);
            // Fallback to log if SMS fails (e.g. invalid number or out of credit)
            console.log(`[ISOLATED-LOG] OTP for ${to}: ${otp}`);
        }
    } else {
        console.log('[Twilio] Not configured (missing env vars). Using mock log.');
        console.log(`[MOCK SMS] OTP for ${to}: ${otp}`);
    }
};

exports.register = async (req, res) => {
    console.log('[DEBUG] Register API called');
    console.log('[DEBUG] Request body:', req.body);
    try {
        const { fullName, phoneNumber, password, gender } = req.body;

        // Validation
        if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
            console.log('[DEBUG] Invalid phone number:', phoneNumber);
            return res.status(400).json({ message: 'Numéro de téléphone invalide.' });
        }

        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) {
            console.log('[DEBUG] User already exists');
            return res.status(400).json({ message: 'Ce numéro est déjà utilisé.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            fullName,
            phoneNumber,
            password: hashedPassword,
            gender
        });

        console.log('[DEBUG] Saving user:', user);
        await user.save();
        console.log('[DEBUG] User saved successfully');

        // Generate OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        otpStore.set(phoneNumber, otp);

        // Send SMS
        await sendSms(phoneNumber, otp);

        res.status(201).json({ message: 'Utilisateur créé. Veuillez vérifier le code OTP envoyé.', userId: user._id });

    } catch (error) {
        console.error('[DEBUG] SERVER ERROR on register:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;

    // Check if OTP matches
    if (otpStore.get(phoneNumber) === otp) {
        otpStore.delete(phoneNumber);
        // Generate Token
        const user = await User.findOne({ phoneNumber });
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({ token, user, message: 'Vérification réussie.' });
    } else {
        // Dev backdoor: allow '0000' if needed? No, strict for now.
        return res.status(400).json({ message: 'Code OTP invalide.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        const user = await User.findOne({ phoneNumber });
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect.' });

        // Requirement: "pour la log in aussi" -> Send OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        otpStore.set(phoneNumber, otp);

        // Send SMS
        await sendSms(phoneNumber, otp);

        res.status(200).json({ message: 'Veuillez entrer le code OTP pour vous connecter.', requireOtp: true });

    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};
