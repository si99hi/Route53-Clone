'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AwsLogo from '../../../components/layout/AwsLogo';
import { api } from '../../../lib/api';

export default function RegisterPage() {
  const router = useRouter();

  // State: 1 = Email & Account Name form, 2 = Verification Code form
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 fields
  const [email, setEmail] = useState('');
  const [accountName, setAccountName] = useState('');

  // Step 2 fields
  const [code, setCode] = useState('');

  // Status & Timers
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(300); // 5:00 countdown timer

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Step 1 Submission: Send OTP via email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid root user email address.');
      return;
    }

    if (!accountName.trim()) {
      setErrorMsg('Please choose an AWS account name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.sendOTP({ email, account_name: accountName });
      setIsSubmitting(false);
      setStep(2);
      setResendTimer(300); // Reset to 5:00
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.detail || 'Failed to send verification email. Please check your credentials.');
    }
  };

  // Resend OTP Code
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await api.sendOTP({ email, account_name: accountName });
      setIsSubmitting(false);
      setResendTimer(300);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.detail || 'Failed to resend verification email.');
    }
  };

  // Step 2 Submission: Verify OTP Code
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!code || code.trim().length < 4) {
      setErrorMsg('Please enter the verification code sent to your email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.verifyOTP({
        email,
        code: code.trim(),
        account_name: accountName,
      });
      setIsSubmitting(false);
      // Redirect to console hosted zones page
      router.push('/hosted-zones');
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.detail || 'Invalid verification code. Please check your email and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Top Center AWS Header Logo */}
      <header className="py-6 flex justify-center border-b border-slate-100">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <AwsLogo className="h-9 w-auto text-slate-900" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        {/* LEFT COLUMN: Marketing & Rocket Illustration */}
        <div className="flex flex-col justify-start lg:pr-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
            Try AWS at no cost for up to 6 months
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-md">
            Start with USD $100 in AWS credits, plus earn up to USD $100 by completing various activities.
          </p>

          {/* Rocket & Cube Graphic Container */}
          <div className="relative w-full max-w-md h-64 sm:h-72 flex items-center justify-center">
            <svg
              viewBox="0 0 400 300"
              className="w-full h-full text-blue-500 overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Isometric Background Cubes Lineart */}
              <path
                d="M 60 220 L 120 185 L 180 220 L 120 255 Z M 120 255 L 120 290 L 180 255 M 120 185 L 120 220 M 60 220 L 60 255 L 120 290"
                stroke="#a5b4fc"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <path
                d="M 240 220 L 300 185 L 360 220 L 300 255 Z M 300 255 L 300 295 M 360 220 L 360 260 L 300 295 M 240 220 L 240 260 L 300 295"
                stroke="#a5b4fc"
                strokeWidth="1.5"
              />
              <path
                d="M 150 140 L 210 105 L 270 140 L 210 175 Z M 210 175 L 210 215 M 270 140 L 270 180 L 210 215 M 150 140 L 150 180 L 210 215"
                stroke="#818cf8"
                strokeWidth="1.5"
              />
              
              {/* Rocket Line Art */}
              <g transform="translate(140, 30) rotate(-25)">
                {/* Motion Lines */}
                <path d="M 10 110 L -30 140 M 30 120 L -10 150 M 50 130 L 10 160" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                {/* Rocket Body */}
                <path
                  d="M 60 10 C 110 30 120 90 90 120 C 60 150 10 110 10 110 L 30 80 Z"
                  stroke="#1e293b"
                  strokeWidth="2.5"
                  fill="#ffffff"
                />
                {/* Window */}
                <circle cx="65" cy="70" r="14" stroke="#1e293b" strokeWidth="2.5" fill="#f8fafc" />
                {/* Fins */}
                <path d="M 20 100 C -10 110 -10 130 5 130 L 30 110 Z" stroke="#1e293b" strokeWidth="2.5" fill="#ffffff" />
                <path d="M 80 40 C 110 20 125 35 115 55 L 95 70 Z" stroke="#1e293b" strokeWidth="2.5" fill="#ffffff" />
              </g>
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: Sign Up Form & Steps */}
        <div className="lg:border-l lg:border-slate-200 lg:pl-12 w-full max-w-md">

          {/* Global Error Banner */}
          {errorMsg && (
            <div className="mb-6 p-3.5 bg-red-50 border-l-4 border-red-500 text-xs text-red-800 flex items-start space-x-2 rounded-r">
              <svg className="h-4 w-4 text-red-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Email & Account Name */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Sign up for AWS</h1>

              {/* Input 1: Email */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">
                  Root user email address
                </label>
                <p className="text-[12px] text-slate-600 mb-2">
                  Used for account recovery and as described in the{' '}
                  <a
                    href="https://aws.amazon.com/privacy/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0073bb] hover:underline inline-flex items-center space-x-0.5"
                  >
                    <span>AWS Privacy Notice</span>
                    <svg className="h-3 w-3 inline ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder=""
                  className="w-full px-3 py-2 border border-slate-400 rounded-md text-sm text-slate-900 focus:outline-none focus:border-[#ec7211] focus:ring-1 focus:ring-[#ec7211]"
                  disabled={isSubmitting}
                />
              </div>

              {/* Input 2: Account Name */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">
                  AWS account name
                </label>
                <p className="text-[12px] text-slate-600 mb-2">
                  Choose a name for your account. You can change this name in your account settings after you sign up.
                </p>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                  placeholder=""
                  className="w-full px-3 py-2 border border-slate-400 rounded-md text-sm text-slate-900 focus:outline-none focus:border-[#ec7211] focus:ring-1 focus:ring-[#ec7211]"
                  disabled={isSubmitting}
                />
              </div>

              {/* Primary Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 bg-[#ec7211] hover:bg-[#d9650c] text-white font-bold py-2.5 px-4 rounded-full text-sm transition-colors shadow-sm focus:outline-none disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Sending verification code...</span>
                  </span>
                ) : (
                  <span>Verify email address</span>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-slate-300"></div>
                <span className="flex-shrink mx-4 text-xs font-semibold text-slate-500 uppercase">OR</span>
                <div className="flex-grow border-t border-slate-300"></div>
              </div>

              {/* Secondary Sign in Button */}
              <Link
                href="/login"
                className="w-full border-2 border-[#0073bb] text-[#0073bb] hover:bg-blue-50 font-bold py-2 px-4 rounded-full text-sm text-center block transition-colors"
              >
                Sign in to an existing AWS account
              </Link>
            </form>
          )}

          {/* STEP 2: Verify OTP Code */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign up for AWS</h1>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Confirm you are you</h2>

              <p className="text-xs text-slate-700 leading-relaxed">
                Making sure you are secure -- it's what we do.
              </p>

              <div className="text-xs text-slate-700 leading-relaxed">
                We sent an email with a verification code to{' '}
                <strong className="text-slate-900 font-bold">{email}</strong>.{' '}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[#0073bb] hover:underline font-semibold"
                >
                  (not you?)
                </button>
              </div>

              <p className="text-xs text-slate-700 mb-3">
                Enter it below to confirm your email.
              </p>

              {/* Input: Code */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Verification code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder=""
                  required
                  className="w-full px-3 py-2 border border-slate-400 rounded-md text-slate-900 text-sm focus:outline-none focus:border-[#ec7211] focus:ring-1 focus:ring-[#ec7211] tracking-widest font-mono text-center text-lg"
                  disabled={isSubmitting}
                />
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isSubmitting || !code.trim()}
                className="w-full bg-[#ec7211] hover:bg-[#d9650c] text-white font-bold py-2.5 px-4 rounded-full text-sm mt-3 transition-colors disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Verifying...</span>
                  </span>
                ) : (
                  <span>Verify</span>
                )}
              </button>

              {/* Resend Code Button with Timer */}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || isSubmitting}
                className="w-full border border-slate-400 text-slate-800 font-bold py-2 px-4 rounded-full text-sm mt-2 hover:bg-slate-50 transition-colors text-center disabled:opacity-60 disabled:hover:bg-transparent"
              >
                {resendTimer > 0 ? (
                  <span>Resend Code {formatTimer(resendTimer)}</span>
                ) : (
                  <span>Resend Code</span>
                )}
              </button>

              {/* Help Notes */}
              <div className="pt-4 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-800 mb-1">Didn't get the code?</p>
                <p>• Codes can take up to 5 minutes to arrive.</p>
                <p>• Check your spam folder.</p>
              </div>
            </form>
          )}

          {/* Footer Cookie Notice */}
          <div className="mt-8 pt-4 text-[11px] text-slate-500 border-t border-slate-100">
            This site uses essential cookies. See our{' '}
            <a
              href="https://aws.amazon.com/legal/cookies/"
              target="_blank"
              rel="noreferrer"
              className="text-[#0073bb] hover:underline inline-flex items-center space-x-0.5"
            >
              <span>Cookie Notice</span>
              <svg className="h-3 w-3 inline ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>{' '}
            for more information.
          </div>
        </div>

      </main>
    </div>
  );
}
