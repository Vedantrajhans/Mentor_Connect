"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MentorLayout } from "@/components/layout/mentor-layout";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader,
  Upload,
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
} from "lucide-react";
import { getCurrentUser } from "@/lib/api/auth";
import { updateMentorProfile, getMyMentorProfile } from "@/lib/api/mentors";
import { updateUser } from "@/store/userSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import apiClient from "@/lib/api/axios";

export default function ProfilePage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    photo: "",
    // Mentor-specific
    university: "",
    program: "",
    graduationYear: "",
    expertise: "",
    // Mentee-specific
    targetUniversities: "",
    desiredProgram: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = await getCurrentUser();

      // Load mentor-specific data if mentor
      let mentorData = null;
      if (userData.user.role === "mentor") {
        try {
          mentorData = await getMyMentorProfile();
        } catch (e) {
          console.log("Mentor profile not complete yet");
        }
      }

      const profile = userData.user.profile || {};

      setFormData({
        fullName: profile.fullName || "",
        email: userData.user.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        photo: profile.photo || "",
        university: profile.university || "",
        program: profile.program || "",
        graduationYear: profile.graduationYear || "",
        expertise: Array.isArray(profile.expertise)
          ? profile.expertise.join(", ")
          : "",
        targetUniversities: Array.isArray(profile.targetUniversities)
          ? profile.targetUniversities.join(", ")
          : "",
        desiredProgram: profile.desiredProgram || "",
      });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingPhoto(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result;
        setFormData({ ...formData, photo: base64Image });
        toast.success("Photo uploaded successfully");
      } catch (error) {
        toast.error("Failed to upload photo");
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update profile based on role
      const profileUpdateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        bio: formData.bio,
        photo: formData.photo,
      };

      if (user.role === "mentor") {
        // Mentor-specific fields (university/program cannot be changed)
        profileUpdateData.expertise = formData.expertise
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean);

        await updateMentorProfile(profileUpdateData);
      } else if (user.role === "mentee") {
        // Mentee-specific fields
        profileUpdateData.targetUniversities = formData.targetUniversities
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean);
        profileUpdateData.desiredProgram = formData.desiredProgram;

        await apiClient.put("/auth/profile", profileUpdateData);
      } else {
        // Admin
        await apiClient.put("/auth/profile", profileUpdateData);
      }

      // Update Redux store
      dispatch(updateUser({ profile: profileUpdateData }));

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Select appropriate layout based on role
  const LayoutComponent =
    user?.role === "admin"
      ? AdminLayout
      : user?.role === "mentor"
      ? MentorLayout
      : DashboardLayout;

  if (loading) {
    return (
      <LayoutComponent>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader className="animate-spin h-12 w-12 text-purple-600" />
        </div>
      </LayoutComponent>
    );
  }

  return (
    <LayoutComponent>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
        <p className="text-gray-600">Update your personal information</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        {/* Profile Photo */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-3xl font-bold">
                    {formData.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Loader className="animate-spin text-white" size={24} />
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="photo"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
                >
                  <Upload size={18} />
                  {formData.photo ? "Change Photo" : "Upload Photo"}
                </label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG or GIF (max 5MB)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  className="pl-10 bg-gray-50"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="pl-10"
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={4}
                placeholder="Tell others about yourself..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mentor-Specific Fields */}
        {user?.role === "mentor" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Mentor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="university">University *</Label>
                <div className="relative">
                  <GraduationCap
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="university"
                    value={formData.university}
                    className="pl-10 bg-gray-50"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  University cannot be changed
                </p>
              </div>

              <div>
                <Label htmlFor="program">Program/Major *</Label>
                <div className="relative">
                  <BookOpen
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="program"
                    value={formData.program}
                    className="pl-10 bg-gray-50"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Program cannot be changed
                </p>
              </div>

              <div>
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    id="graduationYear"
                    value={formData.graduationYear}
                    className="pl-10 bg-gray-50"
                    disabled
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expertise">Areas of Expertise</Label>
                <Input
                  id="expertise"
                  value={formData.expertise}
                  onChange={(e) =>
                    setFormData({ ...formData, expertise: e.target.value })
                  }
                  placeholder="CS Admissions, Tech Interviews, Essay Review"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple areas with commas
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mentee-Specific Fields */}
        {user?.role === "mentee" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Mentee Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="targetUniversities">Target Universities</Label>
                <Input
                  id="targetUniversities"
                  value={formData.targetUniversities}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetUniversities: e.target.value,
                    })
                  }
                  placeholder="Stanford, MIT, Harvard"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple universities with commas
                </p>
              </div>

              <div>
                <Label htmlFor="desiredProgram">Desired Program</Label>
                <Input
                  id="desiredProgram"
                  value={formData.desiredProgram}
                  onChange={(e) =>
                    setFormData({ ...formData, desiredProgram: e.target.value })
                  }
                  placeholder="Computer Science"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {saving && <Loader className="animate-spin mr-2" size={18} />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </LayoutComponent>
  );
}
