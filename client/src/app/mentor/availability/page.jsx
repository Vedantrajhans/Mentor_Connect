"use client";

import { useEffect, useState } from "react";
import { MentorLayout } from "@/components/layout/mentor-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Trash2, Plus, Loader, Zap } from "lucide-react";
import { getMyMentorProfile, updateAvailability } from "@/lib/api/mentors";
import toast from "react-hot-toast";
import { formatDate, formatTime } from "@/lib/utils/date";

export default function AvailabilityPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: "", time: "" });

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const profile = await getMyMentorProfile();
      const slots = profile.profile?.availability || [];
      setAvailability(slots.map((slot) => new Date(slot).toISOString()).sort());
    } catch (error) {
      toast.error("Failed to load availability");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addSingleSlot = () => {
    if (!newSlot.date || !newSlot.time) {
      toast.error("Please select both date and time");
      return;
    }

    const slotDateTime = new Date(`${newSlot.date}T${newSlot.time}`);

    // Check if slot is in the past
    if (slotDateTime <= new Date()) {
      toast.error("Cannot add slots in the past");
      return;
    }

    const slotISO = slotDateTime.toISOString();

    if (availability.includes(slotISO)) {
      toast.error("This slot already exists");
      return;
    }

    setAvailability([...availability, slotISO].sort());
    setNewSlot({ date: "", time: "" });
    toast.success("Slot added! Remember to save changes.");
  };

  const removeSlot = (slotToRemove) => {
    setAvailability(availability.filter((slot) => slot !== slotToRemove));
    toast.success("Slot removed! Remember to save changes.");
  };

  const addQuickSlots = (days, timesPerDay) => {
    const today = new Date();
    const newSlots = [];

    for (let i = 1; i <= days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      // Skip weekends for weekday presets
      if (
        timesPerDay === "weekdays" &&
        (date.getDay() === 0 || date.getDay() === 6)
      ) {
        continue;
      }

      // Skip weekdays for weekend presets
      if (
        timesPerDay === "weekends" &&
        date.getDay() !== 0 &&
        date.getDay() !== 6
      ) {
        continue;
      }

      // Add morning slot (10 AM)
      const morning = new Date(date);
      morning.setHours(10, 0, 0, 0);
      newSlots.push(morning.toISOString());

      // Add afternoon slot (2 PM)
      const afternoon = new Date(date);
      afternoon.setHours(14, 0, 0, 0);
      newSlots.push(afternoon.toISOString());
    }

    // Merge with existing, remove duplicates
    const merged = [...new Set([...availability, ...newSlots])].sort();
    setAvailability(merged);
    toast.success(`Added ${newSlots.length} slots! Remember to save changes.`);
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all slots?")) {
      setAvailability([]);
      toast.success("All slots cleared! Remember to save changes.");
    }
  };

  const handleSave = async () => {
    if (availability.length === 0) {
      toast.error("Please add at least one availability slot");
      return;
    }

    setSaving(true);
    try {
      await updateAvailability(availability);
      toast.success("Availability saved successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update availability"
      );
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MentorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader className="animate-spin h-12 w-12 text-purple-600" />
        </div>
      </MentorLayout>
    );
  }

  return (
    <MentorLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Availability
          </h1>
          <p className="text-gray-600">
            Set your available time slots for mentee bookings. Add slots
            manually or use quick presets.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Add Slots */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Presets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap size={18} className="text-purple-600" />
                  Quick Add
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => addQuickSlots(7, "all")}
                  variant="outline"
                  className="w-full justify-start text-left"
                  size="sm"
                >
                  <Calendar className="mr-2 flex-shrink-0" size={16} />
                  <div className="text-left">
                    <div className="font-medium">Next 7 Days</div>
                    <div className="text-xs text-gray-500">
                      10 AM & 2 PM daily
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => addQuickSlots(14, "weekdays")}
                  variant="outline"
                  className="w-full justify-start text-left"
                  size="sm"
                >
                  <Calendar className="mr-2 flex-shrink-0" size={16} />
                  <div className="text-left">
                    <div className="font-medium">Weekdays</div>
                    <div className="text-xs text-gray-500">
                      Mon-Fri, 2 weeks
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => addQuickSlots(28, "weekends")}
                  variant="outline"
                  className="w-full justify-start text-left"
                  size="sm"
                >
                  <Calendar className="mr-2 flex-shrink-0" size={16} />
                  <div className="text-left">
                    <div className="font-medium">Weekends</div>
                    <div className="text-xs text-gray-500">
                      Sat-Sun, 4 weeks
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Manual Add */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus size={18} className="text-purple-600" />
                  Add Custom Slot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newSlot.date}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, date: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newSlot.time}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, time: e.target.value })
                    }
                  />
                </div>
                <Button
                  onClick={addSingleSlot}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="mr-2" size={18} />
                  Add Slot
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Current Slots */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar size={20} className="text-purple-600" />
                    Your Available Slots ({availability.length})
                  </CardTitle>
                  {availability.length > 0 && (
                    <Button
                      onClick={clearAll}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2" size={16} />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {availability.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-600 font-medium mb-1">
                      No slots added yet
                    </p>
                    <p className="text-sm text-gray-500">
                      Use quick presets or add custom slots to get started
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                      {availability.map((slot, index) => {
                        const slotDate = new Date(slot);
                        const isPast = slotDate <= new Date();

                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                              isPast
                                ? "bg-gray-50 border-gray-200 opacity-60"
                                : "bg-purple-50 border-purple-200 hover:border-purple-400"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  isPast ? "bg-gray-200" : "bg-purple-100"
                                }`}
                              >
                                <Clock
                                  size={16}
                                  className={
                                    isPast ? "text-gray-500" : "text-purple-600"
                                  }
                                />
                              </div>
                              <div>
                                <p
                                  className={`text-sm font-semibold ${
                                    isPast ? "text-gray-500" : "text-gray-900"
                                  }`}
                                >
                                  {formatDate(slot)}
                                </p>
                                <p
                                  className={`text-xs ${
                                    isPast ? "text-gray-400" : "text-gray-600"
                                  }`}
                                >
                                  {formatTime(slot)}
                                  {isPast && " (Past)"}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeSlot(slot)}
                              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Save Button */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        size="lg"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg"
                      >
                        {saving && (
                          <Loader className="animate-spin mr-2" size={18} />
                        )}
                        {saving ? "Saving Changes..." : "Save All Changes"}
                      </Button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Changes will be visible to mentees immediately after
                        saving
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MentorLayout>
  );
}
