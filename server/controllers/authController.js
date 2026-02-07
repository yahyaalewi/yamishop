const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock OTP Model/Usage (In production, use Redis or DB with TTL)
const otpStore = new Map();

// Regex for Mauritania: starts with optional +222, then 2, 3, or 4, then 7 digits.
const phoneRegex = /^(?:\+222)?(2|3|4)\d{7}$/;

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

        // Generate Mock OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        otpStore.set(phoneNumber, otp);
        console.log(`[MOCK SMS] OTP for ${phoneNumber}: ${otp}`);

        res.status(201).json({ message: 'Utilisateur créé. Veuillez vérifier le code OTP envoyé.', userId: user._id });

    } catch (error) {
        console.error('[DEBUG] SERVER ERROR on register:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (otpStore.get(phoneNumber) === otp) {
        otpStore.delete(phoneNumber);
        // Generate Token
        const user = await User.findOne({ phoneNumber });
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({ token, user, message: 'Vérification réussie.' });
    } else {
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
        console.log(`[MOCK SMS] Login OTP for ${phoneNumber}: ${otp}`);

        res.status(200).json({ message: 'Veuillez entrer le code OTP pour vous connecter.', requireOtp: true });

    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};
