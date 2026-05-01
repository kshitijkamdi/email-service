import Email from '../models/Email.js';
import EmailAddress from '../models/EmailAddress.js';
import User from '../models/User.js';
import { isAdminUser } from '../utils/admin.js';

const normalizeSearch = (value) => String(value || '').trim().toLowerCase();

export const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const q = normalizeSearch(req.query.q);
    const filter = q ? { email: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } : {};

    const [users, total] = await Promise.all([
      User.find(filter).select('_id email createdAt').sort({ createdAt: 1, _id: 1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter)
    ]);

    const adminChecks = await Promise.all(users.map((user) => isAdminUser(user)));

    res.status(200).json({
      users: users.map((user, index) => ({
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        isAdmin: adminChecks[index],
        isCurrentUser: String(user._id) === String(req.user._id)
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot delete your own admin mailbox while signed in' });
    }

    const user = await User.findById(req.params.id).select('_id email');

    if (!user) {
      return res.status(404).json({ message: 'Mailbox not found' });
    }

    const ownedAddresses = await EmailAddress.find({ owner: user._id }).select('email');
    const emails = [...new Set([user.email, ...ownedAddresses.map((address) => address.email)])];
    const [messages] = await Promise.all([
      Email.deleteMany({ $or: [{ to: { $in: emails } }, { from: { $in: emails } }] }),
      EmailAddress.deleteMany({ owner: user._id }),
      User.deleteOne({ _id: user._id })
    ]);

    res.status(200).json({
      message: 'Mailbox deleted',
      deleted: {
        id: user._id,
        email: user.email,
        messages: messages.deletedCount
      }
    });
  } catch (error) {
    next(error);
  }
};
