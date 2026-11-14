import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Certificate } from '../models/Certificate.js';
import { JobReadiness } from '../models/JobReadiness.js';
import { EmployerIntroduction } from '../models/EmployerIntroduction.js';
import { Course } from '../models/Course.js';
import { AuditLog } from '../models/AuditLog.js';

dotenv.config();

async function seedData() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // 1. Get sample user and job
    const user = await mongoose.connection.db.collection('users').findOne({ email: 'dilshan@gmail.com' }) 
                 || await mongoose.connection.db.collection('users').findOne({});
    const job = await mongoose.connection.db.collection('jobs').findOne({});

    const userIdStr = user._id.toString();
    const jobId = job ? job._id : new mongoose.Types.ObjectId();

    console.log(`Using User: ${user.name} (${userIdStr})`);
    if (job) console.log(`Using Job: ${job.title} (${jobId})`);

    // 2. Seed Certificate if empty
    const certCount = await Certificate.countDocuments();
    let certificateDoc;
    if (certCount === 0) {
      certificateDoc = await Certificate.create({
        userId: userIdStr,
        name: user.name,
        targetRole: 'Full-Stack Developer',
        skillsCompleted: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs'],
        jobReadinessScore: 88,
        certificateId: `SN-CERT-${Math.floor(100000 + Math.random() * 900000)}`,
        issueDate: new Date(),
        pdfUrl: '/api/public/certificates/sample-download.pdf'
      });
      console.log(`✓ Inserted sample Certificate: ${certificateDoc.certificateId}`);
    } else {
      certificateDoc = await Certificate.findOne();
      console.log(`Certificate collection already has ${certCount} documents.`);
    }

    // 3. Seed JobReadiness if empty
    const readinessCount = await JobReadiness.countDocuments();
    if (readinessCount === 0) {
      await JobReadiness.create({
        userId: userIdStr,
        targetRole: 'Full-Stack Developer',
        score: 88,
        requiredSkillsCompletedPercentage: 85,
        assessmentAverage: 90,
        isJobReady: true,
        certificateId: certificateDoc ? certificateDoc._id : null,
        lastEvaluatedAt: new Date()
      });
      console.log(`✓ Inserted sample JobReadiness record for user ${user.name}`);
    } else {
      console.log(`JobReadiness collection already has ${readinessCount} documents.`);
    }

    // 4. Seed EmployerIntroduction if empty
    const introCount = await EmployerIntroduction.countDocuments();
    if (introCount === 0 && job) {
      await EmployerIntroduction.create({
        userId: userIdStr,
        jobId: jobId,
        companyEmail: 'careers@techcorp-mock.com',
        jobMatchScore: 92,
        subject: `Job Application: Full-Stack Developer - ${user.name}`,
        coverLetter: `Dear Hiring Team,\nI am writing to express my strong interest in the Full-Stack Developer position. Having completed verified skill assessments on SkillNova with an 88% readiness score, I believe my technical competencies in React and Node.js align directly with your requirements.\n\nBest regards,\n${user.name}`,
        cvUrl: 'https://skillnova-storage.mock/cv/dilshan-cv.pdf',
        hasCvAttachment: true,
        hasCertificateAttachment: true,
        appliedVia: 'manual',
        status: 'Sent',
        sentAt: new Date()
      });
      console.log(`✓ Inserted sample EmployerIntroduction record.`);
    } else {
      console.log(`EmployerIntroduction collection already has ${introCount} documents.`);
    }

    // 5. Seed Courses if empty
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      await Course.insertMany([
        {
          title: 'Full-Stack Web Development with React & Node.js',
          provider: 'SkillNova Learning Hub',
          category: 'Web Development',
          difficulty: 'Intermediate',
          duration: '12 Hours',
          language: 'English',
          certificate: true,
          description: 'Comprehensive pathway to master full-stack modern web engineering using React 19, Express 5, and MongoDB.',
          skills: ['React.js', 'Node.js', 'Express.js', 'MongoDB'],
          status: 'Published',
          students: 1240,
          rating: 4.8,
          completionRate: 82,
          certificatesIssued: 410,
          totalViews: 5800,
          thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600'
        },
        {
          title: 'Docker & Containerization for Cloud Applications',
          provider: 'SkillNova DevOps Track',
          category: 'DevOps & Cloud',
          difficulty: 'Beginner to Intermediate',
          duration: '8 Hours',
          language: 'English',
          certificate: true,
          description: 'Learn containerizing microservices, writing Dockerfiles, and orchestrating multi-container web apps.',
          skills: ['Docker', 'DevOps', 'CI/CD', 'Containers'],
          status: 'Published',
          students: 850,
          rating: 4.9,
          completionRate: 78,
          certificatesIssued: 290,
          totalViews: 3200,
          thumbnail: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600'
        }
      ]);
      console.log(`✓ Inserted sample Courses.`);
    } else {
      console.log(`Courses collection already has ${courseCount} documents.`);
    }

    // 6. Seed AuditLogs if empty
    const auditCount = await AuditLog.countDocuments();
    if (auditCount === 0) {
      await AuditLog.insertMany([
        {
          userId: userIdStr,
          event: '2FA_SETUP_STARTED',
          ipAddress: '192.168.1.45',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
          success: true
        },
        {
          userId: userIdStr,
          event: '2FA_ENABLED',
          ipAddress: '192.168.1.45',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
          success: true
        },
        {
          userId: userIdStr,
          event: '2FA_LOGIN_SUCCESS',
          ipAddress: '192.168.1.45',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
          success: true
        }
      ]);
      console.log(`✓ Inserted sample AuditLogs.`);
    } else {
      console.log(`AuditLog collection already has ${auditCount} documents.`);
    }

    console.log('\nAll collections are verified and populated with sample records!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedData();
