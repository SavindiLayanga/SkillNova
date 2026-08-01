import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { User } from './models/User.js';
import { CVAnalysis } from './models/CVAnalysis.js';
import { LearningPath } from './models/LearningPath.js';
import { SkillTest } from './models/SkillTest.js';
import { LibraryTest } from './models/LibraryTest.js';
import { ManualAnalysis } from './models/ManualAnalysis.js';
import { Course } from './models/Course.js';
import Job from './models/Job.js';
import { AdminNotification } from './models/AdminNotification.js';
import { PracticeSession } from './models/PracticeSession.js';
import { UserSettings } from './models/UserSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const mockDomain = '@skillnovamock.com';

const generateUID = () => 'mock_' + Math.random().toString(36).substr(2, 9);

const realisticUsers = [
  { name: 'Kavishka Prabashara', role: 'Frontend Engineer', exp: '2 years of experience building React applications.' },
  { name: 'Nimali Silva', role: 'Backend Developer', exp: 'Experienced in Node.js, Express, and MongoDB.' },
  { name: 'Kasun Perera', role: 'Full Stack Developer', exp: 'Worked on MERN stack for 3 years, building scalable systems.' },
  { name: 'Dinithi Fernando', role: 'UI/UX Designer', exp: 'Designing user-centric interfaces with Figma.' },
  { name: 'Tharindu Jayasinghe', role: 'Data Scientist', exp: 'Python, Machine Learning, and Data Analytics.' }
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected. Seeding realistic data...');

    // Cleanup previous mock data so script can be re-run safely
    await User.deleteMany({ email: { $regex: mockDomain } });
    await CVAnalysis.deleteMany({ email: { $regex: mockDomain } });
    
    for (const u of realisticUsers) {
      const email = u.name.toLowerCase().replace(' ', '.') + mockDomain;
      const uid = generateUID();

      // 1. User
      const user = new User({
        uid,
        name: u.name,
        email,
        role: 'user',
        careerGoal: `Become a Senior ${u.role}`,
        targetRole: u.role,
        experience: u.exp,
        location: 'Colombo, Sri Lanka'
      });
      await user.save();

      // 2. CVAnalysis
      const cv = new CVAnalysis({
        userId: uid,
        originalText: `Experienced ${u.role} with skills in modern tech stack. ${u.exp}`,
        name: u.name,
        email: email,
        phone: '+94 77 123 4567',
        isActive: true,
        isITRelated: true,
        technicalSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python'].slice(0, 3),
        softSkills: ['Communication', 'Teamwork', 'Problem Solving'],
        experience: [{ company: 'TechCorp Sri Lanka', role: u.role, duration: '2021-Present', description: u.exp }],
        education: [{ institution: 'University of Colombo', degree: 'BSc in Computer Science', year: '2020' }],
        projects: [{ name: 'E-commerce Platform', description: 'Built a full-stack e-commerce app.', technologies: ['React', 'Node'] }],
        targetRole: u.role,
        primaryRole: { role: u.role, confidence: 95, reason: 'Strong match with experience.' },
        jobMatches: [{ role: `Senior ${u.role}`, company: 'WSO2', match: 85, location: 'Colombo' }],
        skillMatchScore: Math.floor(Math.random() * 20) + 70,
        cvScore: Math.floor(Math.random() * 20) + 75,
        careerReadinessScore: Math.floor(Math.random() * 20) + 75,
        missingSkills: ['Docker', 'AWS', 'GraphQL']
      });
      await cv.save();

      // 3. ManualAnalysis
      const manual = new ManualAnalysis({
        userId: uid,
        name: u.name,
        targetRole: u.role,
        skills: 'JavaScript, React, Node.js',
        experience: u.exp,
        education: 'BSc Computer Science',
        isActive: true,
        skillMatchScore: 80,
        missingSkills: ['TypeScript', 'Kubernetes'],
        cvScore: 78
      });
      await manual.save();

      // 4. LearningPath
      const path = new LearningPath({
        userId: uid,
        targetRole: u.role,
        missingSkills: ['Docker', 'AWS', 'GraphQL'],
        status: 'active',
        progress: 35,
        modules: [
          { title: 'Docker Fundamentals', duration: '2 Weeks', description: 'Learn containerization.' },
          { title: 'AWS Cloud Practitioner', duration: '3 Weeks', description: 'Master cloud deployment.' }
        ]
      });
      await path.save();

      // 5. SkillTest & LibraryTest
      for (const skill of ['React', 'Node.js']) {
        const test = new SkillTest({
          userId: uid,
          skillName: skill,
          topic: 'Conceptual Quiz',
          difficulty: 'Intermediate',
          attempts: 1,
          questions: [{ question: `What is ${skill}?`, options: ['A', 'B', 'C', 'D'], correctAnswer: 0, explanation: 'Basics.' }]
        });
        await test.save();

        const libTest = new LibraryTest({
          userId: uid,
          skill: skill,
          title: `Advanced ${skill} Concepts`,
          description: `Test your advanced knowledge in ${skill}.`,
          difficulty: 'Intermediate',
          status: 'Not Started',
          estimatedMinutes: 15,
          questionCount: 10,
          questions: [{ question: `Explain advanced ${skill}.`, options: ['1', '2', '3', '4'], correctAnswer: 1, explanation: 'Advanced.' }]
        });
        await libTest.save();
      }

      // 6. PracticeSession
      const session = new PracticeSession({
        userId: uid,
        activeSession: {
          selectedTest: { title: 'React Fundamentals', isPath: false },
          currentQuestionIndex: 2,
          userAnswers: { "0": 0, "1": 1 },
          isFinished: false,
          timeLeft: 200
        }
      });
      await session.save();

      // 7. UserSettings
      const settings = new UserSettings({
        userId: uid,
        emailNotifications: true,
        pushNotifications: true,
        weeklyDigest: true,
        theme: 'dark',
        language: 'en'
      });
      await settings.save();
    }

    // Generic Collections (Courses, Jobs, Notifications) - appending realistic data
    const mockCourse = new Course({
      title: "Mastering Next.js 14 for Enterprise Apps",
      provider: "SkillNova Originals",
      category: "Programming",
      difficulty: "Advanced",
      duration: "18 Hours",
      language: "English",
      certificate: true,
      status: "Published",
      students: 4500,
      rating: 4.8,
      completionRate: 78,
      certificatesIssued: 3100,
      totalViews: 62000,
      skills: ["Next.js", "React", "TypeScript", "TailwindCSS"],
      chartData: [
        { name: 'Jan', views: 6000, enrollments: 300 },
        { name: 'Feb', views: 7500, enrollments: 450 }
      ]
    });
    await mockCourse.save();

    const mockJob = new Job({
      title: "Full Stack Engineer (MERN)",
      company: "Dialog Axiata",
      skills: ["React", "Node.js", "MongoDB", "Express"],
      description: "Join our core engineering team to build scalable telecom applications.",
      status: "Active",
      jobType: "Full-time",
      location: "Colombo, Sri Lanka",
      salaryRange: "LKR 250,000 - 400,000"
    });
    await mockJob.save();

    const mockNotification = new AdminNotification({
      title: "High System Load",
      message: "CPU utilization spiked to 90% during the recent campaign launch.",
      type: "warning",
      isRead: false,
      link: "/admin/dashboard"
    });
    await mockNotification.save();

    console.log('✅ Successfully appended realistic mock data for reports!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
