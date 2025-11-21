'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api/auth';
import { selectLoading, selectError } from '@/store/userSlice';
import { setError, setLoading, setUser } from '@/store/userSlice';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ 
    email: '', 
    password: '' 
  });
  
  const dispatch = useDispatch();
  const router = useRouter();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await loginUser(credentials);
      
      if (response.success) {
        // Update Redux store
        dispatch(setUser({ 
          user: response.user, 
          token: response.token 
        }));
        
        toast.success(`Welcome back!`);
        
        // Role-based redirect
        setTimeout(() => {
          const { role, isApproved } = response.user;
          
          if (role === 'admin') {
            router.push('/admin/dashboard');
          } else if (role === 'mentor') {
            if (!isApproved) {
              toast.info('Your profile is pending approval');
              router.push('/mentor/pending');
            } else {
              router.push('/mentor/dashboard');
            }
          } else {
            router.push('/dashboard');
          }
        }, 500);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Login failed';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 bg-clip-text text-transparent mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-600">Sign in to continue your journey</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value.toLowerCase() })}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                    bg-white text-gray-900 placeholder-gray-500
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  placeholder="Email address"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg 
                    bg-white text-gray-900 placeholder-gray-500
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              disabled={loading}
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 
                text-white font-medium rounded-lg hover:opacity-90 transform hover:scale-[1.02] 
                transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                shadow-lg hover:shadow-xl"
            >
              {loading && <Loader className="animate-spin mr-2 inline" size={20} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to MentorConnect?</span>
              </div>
            </div>

            {/* Register Link */}
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
