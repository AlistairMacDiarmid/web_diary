/**
 * @file Auth.tsx
 * @description Authentication component handling both user login and account registration.
 * Dynamically switches form fields based on whether the user is signing in or creating an account.
 */

import React, { useState } from 'react';
import { loginUser, registerUser } from './services/api';

/**
 * Properties for the Auth component.
 */
interface AuthProps {
  /** Callback function triggered upon successful authentication or registration. */
  onSuccess: () => void;
}

/**
 * Auth component renders a clean modal/card for user sign-in and registration,
 * supporting flexible authentication via email or username.
 */
function Auth({ onSuccess }: AuthProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handles the submission of the authentication form.
   * Performs registration if the user is in sign-up mode, then logs them in and triggers success.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await registerUser({ username, email, password });
      }
      await loginUser({ email, password }); 
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 text-[#111827]">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-8">
        
        <div className="text-center mb-8">
          <h1 className="font-semibold text-2xl tracking-tight">
            {isRegistering ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {isRegistering ? 'Sign up to keep your thoughts private' : 'Sign in to access your diary entries'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username field (only visible during registration) */}
          {isRegistering && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-[#6B7280] mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-transparent focus:outline-none focus:border-[#5B5BD6] transition-colors"
              />
            </div>
          )}

          {/* Identifier field (Email for registration, Email or Username for sign-in) */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-[#6B7280] mb-1.5">
              {isRegistering ? 'Email Address' : 'Email or Username'}
            </label>
            <input
              type={isRegistering ? 'email' : 'text'}
              required
              placeholder={isRegistering ? 'you@example.com' : 'you@example.com or username'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-transparent focus:outline-none focus:border-[#5B5BD6] transition-colors"
            />
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-[#6B7280] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-transparent focus:outline-none focus:border-[#5B5BD6] transition-colors"
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 font-medium text-sm bg-[#5B5BD6] text-white py-2.5 rounded-lg hover:bg-[#4A4AC4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B5BD6] focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle between Sign In and Register views */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Auth;