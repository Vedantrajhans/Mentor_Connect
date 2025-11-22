import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Session from "../models/Session.js";

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

// Professional Mentor Data
const mentors = [
  {
    email: "sarah.chen@stanford.edu",
    password: "mentor123",
    role: "mentor",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "Sarah Chen",
      phone: "+1-650-555-0101",
      bio: "CS major at Stanford with a passion for AI/ML. Helped 50+ students navigate tech admissions. Former intern at Google and Microsoft. Love discussing algorithm design, research opportunities, and campus culture. Happy to review essays and provide interview prep!",
      university: "Stanford University",
      program: "Computer Science",
      graduationYear: 2025,
      expertise: [
        "CS Admissions",
        "Tech Interviews",
        "Research Opportunities",
        "Essay Review",
        "AI/ML Programs",
      ],
      rating: 4.9,
      totalReviews: 47,
      availability: generateAvailability(14),
      photo: "https://i.pravatar.cc/300?img=5",
    },
  },
  {
    email: "james.wilson@mit.edu",
    password: "mentor123",
    role: "mentor",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "James Wilson",
      phone: "+1-617-555-0102",
      bio: "MIT junior studying Electrical Engineering and Computer Science. Passionate about hardware, robotics, and embedded systems. President of the Robotics Club. Can help with MIT-specific application tips, project portfolio building, and navigating STEM programs.",
      university: "Massachusetts Institute of Technology",
      program: "Electrical Engineering & Computer Science",
      graduationYear: 2026,
      expertise: [
        "MIT Admissions",
        "Robotics",
        "Project Portfolio",
        "STEM Programs",
        "Financial Aid",
      ],
      rating: 4.8,
      totalReviews: 35,
      availability: generateAvailability(10),
      photo: "https://i.pravatar.cc/300?img=12",
    },
  },
  {
    email: "priya.sharma@harvard.edu",
    password: "mentor123",
    role: "mentor",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "Priya Sharma",
      phone: "+1-617-555-0103",
      bio: "Pre-med student at Harvard studying Molecular & Cellular Biology. Active in medical research and community health initiatives. Here to guide aspiring doctors through the challenging pre-med path, research opportunities, and balancing academics with extracurriculars.",
      university: "Harvard University",
      program: "Molecular & Cellular Biology",
      graduationYear: 2025,
      expertise: [
        "Pre-Med Guidance",
        "Research Labs",
        "Medical Volunteering",
        "Ivy League Admissions",
        "Scholarship Applications",
      ],
      rating: 5.0,
      totalReviews: 52,
      availability: generateAvailability(12),
      photo: "https://i.pravatar.cc/300?img=9",
    },
  },
  {
    email: "david.kim@berkeley.edu",
    password: "mentor123",
    role: "mentor",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "David Kim",
      phone: "+1-510-555-0104",
      bio: "UC Berkeley senior in Business Administration. Founder of two campus startups. Specialize in entrepreneurship, business strategy, and Haas School admissions. Can discuss startup culture, business case competitions, and career paths in consulting and finance.",
      university: "UC Berkeley",
      program: "Business Administration",
      graduationYear: 2024,
      expertise: [
        "Business School Admissions",
        "Entrepreneurship",
        "Startup Culture",
        "Case Competitions",
        "Career Planning",
      ],
      rating: 4.7,
      totalReviews: 29,
      availability: generateAvailability(8),
      photo: "https://i.pravatar.cc/300?img=13",
    },
  },
  {
    email: "emily.rodriguez@columbia.edu",
    password: "mentor123",
    role: "mentor",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "Emily Rodriguez",
      phone: "+1-212-555-0105",
      bio: "International student from Spain studying Political Science and Economics at Columbia. Experienced with navigating US admissions as an international applicant. Love discussing global affairs, UN internships, and the vibrant NYC student life!",
      university: "Columbia University",
      program: "Political Science & Economics",
      graduationYear: 2025,
      expertise: [
        "International Student Admissions",
        "Political Science",
        "Study Abroad",
        "NYC Life",
        "UN Internships",
      ],
      rating: 4.9,
      totalReviews: 41,
      availability: generateAvailability(15),
      photo: "https://i.pravatar.cc/300?img=10",
    },
  },
  {
    email: "michael.chang@caltech.edu",
    password: "mentor123",
    role: "mentor",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "Michael Chang",
      phone: "+1-626-555-0106",
      bio: "Physics PhD candidate at Caltech. Former undergrad at Princeton. Research focus on quantum computing. Passionate about making physics accessible and fun. Can help with graduate school applications, research experience, and surviving rigorous STEM programs.",
      university: "California Institute of Technology",
      program: "Physics (PhD)",
      graduationYear: 2026,
      expertise: [
        "Physics Programs",
        "Graduate School",
        "Research Publications",
        "Quantum Computing",
        "STEM Careers",
      ],
      rating: 4.8,
      totalReviews: 23,
      availability: generateAvailability(7),
      photo: "https://i.pravatar.cc/300?img=14",
    },
  },
  {
    email: "sophia.patel@yale.edu",
    password: "mentor123",
    role: "mentor",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "Sophia Patel",
      phone: "+1-203-555-0107",
      bio: "Environmental Engineering major at Yale with a minor in Climate Change Policy. Leader of the campus sustainability initiative. Excited to discuss environmental careers, policy work, and making a difference through engineering.",
      university: "Yale University",
      program: "Environmental Engineering",
      graduationYear: 2026,
      expertise: [
        "Environmental Programs",
        "Sustainability",
        "Climate Policy",
        "Engineering Admissions",
        "Campus Leadership",
      ],
      rating: 4.9,
      totalReviews: 38,
      availability: generateAvailability(11),
      photo: "https://i.pravatar.cc/300?img=16",
    },
  },
  {
    email: "alex.morgan@princeton.edu",
    password: "mentor123",
    role: "mentor",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "Alex Morgan",
      phone: "+1-609-555-0108",
      bio: "Math and Computer Science double major at Princeton. Captain of the debate team. Love exploring the intersection of logic, philosophy, and technology. Here to help with Ivy League apps, competitive math programs, and student-athlete balance.",
      university: "Princeton University",
      program: "Mathematics & Computer Science",
      graduationYear: 2025,
      expertise: [
        "Math Programs",
        "Debate & Public Speaking",
        "Student-Athlete",
        "Ivy Admissions",
        "Logic & Philosophy",
      ],
      rating: 4.7,
      totalReviews: 31,
      availability: generateAvailability(9),
      photo: "https://i.pravatar.cc/300?img=33",
    },
  },
  {
    email: "olivia.brown@uchicago.edu",
    password: "mentor123",
    role: "mentor",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "Olivia Brown",
      phone: "+1-773-555-0109",
      bio: "Economics and Data Science student at UChicago. Interned at the Federal Reserve and Goldman Sachs. Passionate about quantitative research and econometrics. Can guide on finance careers, research assistantships, and the UChicago Core Curriculum.",
      university: "University of Chicago",
      program: "Economics & Data Science",
      graduationYear: 2024,
      expertise: [
        "Economics",
        "Finance Careers",
        "Data Science",
        "Research Positions",
        "UChicago Culture",
      ],
      rating: 4.8,
      totalReviews: 27,
      availability: generateAvailability(10),
      photo: "https://i.pravatar.cc/300?img=20",
    },
  },
  {
    email: "ryan.thompson@cornell.edu",
    password: "mentor123",
    role: "mentor",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "Ryan Thompson",
      phone: "+1-607-555-0110",
      bio: "Hotel Administration major at Cornell School of Hotel Administration. Worked with Marriott and Hilton. First-generation college student passionate about hospitality, entrepreneurship, and helping students from underrepresented backgrounds navigate college.",
      university: "Cornell University",
      program: "Hotel Administration",
      graduationYear: 2025,
      expertise: [
        "Hospitality Industry",
        "First-Gen Students",
        "Business Programs",
        "Internship Search",
        "Cornell Life",
      ],
      rating: 5.0,
      totalReviews: 44,
      availability: generateAvailability(13),
      photo: "https://i.pravatar.cc/300?img=15",
    },
  },
  {
    email: "jessica.lee@duke.edu",
    password: "mentor123",
    role: "mentor",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "Jessica Lee",
      phone: "+1-919-555-0111",
      bio: "Biomedical Engineering student at Duke. Involved in medical device innovation and global health projects. Member of Duke Engineers for International Development. Happy to discuss BME programs, global health, and Duke collaborative culture.",
      university: "Duke University",
      program: "Biomedical Engineering",
      graduationYear: 2026,
      expertise: [
        "Biomedical Engineering",
        "Medical Devices",
        "Global Health",
        "Engineering Design",
        "Duke Admissions",
      ],
      rating: 4.9,
      totalReviews: 36,
      availability: generateAvailability(12),
      photo: "https://i.pravatar.cc/300?img=23",
    },
  },
  {
    email: "carlos.santos@northwestern.edu",
    password: "mentor123",
    role: "mentor",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "Carlos Santos",
      phone: "+1-847-555-0112",
      bio: "Journalism and Political Science major at Northwestern Medill School. Editor-in-Chief of the student newspaper. Passionate about investigative journalism, media ethics, and storytelling. Can help with journalism school applications and building your portfolio.",
      university: "Northwestern University",
      program: "Journalism & Political Science",
      graduationYear: 2025,
      expertise: [
        "Journalism School",
        "Media & Communications",
        "Portfolio Building",
        "Student Publications",
        "Writing Skills",
      ],
      rating: 4.8,
      totalReviews: 29,
      availability: generateAvailability(8),
      photo: "https://i.pravatar.cc/300?img=11",
    },
  },
];

// Mentee Data
const mentees = [
  {
    email: "john.doe@gmail.com",
    password: "mentee123",
    role: "mentee",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "John Doe",
      phone: "+1-555-123-4567",
      bio: "High school senior passionate about computer science and robotics. Dream schools include MIT and Stanford.",
      targetUniversities: ["MIT", "Stanford", "UC Berkeley", "Carnegie Mellon"],
      desiredProgram: "Computer Science",
      photo: "https://i.pravatar.cc/300?img=60",
    },
  },
  {
    email: "emma.johnson@gmail.com",
    password: "mentee123",
    role: "mentee",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "Emma Johnson",
      phone: "+1-555-234-5678",
      bio: "Aspiring pre-med student interested in neuroscience. Looking for guidance on Ivy League applications.",
      targetUniversities: ["Harvard", "Yale", "Johns Hopkins", "Duke"],
      desiredProgram: "Neuroscience / Pre-Med",
      photo: "https://i.pravatar.cc/300?img=45",
    },
  },
  {
    email: "daniel.garcia@gmail.com",
    password: "mentee123",
    role: "mentee",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "Daniel Garcia",
      phone: "+1-555-345-6789",
      bio: "International student from Mexico interested in business and entrepreneurship. First-gen college applicant.",
      targetUniversities: [
        "Wharton",
        "UC Berkeley Haas",
        "NYU Stern",
        "USC Marshall",
      ],
      desiredProgram: "Business Administration",
      photo: "https://i.pravatar.cc/300?img=52",
    },
  },
  {
    email: "sophia.williams@gmail.com",
    password: "mentee123",
    role: "mentee",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "Sophia Williams",
      phone: "+1-555-456-7890",
      bio: "Passionate about environmental science and sustainability. Want to make a positive impact on climate change.",
      targetUniversities: ["Yale", "Stanford", "UC Berkeley", "Cornell"],
      desiredProgram: "Environmental Science",
      photo: "https://i.pravatar.cc/300?img=48",
    },
  },
  {
    email: "ethan.martinez@gmail.com",
    password: "mentee123",
    role: "mentee",
    isApproved: true,
    isActive: true,
    profile: {
      fullName: "Ethan Martinez",
      phone: "+1-555-567-8901",
      bio: "Math enthusiast and competitive programmer. Targeting top CS programs with strong theory focus.",
      targetUniversities: ["MIT", "Caltech", "Princeton", "CMU"],
      desiredProgram: "Computer Science / Mathematics",
      photo: "https://i.pravatar.cc/300?img=67",
    },
  },
];

// Admin Account
const admin = {
  email: "admin@mentorconnect.com",
  password: "admin123",
  role: "admin",
  isApproved: true,
  isActive: true,
  profile: {
    fullName: "Admin User",
    phone: "+1-555-000-0000",
    bio: "Platform Administrator",
  },
};

// Helper function to generate availability (future dates)
function generateAvailability(daysAhead) {
  const slots = [];
  const today = new Date();

  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    // Add morning slot (10 AM)
    const morning = new Date(date);
    morning.setHours(10, 0, 0, 0);
    slots.push(morning);

    // Add afternoon slot (2 PM)
    const afternoon = new Date(date);
    afternoon.setHours(14, 0, 0, 0);
    slots.push(afternoon);
  }

  return slots;
}

// Hash password helper
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Main seed function
async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Session.deleteMany({});
    console.log("✅ Existing data cleared");

    // Create admin
    console.log("👑 Creating admin account...");
    const hashedAdminPassword = await hashPassword(admin.password);
    await User.create({ ...admin, password: hashedAdminPassword });
    console.log("✅ Admin created: admin@mentorconnect.com / admin123");

    // Create mentors
    console.log("👨‍🏫 Creating mentor accounts...");
    for (const mentor of mentors) {
      const hashedPassword = await hashPassword(mentor.password);
      await User.create({ ...mentor, password: hashedPassword });
      console.log(
        `✅ Created mentor: ${mentor.profile.fullName} (${mentor.email})`
      );
    }

    // Create mentees
    console.log("👨‍🎓 Creating mentee accounts...");
    for (const mentee of mentees) {
      const hashedPassword = await hashPassword(mentee.password);
      await User.create({ ...mentee, password: hashedPassword });
      console.log(
        `✅ Created mentee: ${mentee.profile.fullName} (${mentee.email})`
      );
    }

    // Create some sample sessions
    console.log("📅 Creating sample sessions...");
    const allMentors = await User.find({ role: "mentor" });
    const allMentees = await User.find({ role: "mentee" });

    if (allMentors.length > 0 && allMentees.length > 0) {
      // Create 3 confirmed sessions
      for (let i = 0; i < 3; i++) {
        const mentor = allMentors[i % allMentors.length];
        const mentee = allMentees[i % allMentees.length];
        const startTime = new Date();
        startTime.setDate(startTime.getDate() + i + 2);
        startTime.setHours(14, 0, 0, 0);

        await Session.create({
          mentee: mentee._id,
          mentor: mentor._id,
          startTime,
          endTime: new Date(startTime.getTime() + 60 * 60 * 1000),
          topic: "University Admissions Guidance",
          status: "confirmed",
          zoomLink: `https://zoom.us/j/12345678${i}?pwd=demo`,
          zoomMeetingId: `12345678${i}`,
          zoomPassword: "demo123",
        });
      }

      // Create 2 pending sessions
      for (let i = 0; i < 2; i++) {
        const mentor = allMentors[(i + 3) % allMentors.length];
        const mentee = allMentees[(i + 1) % allMentees.length];
        const startTime = new Date();
        startTime.setDate(startTime.getDate() + i + 5);
        startTime.setHours(10, 0, 0, 0);

        await Session.create({
          mentee: mentee._id,
          mentor: mentor._id,
          startTime,
          endTime: new Date(startTime.getTime() + 60 * 60 * 1000),
          topic: "Essay Review and Feedback",
          status: "pending",
        });
      }

      console.log("✅ Sample sessions created");
    }

    console.log("\n🎉 Database seeded successfully!\n");
    console.log("📋 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👑 Admin:");
    console.log("   Email: admin@mentorconnect.com");
    console.log("   Password: admin123\n");
    console.log("👨‍🏫 Sample Mentor:");
    console.log("   Email: sarah.chen@stanford.edu");
    console.log("   Password: mentor123\n");
    console.log("👨‍🎓 Sample Mentee:");
    console.log("   Email: john.doe@gmail.com");
    console.log("   Password: mentee123\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Total Mentors: ${mentors.length}`);
    console.log(`✅ Total Mentees: ${mentees.length}`);
    console.log(`✅ Total Sessions: 5 (3 confirmed, 2 pending)`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seed
seedDatabase();
