import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['mentee', 'mentor', 'admin'], required: true },
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
  profile: {
    fullName: String,
    photo: String,
    bio: String,
    phone: String,
    // Mentee
    targetUniversities: [String],
    desiredProgram: String,
    // Mentor
    university: String,
    program: String,
    graduationYear: Number,
    expertise: [String],
    studentIdProof: String,
    availability: [Date],
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};

userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
const User = mongoose.model('User', userSchema);
export default User;