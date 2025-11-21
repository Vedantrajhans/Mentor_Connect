'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Clock, Star, User, Settings, X, AlertCircle } from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/mentor/dashboard' },
  { icon: Calendar, label: 'My Sessions', href: '/mentor/sessions' },
  { icon: Clock, label: 'Availability', href: '/mentor/availability' },
  { icon: Star, label: 'Reviews', href: '/mentor/reviews' },
  { icon: User, label: 'Profile', href: '/mentor/profile' },
  { icon: Settings, label: 'Settings', href: '/mentor/settings' },
];

export const SidebarMentor = ({ isOpen, onClose, isApproved }) => {
  const pathname = usePathname();
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Close button (mobile) */}
          <div className="lg:hidden flex justify-end p-4">
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
          
          {/* Approval Warning */}
          {!isApproved && (
            <div className="mx-4 mt-4 mb-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-yellow-900">Pending Approval</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Your profile is under review
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Menu items */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-900 mb-1">
                Help Center
              </p>
              <p className="text-xs text-purple-700 mb-3">
                Get support from our team
              </p>
              <Link 
                href="/support"
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
