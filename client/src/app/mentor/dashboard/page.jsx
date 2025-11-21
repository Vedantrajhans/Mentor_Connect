"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MentorLayout } from "@/components/layout/mentor-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Star,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader,
  Check,
  X,
  Video,
} from "lucide-react";
import Link from "next/link";
import {
  getMyBookings,
  confirmSession,
  rejectSession,
} from "@/lib/api/bookings";
import { getMyMentorProfile } from "@/lib/api/mentors";
import { SessionCard } from "@/components/features/session-card";
import { ProfileCompletionCard } from "@/components/features/profile-completion-card";
import toast from "react-hot-toast";
import { formatDate, formatTime } from "@/lib/utils/date";

export default function MentorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [pendingSessions, setPendingSessions] = useState([]);
  const [confirmingId, setConfirmingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [profileData, sessionsData] = await Promise.all([
        getMyMentorProfile().catch(() => null),
        getMyBookings().catch(() => []),
      ]);

      setProfile(profileData);
      setSessions(sessionsData);

      // Filter pending sessions
      const pending = sessionsData.filter((s) => s.status === "pending");
      setPendingSessions(pending);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (sessionId) => {
    setConfirmingId(sessionId);
    try {
      await confirmSession(sessionId);
      toast.success("Session confirmed! Zoom link sent to mentee.");
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to confirm session");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleReject = async (sessionId) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setRejectingId(sessionId);
    try {
      await rejectSession(sessionId, rejectionReason);
      toast.success("Session request rejected");
      setRejectionReason("");
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject session");
    } finally {
      setRejectingId(null);
    }
  };

  if (loading) {
    return (
      <MentorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </MentorLayout>
    );
  }

  const upcomingSessions = sessions
    .filter(
      (s) => s.status === "confirmed" && new Date(s.startTime) > new Date()
    )
    .slice(0, 3);

  const completedSessions = sessions.filter(
    (s) => s.status === "completed"
  ).length;

  const stats = [
    {
      title: "Total Sessions",
      value: completedSessions,
      icon: Calendar,
      color: "blue",
      change: completedSessions > 0 ? "+12%" : null,
    },
    {
      title: "Pending Requests",
      value: pendingSessions.length,
      icon: Clock,
      color: "yellow",
      urgent: pendingSessions.length > 0,
    },
    {
      title: "Average Rating",
      value: profile?.profile?.rating?.toFixed(1) || "0.0",
      icon: Star,
      color: "yellow",
    },
    {
      title: "Total Reviews",
      value: profile?.profile?.totalReviews || 0,
      icon: Users,
      color: "green",
    },
  ];

  return (
    <MentorLayout>
      {/* Approval Banner */}
      {!user?.isApproved && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertCircle
              className="text-yellow-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Pending Approval
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your mentor profile is under review. You'll be notified once
                approved by an administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.profile?.fullName || user?.email?.split("@")[0]}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your mentorship
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className={`${
                stat.urgent ? "border-2 border-yellow-300 bg-yellow-50" : ""
              } hover:shadow-lg transition-shadow`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
                  >
                    <Icon size={24} className={`text-${stat.color}-600`} />
                  </div>
                  {stat.change && (
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  )}
                  {stat.urgent && (
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* PENDING SESSION REQUESTS - PRIORITY SECTION */}
      {pendingSessions.length > 0 && (
        <Card className="mb-8 border-2 border-yellow-300 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200">
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Clock size={20} className="animate-pulse" />
              Pending Session Requests ({pendingSessions.length})
              <Badge className="ml-auto bg-yellow-500 text-white">
                Action Required
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {pendingSessions.map((session) => (
                <div
                  key={session._id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all bg-white"
                >
                  {/* Mentee Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {session.mentee?.fullName?.charAt(0)?.toUpperCase() ||
                          "M"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {session.mentee?.fullName || "Unknown Mentee"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {session.mentee?.email}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-300">
                      <Clock size={12} className="mr-1" />
                      Pending
                    </Badge>
                  </div>

                  {/* Session Details */}
                  <div className="grid md:grid-cols-2 gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar size={16} className="text-purple-600" />
                      <span className="font-medium">
                        {formatDate(session.startTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock size={16} className="text-purple-600" />
                      <span className="font-medium">
                        {formatTime(session.startTime)}
                      </span>
                    </div>
                  </div>

                  {/* Topic */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Video size={16} className="text-purple-600" />
                      Session Topic:
                    </p>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-sm text-gray-800">{session.topic}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleConfirm(session._id)}
                      disabled={
                        confirmingId === session._id ||
                        rejectingId === session._id
                      }
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
                      size="lg"
                    >
                      {confirmingId === session._id ? (
                        <>
                          <Loader className="animate-spin mr-2" size={18} />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2" size={18} />
                          Confirm & Send Zoom Link
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => {
                        if (rejectingId === session._id) {
                          handleReject(session._id);
                        } else {
                          setRejectingId(session._id);
                        }
                      }}
                      disabled={
                        confirmingId === session._id ||
                        (rejectingId && rejectingId !== session._id)
                      }
                      variant="outline"
                      className="flex-1 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                      size="lg"
                    >
                      {rejectingId === session._id && rejectionReason ? (
                        <>
                          <Loader className="animate-spin mr-2" size={18} />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <X className="mr-2" size={18} />
                          {rejectingId === session._id
                            ? "Submit Rejection"
                            : "Reject Request"}
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Rejection Reason Input */}
                  {rejectingId === session._id && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <label className="block text-sm font-medium text-red-900 mb-2">
                        Reason for rejection (required):
                      </label>
                      <Textarea
                        placeholder="Please explain why you cannot accept this session request..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                        className="text-sm border-red-300 focus:border-red-500 focus:ring-red-500"
                      />
                      <p className="text-xs text-red-600 mt-2">
                        This reason will be shared with the mentee.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Completion Card (if incomplete) */}
      {profile && !profile.isApproved && (
        <div className="mb-8">
          <ProfileCompletionCard profile={profile?.profile} />
        </div>
      )}

      {/* Upcoming Confirmed Sessions */}
      {upcomingSessions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="text-purple-600" size={20} />
                <span>Upcoming Confirmed Sessions</span>
              </div>
              <Link href="/mentor/sessions">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-purple-50"
                >
                  View All
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  userRole="mentor"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Sessions Message */}
      {pendingSessions.length === 0 && upcomingSessions.length === 0 && (
        <Card className="mb-8">
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Pending or Upcoming Sessions
            </h3>
            <p className="text-gray-600 mb-6">
              Make sure your availability is up to date so mentees can book
              sessions with you.
            </p>
            <Link href="/mentor/availability">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Clock className="mr-2" size={18} />
                Manage Availability
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/mentor/availability">
          <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-purple-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Calendar className="text-purple-600" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Manage Availability
              </h3>
              <p className="text-sm text-gray-600">
                Update your available time slots
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/mentor/sessions">
          <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-blue-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Clock className="text-blue-600" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                View All Sessions
              </h3>
              <p className="text-sm text-gray-600">
                Manage your session history
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/mentor/reviews">
          <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-yellow-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-200 transition-colors">
                <Star className="text-yellow-600" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">My Reviews</h3>
              <p className="text-sm text-gray-600">
                See what mentees are saying
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </MentorLayout>
  );
}
