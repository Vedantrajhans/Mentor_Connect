'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { 
  selectUser, 
  selectToken, 
  selectIsAuthenticated, 
  selectLoading,
  selectUserRole,
  selectIsApproved,
  logout as logoutAction 
} from '@/store/userSlice';
import { logoutUser } from '@/lib/api/auth';

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectLoading);
  const role = useSelector(selectUserRole);
  const isApproved = useSelector(selectIsApproved);

  const logout = () => {
    logoutUser(); // Clear localStorage
    dispatch(logoutAction()); // Clear Redux
    router.push('/login');
  };

  const requireAuth = (allowedRoles = []) => {
    if (!isAuthenticated) {
      router.push('/login');
      return false;
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      router.push('/unauthorized');
      return false;
    }
    
    return true;
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    role,
    isApproved,
    logout,
    requireAuth,
    isMentor: role === 'mentor',
    isMentee: role === 'mentee',
    isAdmin: role === 'admin',
  };
};
