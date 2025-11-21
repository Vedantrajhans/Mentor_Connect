'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MentorLayout } from '@/components/layout/mentor-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Loader, Upload, X, Plus, Calendar, BookOpen, 
  Award, Phone, FileText, CheckCircle 
} from 'lucide-react';
import { completeMentorProfile } from '@/lib/api/mentors';
import toast from 'react-hot-toast';

export default function ProfileSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    university: '',
    program: '',
    graduationYear: '',
    expertise: [],
    bio: '',
    phone: '',
    availability: [],
    studentIdProof: '',
  });
  const [expertiseInput, setExpertiseInput] = useState('');
  const [availabilityInput, setAvailabilityInput] = useState('');
  
  const totalSteps = 4;
  
  const handleAddExpertise = () => {
    if (expertiseInput.trim() && !formData.expertise.includes(expertiseInput.trim())) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, expertiseInput.trim()]
      });
      setExpertiseInput('');
    }
  };
  
  const handleRemoveExpertise = (item) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter(e => e !== item)
    });
  };
  
  const handleAddAvailability = () => {
    if (availabilityInput) {
      const dateTime = new Date(availabilityInput).toISOString();
      if (!formData.availability.includes(dateTime)) {
        setFormData({
          ...formData,
          availability: [...formData.availability, dateTime].sort()
        });
        setAvailabilityInput('');
      }
    }
  };
  
  const handleRemoveAvailability = (slot) => {
    setFormData({
      ...formData,
      availability: formData.availability.filter(a => a !== slot)
    });
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          studentIdProof: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.university || !formData.program || !formData.graduationYear) {
          toast.error('Please fill all required fields');
          return false;
        }
        break;
      case 2:
        if (formData.expertise.length === 0 || !formData.bio) {
          toast.error('Please add at least one expertise and write a bio');
          return false;
        }
        break;
      case 3:
        if (!formData.phone || formData.availability.length === 0) {
          toast.error('Please add phone number and at least one availability slot');
          return false;
        }
        break;
      case 4:
        if (!formData.studentIdProof) {
          toast.error('Please upload your student ID proof');
          return false;
        }
        break;
    }
    return true;
  };
  
  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };
  
  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    try {
      await completeMentorProfile(formData);
      toast.success('Profile submitted for approval!');
      router.push('/mentor/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <MentorLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">
            Fill in your details to start mentoring students
          </p>
        </div>
        
        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Step {step} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-purple-600">
                {Math.round((step / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
            
            {/* Steps */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                { num: 1, label: 'Basic Info' },
                { num: 2, label: 'Expertise' },
                { num: 3, label: 'Availability' },
                { num: 4, label: 'Verification' },
              ].map((s) => (
                <div 
                  key={s.num}
                  className={`text-center py-2 rounded ${
                    step >= s.num ? 'bg-purple-50 text-purple-600' : 'text-gray-400'
                  }`}
                >
                  <p className="text-xs font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Form Steps */}
        <Card>
          <CardContent className="p-6">
            {/* Step 1: University & Program */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">University & Program</h3>
                    <p className="text-sm text-gray-600">Tell us about your education</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="university">University *</Label>
                    <Input
                      id="university"
                      placeholder="e.g., Stanford University"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="program">Program/Major *</Label>
                    <Input
                      id="program"
                      placeholder="e.g., Computer Science"
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="graduationYear">Expected Graduation Year *</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      placeholder="e.g., 2026"
                      min="2024"
                      max="2035"
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Expertise & Bio */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Expertise & Bio</h3>
                    <p className="text-sm text-gray-600">Share your knowledge areas</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="expertise">Areas of Expertise *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="expertise"
                        placeholder="e.g., CS Admissions, Essay Review"
                        value={expertiseInput}
                        onChange={(e) => setExpertiseInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise())}
                      />
                      <Button type="button" onClick={handleAddExpertise}>
                        <Plus size={16} />
                      </Button>
                    </div>
                    
                    {formData.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.expertise.map((item, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {item}
                            <button
                              type="button"
                              onClick={() => handleRemoveExpertise(item)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X size={14} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio *</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell students about yourself, your experience, and how you can help them..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={6}
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/1000 characters</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Phone & Availability */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Contact & Availability</h3>
                    <p className="text-sm text-gray-600">Set your contact info and time slots</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="availability">Available Time Slots *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="availability"
                        type="datetime-local"
                        value={availabilityInput}
                        onChange={(e) => setAvailabilityInput(e.target.value)}
                      />
                      <Button type="button" onClick={handleAddAvailability}>
                        <Plus size={16} />
                      </Button>
                    </div>
                    
                    {formData.availability.length > 0 && (
                      <div className="space-y-2 mt-3 max-h-48 overflow-y-auto">
                        {formData.availability.map((slot, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                          >
                            <span className="text-sm">
                              {new Date(slot).toLocaleString('en-US', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAvailability(slot)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 4: Student ID Upload */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Verification</h3>
                    <p className="text-sm text-gray-600">Upload your student ID proof</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="studentId">Student ID Proof *</Label>
                    <div className="mt-2">
                      {!formData.studentIdProof ? (
                        <label
                          htmlFor="studentId"
                          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
                        >
                          <div className="text-center">
                            <Upload size={40} className="mx-auto mb-4 text-gray-400" />
                            <p className="text-sm text-gray-600 mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, PDF up to 5MB
                            </p>
                          </div>
                          <input
                            id="studentId"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="relative">
                          <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
                            <div className="flex items-center gap-3">
                              <CheckCircle size={24} className="text-green-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-900">File uploaded successfully</p>
                                <p className="text-xs text-green-700">Your student ID has been uploaded</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, studentIdProof: '' })}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      This helps us verify you're a current student. Your ID will be kept confidential.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                Back
              </Button>
              
              {step < totalSteps ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading && <Loader className="animate-spin mr-2" size={16} />}
                  {loading ? 'Submitting...' : 'Submit for Approval'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MentorLayout>
  );
}
