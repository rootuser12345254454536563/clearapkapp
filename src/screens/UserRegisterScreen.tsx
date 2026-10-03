import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export const UserRegisterScreen: React.FC = () => {
  const { registerUser } = useAuth();
  const { setScreen } = useStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (phone.trim().length < 8) {
      setErrorMessage('Please enter a valid phone number (at least 9 digits).');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(fullName, email, phone, password);
      setScreen({ type: 'home' });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email address already exists. Please sign in.');
      } else {
        setErrorMessage(err.message || 'Failed to create user account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center px-4 py-8 safe-top safe-bottom">
      <div className="w-full max-w-sm mx-auto space-y-5">
        {/* Back Button */}
        <button
          onClick={() => setScreen({ type: 'user-login' })}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-200 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-900">Create Account</h2>
            <p className="text-xs text-slate-500 mt-0.5">Join BUYJUMP for islandwide shopping & delivery</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-800 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priyantha Silva"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priyantha@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0771234567 or +94771234567"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none font-mono"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#0F2C59] hover:bg-blue-900 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 pt-3"
            >
              {isLoading ? <span>Creating Account...</span> : <span>Create Account</span>}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
            Already have an account?{' '}
            <button
              onClick={() => setScreen({ type: 'user-login' })}
              className="font-bold text-[#0F2C59] hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
