import dns from 'node:dns';
import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const dnsServers = process.env.MONGODB_DNS_SERVERS;

  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  if (dnsServers) {
    dns.setServers(
      dnsServers
        .split(',')
        .map((server) => server.trim())
        .filter(Boolean)
    );
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};

export default connectDB;
