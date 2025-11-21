'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from './navbar';
import { SidebarMentor } from './sidebar-mentor';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from 'lucide-react';

export const MentorLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, loading, user, role } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (mounted && !loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (role !== 'mentor') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, loading, mounted, router, role]);
  
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated || role !== 'mentor') {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <SidebarMentor 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isApproved={user?.isApproved}
      />
      
      <main className="lg:pl-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};
