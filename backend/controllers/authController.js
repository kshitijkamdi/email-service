import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import EmailAddress from '../models/EmailAddress.js';
import User from '../models/User.js';
import { ensurePrimaryEmailAddress, listOwnedEmailAddresses } from '../services/emailAddressService.js';
import { isAdminUser } from '../utils/admin.js';

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
});

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

const userPayload = async (user) => {
  const addresses = await listOwnedEmailAddresses(user);

  return {
    id: user._id,
    email: user.email,
    createdAt: user.createdAt,
    isAdmin: await isAdminUser(user),
    approvalStatus: user.approvalStatus || 'approved',
    approvedAt: user.approvedAt,
    addresses: addresses.map((address) => ({
      id: address._id,
      email: address.email,
      isPrimary: address.isPrimary,
      createdAt: address.createdAt
    }))
  };
};

const sendAuthResponse = async (res, statusCode, user) => {
  const token = signToken(user._id);
  res.cookie('token', token, cookieOptions());
  res.status(statusCode).json({
    user: await userPayload(user),
    token
  });
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const ensureAllowedDomain = (email) => {
  const domain = process.env.EMAIL_DOMAIN || 'mydomain.com';
  return email.endsWith(`@${domain.toLowerCase()}`);
};

export const register = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!ensureAllowedDomain(email)) {
      return res.status(400).json({
        message: `Email must use @${process.env.EMAIL_DOMAIN || 'mydomain.com'}`
      });
    }

    const existingAddress = await EmailAddress.findOne({ email });
    const existingUser = await User.findOne({ email });
    if (existingUser || existingAddress) {
      return res.status(409).json({ message: 'Email address is already registered' });
    }

    const password = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({ email, password });

    if (await isAdminUser(user)) {
      user.approvalStatus = 'approved';
      user.approvedAt = new Date();
      user.approvedBy = user._id;
      await user.save();
    }

    await ensurePrimaryEmailAddress(user);

    await sendAuthResponse(res, 201, user);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const directUser = await User.findOne({ email }).select('+password email createdAt approvalStatus approvedAt approvedBy');
    const address = directUser ? null : await EmailAddress.findOne({ email });
    const user = directUser || (address ? await User.findById(address.owner).select('+password email createdAt approvalStatus approvedAt approvedBy') : null);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await sendAuthResponse(res, 200, user);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      user: await userPayload(req.user)
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', cookieOptions());
  res.status(200).json({ message: 'Logged out' });
};
