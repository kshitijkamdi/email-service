import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isAdminUser } from '../utils/admin.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = req.cookies?.token || bearerToken;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id email createdAt approvalStatus approvedAt approvedBy');

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireApprovedMailbox = async (req, res, next) => {
  try {
    const isAdmin = await isAdminUser(req.user);

    if (!isAdmin && req.user.approvalStatus === 'pending') {
      return res.status(403).json({
        message: 'Your mailbox is waiting for approval from admin1@reykraft.indevs.in'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
