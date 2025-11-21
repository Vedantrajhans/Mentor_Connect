'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Users, Calendar, Star, BarChart3, 
  UserCheck, Settings, X 
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: UserCheck, label: 'Mentor Approvals', href: '/admin/mentors', badge: true },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Calendar, label: 'Sessions', href: '/admin/sessions' },
  { icon: Star, label: 'Reviews', href: '/admin/reviews' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export const SidebarAdmin = ({ isOpen, onClose, pendingCount = 0 }) => {
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
          
          {/* Menu items */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const showBadge = item.badge && pendingCount > 0;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </div>
                  {showBadge && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4">
              <p className="text-sm font-medium text-red-900 mb-1">
                ⚠️ Admin Panel
              </p>
              <p className="text-xs text-red-700">
                You have elevated permissions
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
