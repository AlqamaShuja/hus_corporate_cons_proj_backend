const {
  User,
  Document,
  Report,
  Payment,
  AuditLog,
  SupportTicket,
} = require('../models');
const { processDocument } = require('../utils/documentProcessor'); // AI document parsing (Tika/Ollama/GPT)
const { generateReportFile } = require('../utils/reportGenerator'); // Report generation logic
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bcrypt = require('bcrypt');

// Create a new user
const createUser = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    phone,
    subscription,
    vatTin,
    companyAddress,
    language,
  } = req.body;
  const displayPicture = req.files?.displayPicture
    ? `/uploads/${req.files.displayPicture[0].filename}`
    : null;
  const companyLogo = req.files?.companyLogo
    ? `/uploads/${req.files.companyLogo[0].filename}`
    : null;
  const creator = await User.findByPk(req.userId); // Fetch creator using req.userId

  try {
    // Validate role-based permissions
    if (!creator) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized: Creator not found' });
    }
    if (creator.role === 'SuperAdmin') {
      if (
        !['CorporateUser', 'User', 'Consultancy', 'ComplianceOfficer'].includes(
          role
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: 'Invalid role for SuperAdmin to create',
          });
      }
    } else if (creator.role === 'CorporateUser') {
      if (role !== 'User') {
        return res
          .status(403)
          .json({
            success: false,
            message: 'CorporateUser can only create Users',
          });
      }
    } else if (creator.role === 'Consultancy') {
      if (!['CorporateUser', 'User'].includes(role)) {
        return res
          .status(403)
          .json({
            success: false,
            message: 'Consultancy can only create CorporateUsers or Users',
          });
      }
    } else {
      return res
        .status(403)
        .json({ success: false, message: 'Insufficient permissions' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await User.create({
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

    return res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        subscription: newUser.subscription,
        displayPicture: newUser.displayPicture,
        companyLogo: newUser.companyLogo,
        vatTin: newUser.vatTin,
        companyAddress: newUser.companyAddress,
        language: newUser.language,
        createdBy: newUser.createdBy,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    let users;
    if (req.userRole === 'SuperAdmin') {
      users = await User.findAll({
        attributes: {
          exclude: [
            'password',
            'resetPasswordOtp',
            'resetPasswordExpires',
            'twoFactorSecret',
          ],
        },
      });
    } else if (
      req.userRole === 'CorporateUser' ||
      req.userRole === 'Consultancy'
    ) {
      users = await User.findAll({
        where: { createdBy: req.userId },
        attributes: {
          exclude: [
            'password',
            'resetPasswordOtp',
            'resetPasswordExpires',
            'twoFactorSecret',
          ],
        },
      });
    } else {
      return res
        .status(403)
        .json({ success: false, message: 'Insufficient permissions' });
    }
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: {
        exclude: [
          'password',
          'resetPasswordOtp',
          'resetPasswordExpires',
          'twoFactorSecret',
        ],
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Restrict access to creator or SuperAdmin
    if (req.userRole !== 'SuperAdmin' && user.createdBy !== req.userId) {
      return res
        .status(403)
        .json({ success: false, message: 'Insufficient permissions' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      role,
      phone,
      subscription,
      vatTin,
      companyAddress,
      language,
      status,
    } = req.body;
    const displayPicture = req.files?.displayPicture
      ? `/uploads/${req.files.displayPicture[0].filename}`
      : undefined;
    const companyLogo = req.files?.companyLogo
      ? `/uploads/${req.files.companyLogo[0].filename}`
      : undefined;

    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Restrict updates to SuperAdmin or Consultancy
    if (req.userRole !== 'SuperAdmin' && req.userRole !== 'Consultancy') {
      return res
        .status(403)
        .json({ success: false, message: 'Insufficient permissions' });
    }

    // Validate role changes
    if (
      role &&
      req.userRole === 'Consultancy' &&
      !['CorporateUser', 'User'].includes(role)
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'Consultancy can only update to CorporateUser or User roles',
        });
    }

    // Update fields
    const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (role) updatedData.role = role;
    if (phone) updatedData.phone = phone;
    if (subscription) updatedData.subscription = subscription;
    if (vatTin) updatedData.vatTin = vatTin;
    if (companyAddress) updatedData.companyAddress = companyAddress;
    if (language) updatedData.language = language;
    if (status) updatedData.status = status;
    if (displayPicture) updatedData.displayPicture = displayPicture;
    if (companyLogo) updatedData.companyLogo = companyLogo;

    await user.update(updatedData);

    const {
      password,
      resetPasswordOtp,
      resetPasswordExpires,
      twoFactorSecret,
      ...userData
    } = user.get();
    return res.status(200).json({ success: true, data: userData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Only SuperAdmin can delete users
    if (req.userRole !== 'SuperAdmin') {
      return res
        .status(403)
        .json({ success: false, message: 'Insufficient permissions' });
    }

    await user.destroy();
    return res.status(204).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Upload document
const uploadDocument = async (req, res) => {
  const { fileType, tag } = req.body;
  const file = req.file;

  try {
    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: 'No file uploaded' });
    }

    const metadata = await processDocument(file.path); // (Tika Server)
    const document = await Document.create({
      userId: req.userId,
      filePath: `/uploads/${file.filename}`,
      fileType,
      tag,
      metadata,
    });

    await AuditLog.create({
      userId: req.userId,
      documentId: document.id,
      action: 'upload_document',
      details: { fileType, tag },
    });

    return res.status(201).json({ success: true, data: document });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Generate report
const generateReport = async (req, res) => {
  const { documentId, format } = req.body;

  try {
    const document = await Document.findByPk(documentId);
    if (!document || document.userId !== req.userId) {
      return res
        .status(404)
        .json({
          success: false,
          message: 'Document not found or unauthorized',
        });
    }

    const reportData = await generateReportFile(document, format); // Hypothetical report generation
    const report = await Report.create({
      userId: req.userId,
      documentId,
      status: 'draft',
      format,
      data: reportData,
      watermark: true,
    });

    await AuditLog.create({
      userId: req.userId,
      reportId: report.id,
      action: 'generate_report',
      details: { format },
    });

    return res.status(201).json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Preview report
const previewReport = async (req, res) => {
  const { id } = req.params;

  try {
    const report = await Report.findByPk(id);
    if (!report || report.userId !== req.userId) {
      return res
        .status(404)
        .json({ success: false, message: 'Report not found or unauthorized' });
    }

    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Edit report
const editReport = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;

  try {
    const report = await Report.findByPk(id);
    if (!report || report.userId !== req.userId) {
      return res
        .status(404)
        .json({ success: false, message: 'Report not found or unauthorized' });
    }

    const oldData = report.data;
    await report.update({ data });

    await AuditLog.create({
      userId: req.userId,
      reportId: report.id,
      action: 'edit_report',
      details: { oldData, newData: data },
    });

    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Download report
const downloadReport = async (req, res) => {
  const { id } = req.params;

  try {
    const report = await Report.findByPk(id);
    if (!report || report.userId !== req.userId) {
      return res
        .status(404)
        .json({ success: false, message: 'Report not found or unauthorized' });
    }

    if (report.status !== 'completed') {
      return res
        .status(403)
        .json({
          success: false,
          message: 'Payment pending or report not completed',
        });
    }

    // Serve file (implementation depends on storage)
    res.download(report.data.filePath);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get report history
const getReportHistory = async (req, res) => {
  try {
    const reports = await Report.findAll({
      where: { userId: req.userId },
      include: [{ model: Document, attributes: ['fileType', 'tag'] }],
    });

    return res.status(200).json({ success: true, data: reports });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create payment
const createPayment = async (req, res) => {
  const { amount, type, stripePaymentId } = req.body;

  try {
    const payment = await Payment.create({
      userId: req.userId,
      amount,
      type,
      stripePaymentId,
      status: 'pending',
      credits: type === 'credit_topup' ? Math.floor(amount / 10) : 0, // Example conversion
    });

    // Verify Stripe payment (US-D7)
    const stripePayment = await stripe.paymentIntents.retrieve(stripePaymentId);
    if (stripePayment.status === 'succeeded') {
      await payment.update({ status: 'completed' });
      if (type === 'report') {
        const report = await Report.findOne({
          where: { userId: req.userId, status: 'pending_payment' },
        });
        if (report)
          await report.update({ status: 'completed', watermark: false });
      }
    }

    return res.status(201).json({ success: true, data: payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get payments
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { userId: req.userId },
    });

    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Top up credits
const topUpCredits = async (req, res) => {
  const { amount } = req.body;

  try {
    const payment = await Payment.create({
      userId: req.userId,
      amount,
      type: 'credit_topup',
      credits: Math.floor(amount / 10),
      status: 'completed',
    });

    return res.status(200).json({ success: true, credits: payment.credits });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get audit logs
const getAuditLogs = async (req, res) => {
  try {
    let auditLogs;
    if (req.userRole === 'SuperAdmin' || req.userRole === 'ComplianceOfficer') {
      auditLogs = await AuditLog.findAll({
        include: [
          { model: User, attributes: ['name', 'email'] },
          { model: Document, attributes: ['fileType', 'tag'] },
          { model: Report, attributes: ['status', 'format'] },
        ],
      });
    } else {
      auditLogs = await AuditLog.findAll({
        where: { userId: req.userId },
        include: [
          { model: User, attributes: ['name', 'email'] },
          { model: Document, attributes: ['fileType', 'tag'] },
          { model: Report, attributes: ['status', 'format'] },
        ],
      });
    }

    return res.status(200).json({ success: true, data: auditLogs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create support ticket
const createSupportTicket = async (req, res) => {
  const { subject, description } = req.body;

  try {
    const ticket = await SupportTicket.create({
      userId: req.userId,
      subject,
      description,
      status: 'open',
    });

    return res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get support tickets
const getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({
      where: { userId: req.userId },
    });

    return res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadDocument,
  generateReport,
  previewReport,
  editReport,
  downloadReport,
  getReportHistory,
  createPayment,
  getPayments,
  topUpCredits,
  getAuditLogs,
  createSupportTicket,
  getSupportTickets,
};
