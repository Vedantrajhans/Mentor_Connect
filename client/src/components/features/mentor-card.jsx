"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, GraduationCap, Calendar, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const MentorCard = ({ mentor, onViewProfile, onBook, canBook }) => {
  const { user } = useAuth();

  // Determine if current user can book
  const userCanBook = canBook ?? user?.role === "mentee";
  const isMentor = user?.role === "mentor";

  const getInitials = (name) => {
    if (!name) return "M";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 group">
      <CardContent className="p-6">
        {/* Mentor Avatar & Basic Info */}
        <div className="flex items-start gap-4 mb-4">
          {/* Profile Photo */}
          <div className="relative flex-shrink-0">
            {mentor.photo || mentor.profile?.photo ? (
              <img
                src={mentor.photo || mentor.profile?.photo}
                alt={mentor.fullName || mentor.profile?.fullName}
                className="w-16 h-16 rounded-full object-cover border-4 border-purple-100 group-hover:border-purple-200 transition-colors"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg border-4 border-purple-100 group-hover:border-purple-200 transition-colors">
                {getInitials(mentor.fullName || mentor.profile?.fullName)}
              </div>
            )}

            {/* Verified Badge */}
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Name & Rating */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-purple-600 transition-colors">
              {mentor.fullName || mentor.profile?.fullName || "Anonymous"}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="text-yellow-400 fill-yellow-400" size={16} />
                <span className="font-semibold text-gray-900">
                  {mentor.averageRating?.toFixed(1) ||
                    mentor.profile?.rating?.toFixed(1) ||
                    "0.0"}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ({mentor.totalReviews || mentor.profile?.totalReviews || 0}{" "}
                reviews)
              </span>
            </div>
          </div>
        </div>

        {/* University & Program */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <GraduationCap
              size={16}
              className="text-purple-600 flex-shrink-0"
            />
            <span className="font-medium truncate">
              {mentor.university ||
                mentor.profile?.university ||
                "University Not Set"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {mentor.program || mentor.profile?.program || "Program Not Set"}
            </span>
          </div>
        </div>

        {/* Bio Preview */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 profile-text">
          {mentor.bio || mentor.profile?.bio || "No bio available"}
        </p>

        {/* Expertise Tags */}
        {(mentor.expertise?.length > 0 ||
          mentor.profile?.expertise?.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {(mentor.expertise || mentor.profile?.expertise || [])
              .slice(0, 3)
              .map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            {(mentor.expertise?.length > 3 ||
              mentor.profile?.expertise?.length > 3) && (
              <Badge variant="secondary" className="text-xs">
                +{(mentor.expertise || mentor.profile?.expertise).length - 3}{" "}
                more
              </Badge>
            )}
          </div>
        )}

        {/* Availability Indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
          <Calendar size={16} className="text-green-500" />
          <span>
            {mentor.availability?.length > 0 ||
            mentor.profile?.availability?.length > 0
              ? `${
                  (mentor.availability || mentor.profile?.availability).length
                } slots available`
              : "No slots available"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* View Profile Button - Always Available */}
          <Button
            variant="outline"
            className="flex-1 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
            onClick={() => onViewProfile(mentor)}
          >
            <Eye className="mr-2" size={16} />
            View Profile
          </Button>

          {/* Book Session Button - Only for Mentees */}
          {userCanBook && (
            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              onClick={() => onBook(mentor)}
            >
              <Calendar className="mr-2" size={16} />
              Book Session
            </Button>
          )}

          {/* View Only Badge - For Mentors */}
          {isMentor && !userCanBook && (
            <div className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <span className="text-sm font-medium text-blue-700">
                View Only
              </span>
            </div>
          )}
        </div>

        {/* Mentor-Specific Message */}
        {isMentor && (
          <p className="text-xs text-gray-500 text-center mt-3 italic">
            Mentors cannot book sessions with other mentors
          </p>
        )}
      </CardContent>
    </Card>
  );
};
