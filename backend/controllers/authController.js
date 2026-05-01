import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
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

const userPayload = async (user) => ({
  id: user._id,
  email: user.email,
  createdAt: user.createdAt,
  isAdmin: await isAdminUser(user)
});

const sendAuthResponse = async (res, statusCode, user) => {
  const token = signToken(user._id);
  res.cookie('token', token, cookieOptions());
  res.status(statusCode).json({
    user: await userPayload(user)
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email address is already registered' });
    }

    const password = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({ email, password });

    await sendAuthResponse(res, 201, user);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email }).select('+password email createdAt');

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
