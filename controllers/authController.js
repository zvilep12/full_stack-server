import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Person, Employee } from '../models/db.js';
import { sendOTPEmail } from '../utils/mailer.js';

// Secret keys from env or fallbacks
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Login Request (Phase A - Credentials check & OTP dispatch)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required fields.' });
    }

    // Find Person by email
    const person = await Person.findOne({ where: { email } });
    if (!person) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify Person is registered as an Employee
    const employee = await Employee.findByPk(person.id);
    if (!employee) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if employee account is active
    if (!employee.isActive) {
      return res.status(401).json({ error: 'Employee account is deactivated. Please contact your manager.' });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, person.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate secure 6-digit OTP code (numeric string)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Save OTP to Employee record
    await employee.update({
      otpCode,
      otpExpires: expires
    });

    // Send OTP verification email
    await sendOTPEmail(person.email, otpCode);

    // Create temporary JWT (expires in 5 minutes)
    const tempToken = jwt.sign(
      { employeeId: employee.peopleId, step: '2fa_pending' },
      JWT_SECRET,
      { expiresIn: '5m' }
    );

    res.status(200).json({
      message: 'Verification code sent to email.',
      tempToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Two-Step OTP Verification (Phase B - Token validation & session issuance)
export const verifyOTP = async (req, res) => {
  try {
    const { tempToken, code } = req.body;

    if (!tempToken || !code) {
      return res.status(400).json({ error: 'tempToken and code are required fields.' });
    }

    // Verify Temporary Token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired temporary token.' });
    }

    if (decoded.step !== '2fa_pending') {
      return res.status(401).json({ error: 'Invalid token step.' });
    }

    // Fetch Employee and Person info
    const employee = await Employee.findByPk(decoded.employeeId, { include: [Person] });
    if (!employee) {
      return res.status(401).json({ error: 'Employee profile not found.' });
    }
    if (!employee.isActive) {
      return res.status(401).json({ error: 'Employee account is deactivated.' });
    }

    // Verify OTP and Expiration
    if (employee.otpCode !== code.toString() || new Date() > new Date(employee.otpExpires)) {
      return res.status(401).json({ error: 'Invalid or expired verification code.' });
    }

    // Clear OTP fields upon successful verification
    await employee.update({
      otpCode: null,
      otpExpires: null
    });

    // Generate Final Session JWT (expires in 8 hours)
    const token = jwt.sign(
      { id: employee.peopleId, email: employee.Person.email, role: employee.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

