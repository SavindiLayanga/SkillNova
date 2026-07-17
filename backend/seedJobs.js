import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Job from './models/Job.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const dummyJobs = [
  {
    title: "Junior React Developer",
    company: "NovaTech Labs",
    skills: ["React", "JavaScript", "Tailwind", "APIs"],
    description: "Looking for a passionate junior developer to join our frontend team.",
    status: "Active",
    jobType: "Full-time",
    location: "Colombo, Sri Lanka",
    salaryRange: "LKR 100,000 - 150,000"
  },
  {
    title: "Data Analyst Intern",
    company: "InsightWorks",
    skills: ["SQL", "Excel", "Python", "Dashboards"],
    description: "Great opportunity for fresh graduates to learn data analytics.",
    status: "Active",
    jobType: "Internship",
    location: "Remote",
    salaryRange: "LKR 40,000 (Stipend)"
  },
  {
    title: "Associate UI Engineer",
    company: "CloudNest",
    skills: ["Figma", "React", "Accessibility", "Testing"],
    description: "Join our design system team to build accessible components.",
    status: "Pending Approval",
    jobType: "Full-time",
    location: "Hybrid",
    salaryRange: "LKR 180,000 - 250,000"
  },
  {
    title: "Senior Node.js Backend Engineer",
    company: "FinTech Pro",
    skills: ["Node.js", "MongoDB", "Express", "Microservices"],
    description: "Lead backend development for our payment gateway.",
    status: "Active",
    jobType: "Full-time",
    location: "Colombo, Sri Lanka",
    salaryRange: "LKR 350,000+"
  },
  {
    title: "Marketing Executive",
    company: "BrandBuzz",
    skills: ["SEO", "Content Writing", "Social Media"],
    description: "Drive digital marketing campaigns and SEO strategy.",
    status: "Closed",
    jobType: "Contract",
    location: "Remote",
    salaryRange: "LKR 80,000"
  }
];

async function seedJobs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');

    // Clear existing jobs (optional, or just insert)
    await Job.deleteMany({});
    console.log('Existing jobs cleared.');

    await Job.insertMany(dummyJobs);
    console.log(`Inserted ${dummyJobs.length} jobs successfully!`);

    mongoose.disconnect();
    console.log('Done.');
  } catch (error) {
    console.error('Error seeding jobs:', error);
    process.exit(1);
  }
}

seedJobs();
