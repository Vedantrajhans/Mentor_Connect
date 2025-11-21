"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  Video,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader,
  Search,
  Star,
} from "lucide-react";
import Link from "next/link";
import { getMyBookings } from "@/lib/api/bookings";
import { SessionCard } from "@/components/features/session-card";
import toast from "react-hot-toast";
import { formatDate, formatTime } from "@/lib/utils/date";

export default function MenteeDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [pendingSessions, setPendingSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const sessionsData = await getMyBookings();
      setSessions(sessionsData);

      // Filter sessions
      const now = new Date();
      const pending = sessionsData.filter((s) => s.status === "pending");
      const upcoming = sessionsData.filter(
        (s) => s.status === "confirmed" && new Date(s.startTime) > now
      );
      const completed = sessionsData.filter((s) => s.status === "completed");

      setPendingSessions(pending);
      setUpcomingSessions(upcoming);
      setCompletedSessions(completed);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: "Pending Requests",
      value: pendingSessions.length,
      icon: Clock,
      color: "yellow",
      description: "Awaiting mentor confirmation",
    },
    {
      title: "Upcoming Sessions",
      value: upcomingSessions.length,
      icon: Calendar,
      color: "blue",
      description: "Confirmed sessions",
    },
    {
      title: "Completed Sessions",
      value: completedSessions.length,
      icon: CheckCircle,
      color: "green",
      description: "Past sessions",
    },
    {
      title: "Total Mentors",
      value: new Set(sessions.map((s) => s.mentor?.id)).size,
      icon: User,
      color: "purple",
      description: "Unique mentors",
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.profile?.fullName || user?.email?.split("@")[0]}!
        </h1>
        <p className="text-gray-600">
          Track your mentorship sessions and connect with mentors
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
                  >
                    <Icon size={24} className={`text-${stat.color}-600`} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Confirmed Sessions with Zoom Links */}
      {upcomingSessions.length > 0 && (
        <Card className="mb-8 border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Video size={20} />
              Upcoming Sessions - Ready to Join ({upcomingSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session._id}
                  className="border-2 border-green-200 rounded-xl p-5 hover:border-green-300 hover:shadow-md transition-all bg-white"
                >
                  {/* Mentor Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {session.mentor?.fullName?.charAt(0)?.toUpperCase() ||
                          "M"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {session.mentor?.fullName || "Unknown Mentor"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {session.mentor?.university}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border border-green-300">
                      <CheckCircle size={12} className="mr-1" />
                      Confirmed
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
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Session Topic:
                    </p>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-sm text-gray-800">{session.topic}</p>
                    </div>
                  </div>

                  {/* Zoom Meeting Link - HIGHLIGHT */}
                  {session.zoomLink && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Video size={20} className="text-green-600" />
                        <span className="text-sm font-bold text-green-900">
                          Meeting Link Ready!
                        </span>
                      </div>

                      <a
                        href={session.zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mb-3"
                      >
                        <Button className="w-full md:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                          <Video className="mr-2" size={18} />
                          Join Zoom Meeting
                        </Button>
                      </a>

                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Meeting ID:</span>
                          <span className="ml-2 font-mono font-semibold text-gray-900">
                            {session.zoomMeetingId}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Password:</span>
                          <span className="ml-2 font-mono font-semibold text-gray-900">
                            {session.zoomPassword}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Sessions */}
      {pendingSessions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} className="text-yellow-600" />
              Pending Approval ({pendingSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingSessions.map((session) => (
                <div
                  key={session._id}
                  className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        {session.mentor?.fullName?.charAt(0) || "M"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {session.mentor?.fullName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {session.mentor?.university}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-300">
                      <Clock size={12} className="mr-1" />
                      Pending
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-2 mb-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar size={14} className="text-purple-600" />
                      <span>{formatDate(session.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock size={14} className="text-purple-600" />
                      <span>{formatTime(session.startTime)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 italic">
                    Waiting for mentor to confirm. You'll receive the Zoom link
                    once approved.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Sessions Message */}
      {sessions.length === 0 && (
        <Card className="mb-8">
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Sessions Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start your mentorship journey by booking a session with a mentor
            </p>
            <Link href="/search">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Search className="mr-2" size={18} />
                Find Mentors
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/search">
          <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-purple-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Search className="text-purple-600" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Find Mentors</h3>
              <p className="text-sm text-gray-600">
                Browse and connect with mentors
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/sessions">
          <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-blue-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Calendar className="text-blue-600" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">My Sessions</h3>
              <p className="text-sm text-gray-600">View all your sessions</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/profile">
          <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-green-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <User className="text-green-600" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">My Profile</h3>
              <p className="text-sm text-gray-600">Update your information</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </DashboardLayout>
  );
}
