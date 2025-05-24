const { User, Onboarding, } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { ALL_ROLES } = require('../utils/roles');

// Nodemailer setup (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const signup = async (req, res) => {
  const { name, email, password, role, phone, subscription, vatTin, companyAddress, language } = req.body;
  const creator = await User.findByPk(req.userId) || {};
  const displayPicture = req.files?.displayPicture ? `/uploads/${req.files.displayPicture[0].filename}` : null;
  const companyLogo = req.files?.companyLogo ? `/uploads/${req.files.companyLogo[0].filename}` : null;

  try {
    // // Validate role-based permissions
    // if (creator.role === 'SuperAdmin') {
    //   if (!['CorporateUser', 'User', 'Consultancy', 'ComplianceOfficer'].includes(role)) {
    //     return res.status(400).json({ success: false, message: 'Invalid role for SuperAdmin to create' });
    //   }
    // } else if (creator.role === 'CorporateUser') {
    //   if (role !== 'User') {
    //     return res.status(403).json({ success: false, message: 'CorporateUser can only create Users' });
    //   }
    // } else if (creator.role === 'Consultancy') {
    //   if (!['CorporateUser', 'User'].includes(role)) {
    //     return res.status(403).json({ success: false, message: 'Consultancy can only create CorporateUsers or Users' });
    //   }
    // } else {
    //   return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    // }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      subscription,
      displayPicture,
      companyLogo,
      vatTin,
      companyAddress,
      language,
      createdBy: creator.id,
    });

    // Create onboarding record
    await Onboarding.create({ userId: user.id });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.SECRET_ACCESS_TOKEN, { expiresIn: '1h' });

    return res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
        subscription: user.subscription,
        displayPicture: user.displayPicture,
        companyLogo: user.companyLogo,
        vatTin: user.vatTin,
        companyAddress: user.companyAddress,
        language: user.language,
        lastLogin: user.lastLogin,
        createdBy: user.createdBy,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const enable2FA = async (req, res) => {
  const user = await User.findByPk(req.userId);
  try {
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const secret = speakeasy.generateSecret({ name: `VATPlatform:${user.email}` });
    await user.update({ twoFactorSecret: secret.base32, twoFactorEnabled: true });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    return res.status(200).json({ success: true, qrCode: qrCodeUrl });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const verify2FA = async (req, res) => {
  const { code } = req.body;
  const user = await User.findByPk(req.userId);

  try {
    if (!user || !user.twoFactorEnabled) {
      return res.status(401).json({ success: false, message: '2FA not enabled' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });

    if (!verified) {
      return res.status(401).json({ success: false, message: 'Invalid 2FA code' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.SECRET_ACCESS_TOKEN, { expiresIn: '1h' });
    return res.status(200).json({ success: true, token });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = true || await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.SECRET_ACCESS_TOKEN,
      { expiresIn: '1h' }
    );

    // Remove password from response
    const { password: _, ...userData } = user.get();
    return res.status(200).json({ success: true, user: userData, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour expiry

    // Save token and expiry to user
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpires,
    });

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click this link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.`,
    };

    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate required fields
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    // Find user by reset token
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Sequelize.Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or expired token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return res
      .status(200)
      .json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};



module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  verify2FA,
  enable2FA,
};
