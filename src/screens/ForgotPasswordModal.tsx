import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, X, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = ''
}) => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState(defaultEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError('');

    try {
      await sendPasswordReset(email);
      setIsSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account exists with this email address.');
      } else {
        setError(err.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl relative border border-slate-100 animate-in slide-in-from-bottom duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1 mb-5">
          <div className="w-12 h-12 bg-blue-50 text-[#0F2C59] rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Reset Password</h3>
          <p className="text-xs text-slate-500">
            Enter your registered email address to receive a secure password reset link.
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-4 text-center">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Password reset email sent to <strong>{email}</strong>. Check your inbox and spam folder.</span>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#0F2C59] text-white rounded-xl text-xs font-bold"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/15"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              {isLoading ? (
                <span>Sending Reset Link...</span>
              ) : (
                <>
                  <span>Send Reset Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
