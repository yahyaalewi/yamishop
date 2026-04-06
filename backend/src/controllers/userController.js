const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { sendPasswordResetOtp } = require('../config/emailService');

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('CRITICAL: JWT_SECRET environment variable is not defined');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().trim().regex(/^(?:\+222)?(2|3|4)\d{7}$/).required().messages({
    'string.pattern.base': 'Veuillez entrer un numéro de téléphone mauritanien valide (ex: 2XXXXXXX, 3XXXXXXX, 4XXXXXXX)'
  }),
  password: Joi.string().min(6).required(),
  email: Joi.string().email().optional()
});

const loginSchema = Joi.object({
  phone: Joi.string().trim().regex(/^(?:\+222)?(2|3|4)\d{7}$/).required().messages({
    'string.pattern.base': 'Format de numéro invalide'
  }),
  password: Joi.string().required()
});

const verifyOtpSchema = Joi.object({
  userId: Joi.string().required(),
  otpCode: Joi.string().length(6).required(),
});

const registerUser = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, phone, password, email } = req.body;

    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    const user = await User.create({
      name,
      phone,
      password,
      email,
      role: 'user' // Force role to user to prevent privilege escalation
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (user && (await user.matchPassword(password))) {
      if (user.role === 'admin') {
        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otpCode;
        user.otpExpires = new Date(Date.now() + 1 * 60 * 1000); // 1 minute (60s)
        await user.save();
        
        // Simulating SMS for now
        console.log(`\n\n-----------------------------`);
        console.log(`[SMS] Admin OTP for ${phone}: ${otpCode}`);
        console.log(`-----------------------------\n\n`);

        return res.status(200).json({
          requiresOtp: true,
          userId: user._id,
          message: 'OTP envoyé au numéro de l\'administrateur'
        });
      }

      res.status(200).json({
        _id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid phone number or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { error } = verifyOtpSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { userId, otpCode } = req.body;

    const user = await User.findById(userId);

    if (!user || user.role !== 'admin') {
      return res.status(404).json({ message: 'User not found or not an admin' });
    }

    if (user.otpCode !== otpCode || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Code OTP invalide ou expiré' });
    }

    // Clear OTP
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      _id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser.id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Forgot Password ─────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Numéro de téléphone requis' });

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      return res.status(404).json({ message: 'Aucun compte associé à ce numéro' });
    }

    // Check if user has an email
    if (!user.email) {
      return res.status(400).json({
        message: 'no_email',
        detail: 'Aucun email enregistré sur ce compte. Contactez-nous pour récupérer votre compte.'
      });
    }

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes
    await user.save();

    // Send OTP via email
    await sendPasswordResetOtp(user.email, otpCode, user.name);

    // Mask email for privacy: ya***@gmail.com
    const masked = user.email.replace(/(^.{2})[^@]+(@.+)/, '$1***$2');

    return res.status(200).json({
      message: 'OTP envoyé',
      userId: user._id,
      maskedEmail: masked
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { userId, otpCode, newPassword } = req.body;

    if (!userId || !otpCode || !newPassword) {
      return res.status(400).json({ message: 'Données incomplètes' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    if (user.otpCode !== otpCode || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Code OTP invalide ou expiré' });
    }

    // Set new password & clear OTP
    user.password = newPassword;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword
};
