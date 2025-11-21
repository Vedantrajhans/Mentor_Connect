'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle } from 'lucide-react';

export const ProfileCompletionCard = ({ profile }) => {
  const steps = [
    { label: 'University & Program', completed: !!(profile?.university && profile?.program) },
    { label: 'Graduation Year', completed: !!profile?.graduationYear },
    { label: 'Expertise & Bio', completed: !!(profile?.expertise?.length > 0 && profile?.bio) },
    { label: 'Phone Number', completed: !!profile?.phone },
    { label: 'Availability', completed: !!(profile?.availability?.length > 0) },
    { label: 'Student ID Proof', completed: !!profile?.studentIdProof },
  ];
  
  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Completion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {completedSteps} of {steps.length} completed
            </span>
            <span className="text-sm font-medium text-purple-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Steps Checklist */}
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              {step.completed ? (
                <CheckCircle size={20} className="text-green-500" />
              ) : (
                <Circle size={20} className="text-gray-300" />
              )}
              <span className={`text-sm ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
