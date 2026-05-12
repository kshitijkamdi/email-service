import { createGeneratedEmailAddress, listOwnedEmailAddresses } from '../services/emailAddressService.js';
import { isAdminUser } from '../utils/admin.js';

const serializeAddress = (address) => ({
  id: address._id,
  email: address.email,
  isPrimary: address.isPrimary,
  createdAt: address.createdAt
});

export const listEmailAddresses = async (req, res, next) => {
  try {
    const addresses = await listOwnedEmailAddresses(req.user);
    res.status(200).json({ addresses: addresses.map(serializeAddress) });
  } catch (error) {
    next(error);
  }
};

export const createEmailAddress = async (req, res, next) => {
  try {
    const isAdmin = await isAdminUser(req.user);

    if (isAdmin && req.user.approvalStatus === 'pending') {
      req.user.approvalStatus = 'approved';
      req.user.approvedAt = new Date();
      req.user.approvedBy = req.user._id;
      await req.user.save();
    }

    const address = await createGeneratedEmailAddress(req.user);
    res.status(201).json({ address: serializeAddress(address) });
  } catch (error) {
    next(error);
  }
};
