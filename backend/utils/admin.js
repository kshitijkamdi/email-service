import User from '../models/User.js';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export const getConfiguredAdminEmails = () =>
  String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean);

export const isAdminUser = async (user) => {
  if (!user?.email) {
    return false;
  }

  const configuredAdmins = getConfiguredAdminEmails();
  const email = normalizeEmail(user.email);

  if (configuredAdmins.length > 0) {
    return configuredAdmins.includes(email);
  }

  const firstUser = await User.findOne({}).sort({ createdAt: 1, _id: 1 }).select('_id');
  return firstUser ? String(firstUser._id) === String(user._id) : false;
};

