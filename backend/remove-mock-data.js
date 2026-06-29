import { connectDB } from './db.js';
import { CVAnalysis } from './models/CVAnalysis.js';
import { ManualAnalysis } from './models/ManualAnalysis.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connectDB();
  const deletedCV = await CVAnalysis.deleteMany({ name: { $regex: 'Mock', $options: 'i' } });
  const deletedManual = await ManualAnalysis.deleteMany({ name: { $regex: 'Mock', $options: 'i' } });
  
  // also delete Jane Doe specifically
  const deletedJaneCV = await CVAnalysis.deleteMany({ name: { $regex: 'Jane Doe', $options: 'i' } });
  const deletedJaneManual = await ManualAnalysis.deleteMany({ name: { $regex: 'Jane Doe', $options: 'i' } });

  console.log(`Deleted Mock CV Analyses: ${deletedCV.deletedCount}`);
  console.log(`Deleted Mock Manual Analyses: ${deletedManual.deletedCount}`);
  console.log(`Deleted Jane Doe CV Analyses: ${deletedJaneCV.deletedCount}`);
  console.log(`Deleted Jane Doe Manual Analyses: ${deletedJaneManual.deletedCount}`);
  process.exit(0);
}

run().catch(console.error);
