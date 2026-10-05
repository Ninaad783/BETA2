import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, User, Lock, ArrowRight, AlertCircle, CheckCircle2, Key, Phone } from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { useAuthStore } from '../../../stores/authStore';
import { Modal } from '../../../components/ui/Modal';
import { API_BASE_URL } from '../../../lib/apiClient';

export const LoginPage: React.FC = () => {
  const { language, setLanguage, t } = useUIStore();
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await login(username, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(result.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters');
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: forgotUsername,
          mobile: forgotMobile,
          newPassword: forgotNewPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setForgotSuccess(data.message);
        setUsername(forgotUsername);
        setPassword(forgotNewPassword);
        setSuccessMessage('Password reset successfully! You can now log in.');
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotSuccess(null);
        }, 1500);
      } else {
        setForgotError(data.message || 'Failed to reset password');
      }
    } catch {
      setForgotError('Network error connecting to backend auth server');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-sky-50 via-slate-50 to-teal-50">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-8 relative overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500"></div>

        {/* Top Controls: Language Switcher */}
        <div className="flex items-center justify-end mb-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                language === 'en'
                  ? 'bg-white shadow-xs font-semibold text-slate-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('mr')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                language === 'mr'
                  ? 'bg-white shadow-xs font-semibold text-slate-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              मराठी
            </button>
          </div>
        </div>

        {/* Brand Header */}
        <div className="text-center my-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-500 text-white text-3xl font-extrabold shadow-lg shadow-emerald-500/20 mb-3">
            <Plus className="w-9 h-9 stroke-[3]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">MedEasy</h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('tagline')} • <span className="font-semibold text-slate-700">Pharmacy OS</span>
          </p>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {(errorMessage || error) && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMessage || error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              {t('username')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {t('password')}
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotUsername(username);
                  setForgotError(null);
                  setForgotSuccess(null);
                  setShowForgotModal(true);
                }}
                className="text-xs text-sky-600 hover:underline cursor-pointer"
              >
                {t('forgotPassword')}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Verifying...' : t('loginToCounter')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Feature Tags Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-around text-slate-500 text-xs text-center font-medium">
          <span>⚡ Simple Billing</span>
          <span>•</span>
          <span>📦 Smart Stock</span>
          <span>•</span>
          <span>📈 Better Business</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Reset Account Password"
        subtitle="Verify your username & registered mobile number to set a new password"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleForgotPassword} className="space-y-3.5 pt-1 text-xs">
          {forgotError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{forgotError}</span>
            </div>
          )}

          {forgotSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{forgotSuccess}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Username *</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. nk_007"
                value={forgotUsername}
                onChange={(e) => setForgotUsername(e.target.value)}
                className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Registered Mobile Number *</label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="10-digit mobile (e.g. 8380036778)"
                value={forgotMobile}
                onChange={(e) => setForgotMobile(e.target.value)}
                className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password *</label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm Password *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Repeat password"
                value={forgotConfirmPassword}
                onChange={(e) => setForgotConfirmPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="px-4 py-2 font-semibold text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isResetting}
              className="px-5 py-2 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{isResetting ? 'Resetting...' : 'Reset Password'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
