import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

export const completeMentorProfile = async (req, res) => {
  const {
    university,
    program,
    graduationYear,
    expertise,
    bio,
    phone,
    availability,
    studentIdProof,
  } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (user.role !== "mentor") {
      return res
        .status(403)
        .json({ message: "Only mentors can complete this profile" });
    }

    user.profile = {
      ...user.profile,
      fullName: user.profile.fullName,
      university,
      program,
      graduationYear,
      expertise: expertise || [],
      bio,
      phone,
      availability: availability?.map((d) => new Date(d)) || [],
      studentIdProof,
    };
    user.isApproved = false;
    await user.save();

    // Notify all admins
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: "New Mentor Application",
        html: `<p><strong>${user.profile.fullName}</strong> from <strong>${university}</strong> applied to be a mentor.</p>`,
      });
    }

    res.json({ message: "Profile submitted for approval" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchMentors = async (req, res) => {
  const { university, program, expertise, page = 1, limit = 10 } = req.query;

  const query = {
    role: "mentor",
    isApproved: true,
    isActive: true,
  };

  if (university) query["profile.university"] = new RegExp(university, "i");
  if (program) query["profile.program"] = new RegExp(program, "i");
  if (expertise) query["profile.expertise"] = { $in: [expertise] };

  try {
    const mentors = await User.find(query)
      .select(
        "profile.fullName profile.photo profile.university profile.program profile.rating profile.bio profile.expertise profile.availability profile.totalReviews"
      )
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      mentors,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMentorProfile = async (req, res) => {
  try {
    const mentor = await User.findById(req.params.id)
      .select("-password")
      .lean();

    if (!mentor || mentor.role !== "mentor" || !mentor.isApproved) {
      return res
        .status(404)
        .json({ message: "Mentor not found or not approved" });
    }

    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW: Get my mentor profile
export const getMyMentorProfile = async (req, res) => {
  try {
    const mentor = await User.findById(req.user.id).select("-password").lean();

    if (!mentor || mentor.role !== "mentor") {
      return res.status(404).json({ message: "Mentor profile not found" });
    }

    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW: Update mentor profile
export const updateMentorProfile = async (req, res) => {
  const { fullName, phone, bio, photo, expertise } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (user.role !== "mentor") {
      return res
        .status(403)
        .json({ message: "Only mentors can update mentor profile" });
    }

    // Update allowed fields (university/program cannot be changed)
    if (fullName) user.profile.fullName = fullName;
    if (phone) user.profile.phone = phone;
    if (bio) user.profile.bio = bio;
    if (photo) user.profile.photo = photo;
    if (expertise) user.profile.expertise = expertise;

    await user.save();

    res.json({
      success: true,
      message: "Mentor profile updated successfully",
      mentor: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW: Update availability
export const updateAvailability = async (req, res) => {
  const { availability } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (user.role !== "mentor") {
      return res
        .status(403)
        .json({ message: "Only mentors can update availability" });
    }

    if (!Array.isArray(availability)) {
      return res
        .status(400)
        .json({ message: "Availability must be an array of dates" });
    }

    // Convert to dates and validate
    const validDates = availability
      .map((date) => new Date(date))
      .filter((date) => !isNaN(date.getTime()) && date > new Date());

    user.profile.availability = validDates;
    await user.save();

    res.json({
      success: true,
      message: "Availability updated successfully",
      availability: user.profile.availability,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
