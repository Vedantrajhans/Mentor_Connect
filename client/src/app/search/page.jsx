"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MentorLayout } from "@/components/layout/mentor-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MentorCard } from "@/components/features/mentor-card";
import { BookingModal } from "@/components/features/booking-modal";
import { Search, Filter, Loader, Info } from "lucide-react";
import { searchMentors } from "@/lib/api/mentors";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SearchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [filters, setFilters] = useState({
    university: "",
    program: "",
    expertise: "",
  });
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Check if user can book sessions
  const canBook = user?.role === "mentee";
  const isMentor = user?.role === "mentor";

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async (searchFilters = {}) => {
    setLoading(true);
    try {
      const data = await searchMentors(searchFilters);
      setMentors(data);
    } catch (error) {
      toast.error("Failed to load mentors");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadMentors(filters);
  };

  const handleViewProfile = (mentor) => {
    router.push(`/mentors/${mentor._id || mentor.id}`);
  };

  const handleBookSession = (mentor) => {
    if (!canBook) {
      toast.error("Only mentees can book sessions");
      return;
    }
    setSelectedMentor(mentor);
    setShowBookingModal(true);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedMentor(null);
    setSelectedSlot(null);
    toast.success("Session booked successfully!");
  };

  // Select appropriate layout based on role
  const LayoutComponent = isMentor ? MentorLayout : DashboardLayout;

  return (
    <LayoutComponent>
      {/* Header with Info Banner for Mentors */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Browse Mentors
        </h1>
        <p className="text-gray-600">
          {canBook
            ? "Find and connect with verified student mentors from top universities"
            : "Explore other mentors and their profiles"}
        </p>

        {/* Info Banner for Mentors */}
        {isMentor && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm text-blue-900 font-medium">
                View-Only Mode
              </p>
              <p className="text-sm text-blue-700 mt-1">
                As a mentor, you can browse other mentor profiles but cannot
                book sessions. Only mentees can book mentorship sessions.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Search & Filter Section */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSearch}>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search university..."
                  value={filters.university}
                  onChange={(e) =>
                    setFilters({ ...filters, university: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
              <Input
                placeholder="Program/Major"
                value={filters.program}
                onChange={(e) =>
                  setFilters({ ...filters, program: e.target.value })
                }
              />
              <Input
                placeholder="Expertise"
                value={filters.expertise}
                onChange={(e) =>
                  setFilters({ ...filters, expertise: e.target.value })
                }
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Filter className="mr-2" size={18} />
                Apply Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Mentors Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading mentors...</p>
          </div>
        </div>
      ) : mentors.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No mentors found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search filters to find more mentors
            </p>
            <Button
              onClick={() => {
                setFilters({ university: "", program: "", expertise: "" });
                loadMentors();
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-600">
              Found{" "}
              <span className="font-semibold text-purple-600">
                {mentors.length}
              </span>{" "}
              mentors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor._id || mentor.id}
                mentor={mentor}
                onViewProfile={handleViewProfile}
                onBook={handleBookSession}
                canBook={canBook}
              />
            ))}
          </div>
        </>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedMentor && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedMentor(null);
            setSelectedSlot(null);
          }}
          mentor={selectedMentor}
          selectedSlot={selectedSlot}
          onSuccess={handleBookingSuccess}
        />
      )}
    </LayoutComponent>
  );
}
