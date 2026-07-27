'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import AwsLogo from '../../../components/layout/AwsLogo';
import loginPromoImg from '../../../public/images/login-promo.png';

export default function LoginPage() {
  const router = useRouter();

  // Step state: 'email' | 'password' | 'forgot'
  const [step, setStep] = useState<'email' | 'password' | 'forgot'>('email');

  // User type selection: 'root' | 'iam'
  const [userType, setUserType] = useState<'root' | 'iam'>('root');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Forgot password OTP fields
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: () => {
      router.refresh();
      router.push('/hosted-zones');
    },
    onError: (error: any) => {
      setFormError(error.detail || 'Invalid email or password. Please try again.');
    },
  });

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setStep('password');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    loginMutation.mutate({ email, password });
  };

  const handleStartForgotPassword = async () => {
    setFormError(null);
    setStep('forgot');
    setIsSendingOtp(true);
    try {
      await api.sendOTP({ email });
      setIsSendingOtp(false);
    } catch (err: any) {
      setIsSendingOtp(false);
      setFormError(err.detail || 'Failed to send verification code. Please try again.');
    }
  };

  const handleVerifyForgotOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!otpCode || otpCode.trim().length < 4) {
      setFormError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await api.verifyOTP({
        email,
        code: otpCode.trim(),
        password: newPassword.trim() || undefined,
      });
      setIsVerifyingOtp(false);
      router.refresh();
      router.push('/hosted-zones');
    } catch (err: any) {
      setIsVerifyingOtp(false);
      setFormError(err.detail || 'Invalid or expired verification code. Please check your inputs.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 flex flex-col justify-between font-sans relative selection:bg-amber-200 selection:text-amber-900">
      {/* Background Isometric Graphic Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64L30 60 0 51.96V17.32L30 0zm0 4.618L5.33 18.86 30 33.102l24.67-14.242L30 4.618zm26 17.868L31.33 36.728v27.042L56 49.528V22.486zM4 22.486v27.042L28.67 63.77V36.728L4 22.486z' fill='%23000000' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Top Header Logo */}
      <header className="py-6 flex justify-center z-10">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <AwsLogo className="h-8 w-auto text-slate-900" />
        </Link>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4 z-10">
        <div className="w-full max-w-[720px] grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">

          {/* LEFT CARD: Sign In Form Box */}
          <div className="lg:col-span-6 bg-white border border-slate-300 rounded-2xl shadow-sm p-3.5 sm:p-4 flex flex-col justify-between space-y-3">
            <div>
              <h1 className="text-base font-bold text-[#16191f] mb-0.5">Sign In</h1>
              <p className="text-[10.5px] text-slate-600 mb-2.5">Access your AWS account by user type.</p>

              {formError && (
                <div className="mb-3 p-2.5 bg-red-50 border-l-4 border-red-500 text-[11px] text-red-800 flex items-start space-x-2 rounded-r">
                  <svg className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{formError}</span>
                </div>
              )}

              {/* STEP 1: Email Address & User Type */}
              {step === 'email' && (
                <form onSubmit={handleNextStep} className="space-y-3">
                  {/* User Type Radio Selector Cards */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-[#16191f]">User type</span>
                      <a href="#not-sure" className="text-[#0972D3] hover:underline text-[11px] font-normal">
                        (not sure?)
                      </a>
                    </div>

                    {/* Option 1: Root user */}
                    <div
                      onClick={() => setUserType('root')}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start space-x-2.5 ${userType === 'root'
                          ? 'border-2 border-[#0972D3] bg-[#f2f8fd]'
                          : 'border-slate-300 hover:border-slate-400 bg-white'
                        }`}
                    >
                      <div className="mt-0.5 relative flex items-center justify-center shrink-0">
                        <input
                          type="radio"
                          name="userType"
                          checked={userType === 'root'}
                          onChange={() => setUserType('root')}
                          className="h-3.5 w-3.5 text-[#0972D3] focus:ring-[#0972D3] accent-[#0972D3] cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-[#16191f]">Root user</div>
                        <div className="text-[10px] text-slate-600 leading-snug mt-0.5">
                          Account owner that performs tasks requiring unrestricted access.
                        </div>
                      </div>
                    </div>

                    {/* Option 2: IAM user */}
                    <div
                      onClick={() => setUserType('iam')}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start space-x-2.5 ${userType === 'iam'
                          ? 'border-2 border-[#0972D3] bg-[#f2f8fd]'
                          : 'border-slate-300 hover:border-slate-400 bg-white'
                        }`}
                    >
                      <div className="mt-0.5 relative flex items-center justify-center shrink-0">
                        <input
                          type="radio"
                          name="userType"
                          checked={userType === 'iam'}
                          onChange={() => setUserType('iam')}
                          className="h-3.5 w-3.5 text-[#0972D3] focus:ring-[#0972D3] accent-[#0972D3] cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-[#16191f]">IAM user</div>
                        <div className="text-[10px] text-slate-600 leading-snug mt-0.5">
                          User within an account that performs daily tasks.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input: Email */}
                  <div className="pt-1">
                    <label className="block text-[11px] font-bold text-[#16191f] mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="username@example.com"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3] transition-shadow placeholder:text-slate-400"
                    />
                  </div>

                  {/* Next Button */}
                  <button
                    type="submit"
                    className="w-full mt-1 bg-[#ec7211] hover:bg-[#d9650c] active:bg-[#c45a0a] text-[#16191f] font-bold py-2 px-3 rounded-full text-xs transition-colors shadow-xs cursor-pointer text-center"
                  >
                    Next
                  </button>

                  {/* Divider */}
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">OR</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  {/* Sign Up Link Button */}
                  <Link
                    href="/register"
                    className="w-full border-2 border-[#0972D3] text-[#0972D3] hover:bg-blue-50/50 font-bold py-1.5 px-3 rounded-full text-xs text-center block transition-colors"
                  >
                    New to AWS? Sign up
                  </Link>
                </form>
              )}

              {/* STEP 2: Ask for Password */}
              {step === 'password' && (
                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  {/* Active Email Display Badge */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                        {userType === 'root' ? 'Root User' : 'IAM User'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-900">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-[11px] text-[#0972D3] font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  {/* Input: Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-[#16191f]">
                        {userType === 'root' ? 'Root user password' : 'IAM password'}
                      </label>
                      <button
                        type="button"
                        onClick={handleStartForgotPassword}
                        className="text-[10.5px] text-[#0972D3] hover:underline font-medium cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter password"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3] transition-shadow placeholder:text-slate-400"
                      disabled={loginMutation.isPending}
                    />
                  </div>

                  {/* Show Password Toggle */}
                  <div className="flex items-center space-x-2 text-[11px] text-slate-700">
                    <input
                      type="checkbox"
                      id="showPassLogin"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="rounded border-slate-300 text-[#0972D3] focus:ring-[#0972D3] cursor-pointer h-3.5 w-3.5"
                    />
                    <label htmlFor="showPassLogin" className="cursor-pointer select-none">
                      Show password
                    </label>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-[#ec7211] hover:bg-[#d9650c] active:bg-[#c45a0a] text-[#16191f] font-bold py-2 px-3 rounded-full text-xs mt-2 transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center"
                  >
                    {loginMutation.isPending ? (
                      <span className="flex items-center space-x-2">
                        <svg className="animate-spin h-3.5 w-3.5 text-[#16191f]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Signing in...</span>
                      </span>
                    ) : (
                      <span>Sign in</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="w-full text-[11px] text-slate-600 hover:text-slate-900 font-medium text-center pt-1 block"
                  >
                    ← Back to email entry
                  </button>
                </form>
              )}

              {/* STEP 3: Forgot Password & Sign in with OTP */}
              {step === 'forgot' && (
                <form onSubmit={handleVerifyForgotOTP} className="space-y-3">
                  {/* Active Email Display Badge */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                        Password Assistance
                      </span>
                      <span className="text-[11px] font-semibold text-slate-900">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-[11px] text-[#0972D3] font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <p className="text-[10.5px] text-slate-600 leading-relaxed">
                    We sent a 6-digit verification code to your email. Enter it below to sign in.
                  </p>

                  {/* Input: OTP Code */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#16191f] mb-1">
                      Verification code (OTP)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                      placeholder="Enter 6-digit code"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3] transition-shadow font-mono tracking-widest text-center text-sm"
                      disabled={isVerifyingOtp}
                    />
                  </div>

                  {/* Input: New Password (Optional) */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#16191f] mb-1">
                      New Password <span className="font-normal text-slate-500">(optional)</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password to update"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3] transition-shadow placeholder:text-slate-400"
                      disabled={isVerifyingOtp}
                    />
                  </div>


                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isVerifyingOtp || !otpCode.trim()}
                    className="w-full bg-[#ec7211] hover:bg-[#d9650c] active:bg-[#c45a0a] text-[#16191f] font-bold py-2 px-3 rounded-full text-xs mt-2 transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center"
                  >
                    {isVerifyingOtp ? (
                      <span className="flex items-center space-x-2">
                        <svg className="animate-spin h-3.5 w-3.5 text-[#16191f]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Verifying & Signing in...</span>
                      </span>
                    ) : (
                      <span>Verify OTP & Sign In</span>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-0.5">
                    <button
                      type="button"
                      onClick={handleStartForgotPassword}
                      disabled={isSendingOtp}
                      className="text-[11px] text-[#0972D3] hover:underline font-semibold"
                    >
                      {isSendingOtp ? 'Sending code...' : 'Resend OTP code'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('password')}
                      className="text-[11px] text-slate-600 hover:text-slate-900 font-medium"
                    >
                      ← Back to password
                    </button>
                  </div>
                </form>
              )}
            </div>


          </div>

          {/* RIGHT CARD: Actual AWS Promo Image */}
          <div className="lg:col-span-6 border border-slate-300 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center bg-[#d5f3fe]">
            <img
              src={loginPromoImg.src}
              alt="AWS Local Zones Promo"
              className="w-full h-full object-fill rounded-2xl"
            />
          </div>

        </div>
      </main>

      {/* Footer Legal & Cookie Notice */}
      <footer className="py-6 text-center text-[11px] text-slate-500 z-10 px-4">
        By continuing, you agree to{' '}
        <a href="https://aws.amazon.com/agreement/" target="_blank" rel="noreferrer" className="text-[#0972D3] hover:underline">
          AWS Customer Agreement
        </a>{' '}
        or other agreement for AWS services, and the{' '}
        <a href="https://aws.amazon.com/privacy/" target="_blank" rel="noreferrer" className="text-[#0972D3] hover:underline">
          Privacy Notice
        </a>
        . This site uses essential cookies. See our{' '}
        <a href="https://aws.amazon.com/legal/cookies/" target="_blank" rel="noreferrer" className="text-[#0972D3] hover:underline">
          Cookie Notice
        </a>{' '}
        for details.
      </footer>
    </div>
  );
}


