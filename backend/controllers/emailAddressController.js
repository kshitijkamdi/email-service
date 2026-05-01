import { createGeneratedEmailAddress, listOwnedEmailAddresses } from '../services/emailAddressService.js';

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
    const address = await createGeneratedEmailAddress(req.user);
    res.status(201).json({ address: serializeAddress(address) });
  } catch (error) {
    next(error);
  }
};
