import { isAdminUser } from '../utils/admin.js';

export const requireAdmin = async (req, res, next) => {
  try {
    const isAdmin = await isAdminUser(req.user);

    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.isAdmin = true;
    next();
  } catch (error) {
    next(error);
  }
};

