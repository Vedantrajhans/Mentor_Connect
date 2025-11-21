"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils/date";

export const SessionCard = ({ session, userRole, onComplete, onReview }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending Approval",
          color: "bg-yellow-100 text-yellow-700 border-yellow-300",
          icon: AlertCircle,
        };
      case "confirmed":
        return {
          label: "Confirmed",
          color: "bg-green-100 text-green-700 border-green-300",
          icon: CheckCircle,
        };
      case "completed":
        return {
          label: "Completed",
          color: "bg-blue-100 text-blue-700 border-blue-300",
          icon: CheckCircle,
        };
      case "cancelled":
      case "rejected":
        return {
          label: status === "rejected" ? "Rejected" : "Cancelled",
          color: "bg-red-100 text-red-700 border-red-300",
          icon: XCircle,
        };
      default:
        return {
          label: "Unknown",
          color: "bg-gray-100 text-gray-700 border-gray-300",
          icon: AlertCircle,
        };
    }
  };

  const statusConfig = getStatusConfig(session.status);
  const StatusIcon = statusConfig.icon;
  const isPast = new Date(session.endTime) < new Date();
  const canJoin = session.status === "confirmed" && !isPast && session.zoomLink;

  const otherParty = userRole === "mentor" ? session.mentee : session.mentor;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
              {otherParty?.fullName?.charAt(0) || "U"}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {otherParty?.fullName || "User"}
              </h4>
              <p className="text-sm text-gray-600">{otherParty?.email}</p>
            </div>
          </div>
          <Badge className={`${statusConfig.color} border`}>
            <StatusIcon size={14} className="mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar size={16} className="text-purple-600" />
            <span>{formatDate(session.startTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock size={16} className="text-purple-600" />
            <span>
              {formatTime(session.startTime)} - {formatTime(session.endTime)}
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <User size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{session.topic}</span>
          </div>
        </div>

        {/* Zoom Link - Show only when confirmed */}
        {canJoin && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Video size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Meeting Link Ready
              </span>
            </div>
            <a
              href={session.zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-700 hover:text-green-800 underline flex items-center gap-1"
            >
              Join Zoom Meeting
              <ExternalLink size={14} />
            </a>
            {session.zoomMeetingId && (
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                <p>
                  Meeting ID:{" "}
                  <span className="font-mono font-semibold">
                    {session.zoomMeetingId}
                  </span>
                </p>
                {session.zoomPassword && (
                  <p>
                    Password:{" "}
                    <span className="font-mono font-semibold">
                      {session.zoomPassword}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pending Message */}
        {session.status === "pending" && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {userRole === "mentor"
                ? "Please confirm or reject this request"
                : "Waiting for mentor to confirm. You will receive the meeting link once confirmed."}
            </p>
          </div>
        )}

        {/* Rejection Message */}
        {session.status === "rejected" && session.rejectionReason && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-900 mb-1">
              Rejection Reason:
            </p>
            <p className="text-sm text-red-700">{session.rejectionReason}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {canJoin && (
            <Button
              onClick={() => window.open(session.zoomLink, "_blank")}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Video className="mr-2" size={16} />
              Join Meeting
            </Button>
          )}

          {session.status === "confirmed" && isPast && onComplete && (
            <Button
              onClick={() => onComplete(session._id)}
              variant="outline"
              className="flex-1"
            >
              <CheckCircle className="mr-2" size={16} />
              Mark Complete
            </Button>
          )}

          {session.status === "completed" &&
            !session.reviewedByMentee &&
            userRole === "mentee" &&
            onReview && (
              <Button
                onClick={() => onReview(session)}
                variant="outline"
                className="flex-1"
              >
                Leave Review
              </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
};
