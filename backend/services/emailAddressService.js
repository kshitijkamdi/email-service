import crypto from 'node:crypto';
import EmailAddress from '../models/EmailAddress.js';
import User from '../models/User.js';

export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export const getEmailDomain = () => (process.env.EMAIL_DOMAIN || 'mydomain.com').toLowerCase();

const indianFirstNames = [
  'aarav',
  'aditya',
  'akash',
  'aman',
  'ananya',
  'ankit',
  'arjun',
  'ashwin',
  'diya',
  'esha',
  'gaurav',
  'ishaan',
  'kavya',
  'meera',
  'nisha',
  'pranav',
  'rahul',
  'rhea',
  'rohan',
  'saanvi',
  'shruti',
  'tanvi',
  'vihaan',
  'vikram',
  'zoya'
];

const indianLastNames = [
  'agarwal',
  'bansal',
  'bhatt',
  'desai',
  'iyer',
  'jain',
  'kapoor',
  'kulkarni',
  'mehta',
  'menon',
  'nair',
  'patel',
  'rao',
  'reddy',
  'sharma',
  'singh',
  'thapar',
  'trivedi',
  'varma',
  'yadav'
];

const pick = (items) => items[crypto.randomInt(0, items.length)];

const buildAuthenticLocalPart = (attempt) => {
  const firstName = pick(indianFirstNames);
  const lastName = pick(indianLastNames);

  if (attempt < 16) {
    return `${firstName}${lastName}`;
  }

  if (attempt < 32) {
    return `${firstName}.${lastName}`;
  }

  return `${firstName}${lastName}${crypto.randomInt(10, 99)}`;
};

export const ensurePrimaryEmailAddress = async (user) => {
  const email = normalizeEmail(user?.email);

  if (!user?._id || !email) {
    return null;
  }

  return EmailAddress.findOneAndUpdate(
    { email },
    { $setOnInsert: { owner: user._id, email, isPrimary: true } },
    { new: true, upsert: true }
  );
};

export const listOwnedEmailAddresses = async (user) => {
  await ensurePrimaryEmailAddress(user);
  return EmailAddress.find({ owner: user._id }).sort({ isPrimary: -1, createdAt: 1, _id: 1 });
};

export const getOwnedAddress = async (user, email) => {
  const normalized = normalizeEmail(email || user.email);
  await ensurePrimaryEmailAddress(user);
  return EmailAddress.findOne({ owner: user._id, email: normalized });
};

export const assertOwnedAddress = async (user, email) => {
  const address = await getOwnedAddress(user, email);

  if (!address) {
    const error = new Error('Email address is not part of this account');
    error.statusCode = 403;
    throw error;
  }

  return address.email;
};

export const findOwnerByAddress = async (email) => {
  const normalized = normalizeEmail(email);
  const address = await EmailAddress.findOne({ email: normalized });

  if (address) {
    return {
      owner: await User.findById(address.owner),
      address
    };
  }

  const user = await User.findOne({ email: normalized });
  if (!user) {
    return { owner: null, address: null };
  }

  return {
    owner: user,
    address: await ensurePrimaryEmailAddress(user)
  };
};

export const createGeneratedEmailAddress = async (user) => {
  const domain = getEmailDomain();

  for (let attempt = 0; attempt < 48; attempt += 1) {
    const email = `${buildAuthenticLocalPart(attempt)}@${domain}`;

    try {
      return await EmailAddress.create({
        owner: user._id,
        email,
        isPrimary: false
      });
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }
    }
  }

  const error = new Error('Could not generate a unique email address');
  error.statusCode = 500;
  throw error;
};
