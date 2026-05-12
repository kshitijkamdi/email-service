import Email from '../models/Email.js';
import EmailAddress from '../models/EmailAddress.js';
import User from '../models/User.js';
import { ensurePrimaryEmailAddress } from '../services/emailAddressService.js';
import { isAdminUser } from '../utils/admin.js';

const normalizeSearch = (value) => String(value || '').trim().toLowerCase();

export const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const q = normalizeSearch(req.query.q);
    const filter = q ? { email: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } : {};

    const allUsers = await User.find({}).select('_id email createdAt approvalStatus');
    await Promise.all(allUsers.map((user) => ensurePrimaryEmailAddress(user)));

    const [addresses, total] = await Promise.all([
      EmailAddress.find(filter)
        .populate('owner', '_id email createdAt approvalStatus approvedAt')
        .sort({ createdAt: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      EmailAddress.countDocuments(filter)
    ]);

    const adminChecks = await Promise.all(addresses.map((address) => isAdminUser(address.owner)));

    res.status(200).json({
      users: addresses.map((address, index) => ({
        id: address._id,
        email: address.email,
        createdAt: address.createdAt,
        isAdmin: adminChecks[index],
        approvalStatus: address.owner?.approvalStatus || 'approved',
        approvedAt: address.owner?.approvedAt,
        isPrimary: address.isPrimary,
        ownerEmail: address.owner?.email,
        ownerId: address.owner?._id,
        isCurrentUser: address.isPrimary && String(address.owner?._id) === String(req.user._id)
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

export const approveUser = async (req, res, next) => {
  try {
    const address = await EmailAddress.findById(req.params.id).populate('owner', '_id email approvalStatus approvedAt');

    if (!address?.owner) {
      return res.status(404).json({ message: 'Mailbox owner not found' });
    }

    address.owner.approvalStatus = 'approved';
    address.owner.approvedAt = new Date();
    address.owner.approvedBy = req.user._id;
    await address.owner.save();

    res.status(200).json({
      message: `${address.owner.email} approved`,
      user: {
        id: address.owner._id,
        email: address.owner.email,
        approvalStatus: address.owner.approvalStatus,
        approvedAt: address.owner.approvedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const address = await EmailAddress.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: 'Email ID not found' });
    }

    if (address.isPrimary) {
      if (String(address.owner) === String(req.user._id)) {
        return res.status(400).json({ message: 'You cannot delete your own primary email ID while signed in' });
      }

      const user = await User.findById(address.owner).select('_id email');
      if (!user) {
        return res.status(404).json({ message: 'Mailbox owner not found' });
      }

      const ownedAddresses = await EmailAddress.find({ owner: user._id }).select('email');
      const emails = [...new Set([user.email, ...ownedAddresses.map((item) => item.email)])];
      const [messages] = await Promise.all([
        Email.deleteMany({ $or: [{ to: { $in: emails } }, { from: { $in: emails } }] }),
        EmailAddress.deleteMany({ owner: user._id }),
        User.deleteOne({ _id: user._id })
      ]);

      return res.status(200).json({
        message: 'Mailbox deleted',
        deleted: {
          id: address._id,
          email: user.email,
          messages: messages.deletedCount
        }
      });
    }

    const [messages] = await Promise.all([
      Email.deleteMany({ $or: [{ to: address.email }, { from: address.email }] }),
      EmailAddress.deleteOne({ _id: address._id })
    ]);

    res.status(200).json({
      message: 'Email ID deleted',
      deleted: {
        id: address._id,
        email: address.email,
        messages: messages.deletedCount
      }
    });
  } catch (error) {
    next(error);
  }
};
