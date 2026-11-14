import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function inspect() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n--- EXISTING COLLECTIONS IN DATABASE ---');
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`- ${col.name} (${count} documents)`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1);
  }
}

inspect();
