import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { AuditLog } from '../models/AuditLog.js';

dotenv.config();

async function seedAuditLogs() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const users = await mongoose.connection.db.collection('users').find().toArray();
    const userIds = users.map(u => u._id.toString());
    
    const u1 = userIds[0] || '6a6d8e6580343c9aee48fac4';
    const u2 = userIds[1] || '6a6d907680343c9aee48fac6';
    const u3 = userIds[2] || '6a6d942b80343c9aee48fad0';
    const admin = userIds[3] || '6a8e72836d54af3841f318bc';

    const dummyLogs = [
      {
        userId: u1,
        event: '2FA_SETUP_STARTED',
        ipAddress: '112.134.198.54',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        success: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48) // 2 days ago
      },
      {
        userId: u1,
        event: '2FA_ENABLED',
        ipAddress: '112.134.198.54',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        success: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 47)
      },
      {
        userId: u1,
        event: '2FA_LOGIN_SUCCESS',
        ipAddress: '112.134.198.54',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        success: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
      },
      {
        userId: u2,
        event: '2FA_SETUP_STARTED',
        ipAddress: '175.157.82.12',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        success: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20)
      },
      {
        userId: u2,
        event: '2FA_ENABLED',
        ipAddress: '175.157.82.12',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        success: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 19)
      },
      {
        userId: u2,
        event: '2FA_LOGIN_FAILED',
        ipAddress: '175.157.82.12',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        success: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12)
      },
      {
        userId: u2,
        event: '2FA_LOGIN_SUCCESS',
        ipAddress: '175.157.82.12',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        success: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 11)
      },
      {
        userId: u3,
        event: '2FA_LOGIN_FAILED',
        ipAddress: '192.248.43.10',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0',
        success: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8)
      },
      {
        userId: u3,
        event: 'RECOVERY_CODE_USED',
        ipAddress: '192.248.43.10',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0',
        success: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7)
      },
      {
        userId: admin,
        event: '2FA_LOGIN_SUCCESS',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        success: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3)
      },
      {
        userId: admin,
        event: '2FA_ENABLED',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        success: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        userId: u1,
        event: '2FA_LOGIN_SUCCESS',
        ipAddress: '112.134.198.54',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        success: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 mins ago
      }
    ];

    const result = await AuditLog.insertMany(dummyLogs);
    console.log(`✓ Successfully inserted ${result.length} dummy audit logs!`);

    const total = await AuditLog.countDocuments();
    console.log(`Total documents in 'auditlogs' collection now: ${total}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding audit logs:', error);
    process.exit(1);
  }
}

seedAuditLogs();
