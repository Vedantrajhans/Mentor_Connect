'use client';

import { useEffect, useState } from 'react';
import { MentorLayout } from '@/components/layout/mentor-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader, Save, Plus, X, User, BookOpen, Award } from 'lucide-react';
import { getMyMentorProfile, updateMentorProfile } from '@/lib/api/mentors';
import { getInitials, getAvatarColor } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

export default function MentorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    bio: '',
    expertise: [],
    phone: '',
  });
  const [expertiseInput, setExpertiseInput] = useState('');
  
  useEffect(() => {
    loadProfile();
  }, []);
  
  const loadProfile = async () => {
    try {
      const data = await getMyMentorProfile();
      setProfile(data);
      setFormData({
        bio: data?.bio || '',
        expertise: data?.expertise || [],
        phone: data?.phone || '',
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const handleSave = async () => {
    if (!formData.bio.trim()) {
      toast.error('Bio cannot be empty');
      return;
    }
    
    if (formData.expertise.length === 0) {
      toast.error('Add at least one area of expertise');
      return;
    }
    
    setSaving(true);
    try {
      await updateMentorProfile(formData);
      toast.success('Profile updated successfully!');
      loadProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <MentorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </MentorLayout>
    );
  }
  
  return (
    <MentorLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">
            Manage your mentor profile information
          </p>
        </div>
        
        {/* Profile Preview */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-20 h-20 ${getAvatarColor(profile?.fullName)} rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
                {getInitials(profile?.fullName)}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {profile?.fullName}
                </h2>
                <p className="text-gray-600 mb-2">
                  {profile?.university} • {profile?.program}
                </p>
                <Badge variant={profile?.isApproved ? 'success' : 'warning'}>
                  {profile?.isApproved ? 'Approved' : 'Pending Approval'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Basic Info (Read-only) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen size={20} />
              University Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>University</Label>
                <Input value={profile?.university || ''} disabled />
              </div>
              <div>
                <Label>Program</Label>
                <Input value={profile?.program || ''} disabled />
              </div>
              <div>
                <Label>Graduation Year</Label>
                <Input value={profile?.graduationYear || ''} disabled />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={profile?.email || ''} disabled />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              These fields cannot be changed. Contact support if you need to update them.
            </p>
          </CardContent>
        </Card>
        
        {/* Editable Fields */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bio */}
            <div>
              <Label htmlFor="bio">Bio *</Label>
              <Textarea
                id="bio"
                placeholder="Tell students about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={6}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/1000 characters</p>
            </div>
            
            {/* Phone */}
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
          </CardContent>
        </Card>
        
        {/* Expertise */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award size={20} />
              Areas of Expertise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="expertise">Add Expertise</Label>
              <div className="flex gap-2">
                <Input
                  id="expertise"
                  placeholder="e.g., Essay Review, Interview Prep"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise())}
                />
                <Button type="button" onClick={handleAddExpertise}>
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            
            {formData.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.expertise.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2 py-2 px-3">
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertise(item)}
                      className="hover:text-red-600"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader className="animate-spin mr-2" size={20} />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </MentorLayout>
  );
}
