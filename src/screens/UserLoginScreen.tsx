import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Store,
  AlertCircle,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export const UserLoginScreen: React.FC = () => {
  const { loginUser, continueAsGuest, loginWithGoogle, loginWithFacebook } = useAuth();
  const { setScreen } = useStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setErrorMessage('');
    setIsLoading(true);

    try {
      await loginUser(identifier, password);
      setScreen({ type: 'home' });
    } catch (err: any) {
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setErrorMessage('Invalid email/phone or password. Please verify your credentials.');
      } else {
        setErrorMessage(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestBrowse = () => {
    continueAsGuest();
    setScreen({ type: 'home' });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center px-4 py-8 safe-top safe-bottom">
      <div className="w-full max-w-sm mx-auto space-y-6">
        {/* App Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-white p-1 ring-4 ring-emerald-400/30 shadow-xl flex items-center justify-center mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <rect width="100" height="100" rx="24" fill="#0F2C59" />
              <path d="M28 24h24c8.8 0 16 7.2 16 16 0 5.4-2.7 10.2-6.8 13.1C66.5 56.4 70 62.8 70 70c0 8.8-7.2 16-16 16H28V24z" fill="#00D053" />
              <circle cx="74" cy="26" r="6" fill="#F59E0B" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">BUYJUMP</h1>
            <p className="text-xs text-blue-200/80 mt-0.5">Mobile Marketplace & Delivery</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
          <div className="text-center">
            <h2 className="text-lg font-black text-slate-900">Customer Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">Welcome back! Sign in to shop and track orders</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email or Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or 0771234567"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/15 text-slate-900"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/15 text-slate-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#0F2C59] hover:bg-blue-900 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-[#00D053]" />
                </>
              )}
            </button>
          </form>

          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={async () => {
                try {
                  await loginWithGoogle('user');
                  setScreen({ type: 'home' });
                } catch (e: any) {
                  if (e.code !== 'auth/popup-closed-by-user') {
                    setErrorMessage(e.message || 'Google login failed.');
                  }
                }
              }}
              className="py-2 px-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.15z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.1-6.67-4.93H1.27v3.13C3.25 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.33 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.6H1.27C.46 8.22 0 10.05 0 12s.46 3.78 1.27 5.4l4.06-3.13z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.6l4.06 3.13c.94-2.83 3.57-4.98 6.67-4.98z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  await loginWithFacebook('user');
                  setScreen({ type: 'home' });
                } catch (e: any) {
                  if (e.code !== 'auth/popup-closed-by-user') {
                    setErrorMessage(e.message || 'Facebook login failed.');
                  }
                }
              }}
              className="py-2 px-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          {/* Links */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5 text-center text-xs">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <button
                onClick={() => setScreen({ type: 'user-register' })}
                className="font-bold text-[#0F2C59] hover:underline"
              >
                Create Account
              </button>
            </p>

            <button
              onClick={handleGuestBrowse}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
              <span>Continue as Guest / Browse Catalog</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                setIsLoading(true);
                setErrorMessage('');
                try {
                  await loginUser('demo.customer@buyjump.com', 'DemoPass123!');
                  setScreen({ type: 'home' });
                } catch (e: any) {
                  setErrorMessage(e.message || 'Demo login failed.');
                } finally {
                  setIsLoading(false);
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0F2C59] font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Mobile Test Sign-In (Customer)</span>
            </button>

            <div className="pt-2 flex flex-col items-center gap-2">
              <button
                onClick={() => setScreen({ type: 'seller-login' })}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Seller Login / Store Registration</span>
              </button>

              <a
                href="/download/app-debug.apk"
                download="app-debug.apk"
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <span>📲 Download Android APK (app-debug.apk)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
};
