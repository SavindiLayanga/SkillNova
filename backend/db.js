import mongoose from "mongoose";
import bcrypt from "bcrypt";

const ensureAdminUser = async () => {
  try {
    const admin = await mongoose.connection.collection('users').findOne({
      $or: [{ username: 'admin' }, { email: 'admin@skillnova.com' }]
    });

    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await mongoose.connection.collection('users').insertOne({
        uid: 'admin_1',
        name: 'Super Admin',
        email: 'admin@skillnova.com',
        username: 'admin',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("🛡️ Default Admin user ensured in database.");
    }
  } catch (err) {
    console.warn("Could not check/ensure admin user:", err.message);
  }
};

const ensureDefaultJobs = async () => {
  try {
    const jobCount = await mongoose.connection.collection('jobs').countDocuments({ status: { $in: ['active', 'Active'] } });
    if (jobCount === 0) {
      const defaultJobs = [
        {
          title: "Junior React Developer",
          company: "NovaTech Labs",
          skills: ["React", "JavaScript", "TypeScript", "Tailwind CSS", "REST APIs", "Git"],
          description: "Looking for an energetic Junior React Developer to develop modern, responsive web user interfaces and integrate backend REST APIs.",
          status: "Active",
          jobType: "Full-time",
          location: "Colombo / Remote",
          salaryRange: "LKR 120,000 - 180,000",
          experienceRequired: "0-2 years",
          category: "Software Development",
          source: "SkillNova Verified Vacancy",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Frontend Developer (React / Next.js)",
          company: "Virtusa Tech",
          skills: ["React", "JavaScript", "HTML/CSS Layouts", "Redux", "APIs"],
          description: "Join our global engineering team to build scalable enterprise frontend applications using React and modern frontend frameworks.",
          status: "Active",
          jobType: "Full-time",
          location: "Colombo, Sri Lanka",
          salaryRange: "LKR 150,000 - 220,000",
          experienceRequired: "1-2 years",
          category: "Software Development",
          source: "SkillNova Verified Vacancy",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Junior Web Application Developer",
          company: "CodeGen International",
          skills: ["JavaScript", "React", "HTML/CSS Layouts", "Responsive Design", "Git"],
          description: "Develop cutting-edge travel & enterprise web systems. Ideal for graduates and junior developers with solid React and JavaScript skills.",
          status: "Active",
          jobType: "Full-time",
          location: "Colombo (Hybrid)",
          salaryRange: "LKR 110,000 - 160,000",
          experienceRequired: "0-1 years",
          category: "Software Development",
          source: "SkillNova Verified Vacancy",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Associate Frontend Engineer",
          company: "Sysco LABS",
          skills: ["React", "TypeScript", "JavaScript", "Tailwind", "CSS"],
          description: "Help build the next generation of cloud restaurant operating systems with world-class UI engineering practices.",
          status: "Active",
          jobType: "Full-time",
          location: "Colombo, Sri Lanka",
          salaryRange: "LKR 180,000 - 260,000",
          experienceRequired: "1-2 years",
          category: "Software Development",
          source: "SkillNova Verified Vacancy",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Full Stack Engineer (React & Node.js)",
          company: "WSO2",
          skills: ["React", "Node.js", "JavaScript", "REST APIs", "MongoDB"],
          description: "Design and implement full stack features across developer portals and identity server web apps.",
          status: "Active",
          jobType: "Full-time",
          location: "Colombo / Remote",
          salaryRange: "LKR 200,000 - 300,000",
          experienceRequired: "1-3 years",
          category: "Software Development",
          source: "SkillNova Verified Vacancy",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Junior UI/UX Engineer",
          company: "Zone24x7",
          skills: ["React", "JavaScript", "Figma", "Responsive Design", "CSS"],
          description: "Bridge the gap between design and engineering by developing responsive, high-performance UI components in React.",
          status: "Active",
          jobType: "Full-time",
          location: "Colombo, Sri Lanka",
          salaryRange: "LKR 130,000 - 190,000",
          experienceRequired: "0-2 years",
          category: "Software Development",
          source: "SkillNova Verified Vacancy",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await mongoose.connection.collection('jobs').insertMany(defaultJobs);
      console.log(`💼 Seeded ${defaultJobs.length} active industry jobs in database.`);
    }
  } catch (err) {
    console.warn("Could not check/ensure default jobs:", err.message);
  }
};

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 20000,
    });
    console.log("✅ MongoDB Atlas Connected");
    await ensureAdminUser();
    await ensureDefaultJobs();
  } catch (error) {
    console.error("❌ MongoDB Atlas connection error:", error.message);
    try {
      console.log("🔄 Attempting to connect to local MongoDB (mongodb://localhost:27017/skillnova)...");
      await mongoose.connect("mongodb://localhost:27017/skillnova", {
        serverSelectionTimeoutMS: 10000,
      });
      console.log("✅ Local MongoDB Connected successfully as fallback!");
      await ensureAdminUser();
      await ensureDefaultJobs();
    } catch (localErr) {
      console.error("❌ Local MongoDB connection failed:", localErr.message);
    }
  }
};
