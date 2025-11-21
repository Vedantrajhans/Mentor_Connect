"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api/auth";
import { completeMentorProfile } from "@/lib/api/mentors";
import { selectLoading, selectError } from "@/store/userSlice";
import { setError, setLoading, setUser } from "@/store/userSlice";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Loader,
  GraduationCap,
  Shield,
  Phone,
  Calendar,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "mentee",
    // Mentor-specific fields
    university: "",
    program: "",
    graduationYear: new Date().getFullYear() + 4,
    expertise: "",
    bio: "",
    phone: "",
    studentIdProof: "",
  });

  const dispatch = useDispatch();
  const router = useRouter();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const roles = [
    {
      value: "mentee",
      label: "Mentee",
      icon: User,
      desc: "Get guidance from university mentors",
      color: "purple",
    },
    {
      value: "mentor",
      label: "Mentor",
      icon: GraduationCap,
      desc: "Share your university experience",
      color: "blue",
    },
    {
      value: "admin",
      label: "Admin",
      icon: Shield,
      desc: "Platform administration",
      color: "red",
    },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, studentIdProof: reader.result });
      toast.success("Student ID uploaded successfully");
    };
    reader.readAsDataURL(file);
  };

  const handleBasicInfoSubmit = async (e) => {
    e.preventDefault();

    if (formData.role === "mentor") {
      // Move to mentor details step
      setStep(2);
    } else {
      // Register directly for mentee/admin
      await handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      // Step 1: Register user
      const registerResponse = await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (registerResponse.success) {
        // Update Redux store
        dispatch(
          setUser({
            user: registerResponse.user,
            token: registerResponse.token,
          })
        );

        // Step 2: If mentor, complete profile
        if (formData.role === "mentor") {
          try {
            await completeMentorProfile({
              university: formData.university,
              program: formData.program,
              graduationYear: parseInt(formData.graduationYear),
              expertise: formData.expertise
                .split(",")
                .map((e) => e.trim())
                .filter(Boolean),
              bio: formData.bio,
              phone: formData.phone,
              studentIdProof: formData.studentIdProof,
              availability: [], // Will be set later in availability page
            });

            toast.success("Profile submitted for admin approval!");
            setTimeout(() => router.push("/mentor/dashboard"), 1000);
          } catch (profileError) {
            toast.error(
              "Registration successful, but profile completion failed. Please complete it from your dashboard."
            );
            setTimeout(() => router.push("/mentor/profile-setup"), 1000);
          }
        } else {
          toast.success(`Welcome, ${formData.fullName}!`);

          // Role-based redirect
          setTimeout(() => {
            if (registerResponse.user.role === "admin") {
              router.push("/admin/dashboard");
            } else {
              router.push("/dashboard");
            }
          }, 1000);
        }
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Registration failed";
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleMentorDetailsSubmit = async (e) => {
    e.preventDefault();

    // Validate mentor fields
    if (
      !formData.university ||
      !formData.program ||
      !formData.bio ||
      !formData.phone
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.studentIdProof) {
      toast.error("Please upload your student ID proof");
      return;
    }

    await handleFinalSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 bg-clip-text text-transparent mb-2">
              Join MentorConnect
            </h1>
            <p className="text-gray-600">
              {step === 1
                ? "Create your account to get started"
                : "Complete your mentor profile"}
            </p>

            {formData.role === "mentor" && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 1 ? "bg-purple-600 text-white" : "bg-gray-200"
                  }`}
                >
                  1
                </div>
                <div
                  className={`w-16 h-1 ${
                    step >= 2 ? "bg-purple-600" : "bg-gray-200"
                  }`}
                />
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 2 ? "bg-purple-600 text-white" : "bg-gray-200"
                  }`}
                >
                  2
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start">
              <svg
                className="w-5 h-5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Your Role
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = formData.role === role.value;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, role: role.value })
                        }
                        disabled={loading}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-purple-500 bg-purple-50 shadow-md"
                            : "border-gray-200 hover:border-purple-300 hover:shadow-sm"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Icon
                          className={`mx-auto mb-1 ${
                            isSelected ? "text-purple-600" : "text-gray-400"
                          }`}
                          size={24}
                        />
                        <div
                          className={`text-xs font-medium ${
                            isSelected ? "text-purple-600" : "text-gray-600"
                          }`}
                        >
                          {role.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {roles.find((r) => r.value === formData.role)?.desc}
                </p>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                      bg-white text-gray-900 placeholder-gray-500
                      focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    placeholder="Full Name"
                    required
                    minLength={2}
                    maxLength={50}
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value.toLowerCase(),
                      })
                    }
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                      bg-white text-gray-900 placeholder-gray-500
                      focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    placeholder="Email address"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    disabled={loading}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg 
                      bg-white text-gray-900 placeholder-gray-500
                      focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    placeholder="Password (min 6 characters)"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                disabled={loading}
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 
                  text-white font-medium rounded-lg hover:opacity-90 transform hover:scale-[1.02] 
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  shadow-lg hover:shadow-xl"
              >
                {loading && (
                  <Loader className="animate-spin mr-2 inline" size={20} />
                )}
                {formData.role === "mentor"
                  ? "Continue to Mentor Details"
                  : "Create Account"}
              </Button>

              {/* Login Link */}
              <p className="text-center text-gray-600 text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}

          {/* STEP 2: Mentor Details */}
          {step === 2 && formData.role === "mentor" && (
            <form onSubmit={handleMentorDetailsSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* University */}
                <div>
                  <Label htmlFor="university">University *</Label>
                  <Input
                    id="university"
                    type="text"
                    value={formData.university}
                    onChange={(e) =>
                      setFormData({ ...formData, university: e.target.value })
                    }
                    disabled={loading}
                    placeholder="e.g., Stanford University"
                    required
                  />
                </div>

                {/* Program */}
                <div>
                  <Label htmlFor="program">Program/Major *</Label>
                  <Input
                    id="program"
                    type="text"
                    value={formData.program}
                    onChange={(e) =>
                      setFormData({ ...formData, program: e.target.value })
                    }
                    disabled={loading}
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div>

                {/* Graduation Year */}
                <div>
                  <Label htmlFor="graduationYear">
                    Expected Graduation Year *
                  </Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 10}
                    value={formData.graduationYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        graduationYear: e.target.value,
                      })
                    }
                    disabled={loading}
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      disabled={loading}
                      className="pl-10"
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                </div>

                {/* Expertise */}
                <div>
                  <Label htmlFor="expertise">Areas of Expertise</Label>
                  <Input
                    id="expertise"
                    type="text"
                    value={formData.expertise}
                    onChange={(e) =>
                      setFormData({ ...formData, expertise: e.target.value })
                    }
                    disabled={loading}
                    placeholder="CS Admissions, Tech Interviews, Essay Review (comma-separated)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple areas with commas
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    disabled={loading}
                    placeholder="Tell mentees about your journey, achievements, and how you can help them..."
                    rows={4}
                    required
                    minLength={50}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.bio.length}/500 characters (min 50)
                  </p>
                </div>

                {/* Student ID Upload */}
                <div>
                  <Label htmlFor="studentId">
                    Student ID Proof * (for verification)
                  </Label>
                  <div className="mt-2 flex items-center gap-4">
                    <label
                      htmlFor="studentId"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                    >
                      <Upload size={20} className="text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {formData.studentIdProof
                          ? "Change File"
                          : "Upload File"}
                      </span>
                    </label>
                    <input
                      id="studentId"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      disabled={loading}
                      className="hidden"
                    />
                    {formData.studentIdProof && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Uploaded
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload your student ID, transcript, or acceptance letter
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  disabled={loading}
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 
                    text-white font-medium hover:opacity-90"
                >
                  {loading && (
                    <Loader className="animate-spin mr-2 inline" size={20} />
                  )}
                  {loading ? "Submitting..." : "Complete Registration"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
