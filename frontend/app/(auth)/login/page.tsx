'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import AwsLogo from '../../../components/layout/AwsLogo';

export default function LoginPage() {
  const router = useRouter();

  // Step state: 'email' | 'password'
  const [step, setStep] = useState<'email' | 'password'>('email');

  // User type selection: 'root' | 'iam'
  const [userType, setUserType] = useState<'root' | 'iam'>('root');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 flex flex-col justify-between font-sans relative">
      {/* Background Subtle Watermark */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-60 pointer-events-none" />

      {/* Top Header Logo */}
      <header className="py-6 flex justify-center z-10">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <AwsLogo className="h-8 w-auto text-slate-900" />
        </Link>
      </header>

      {/* Main Container Card (2-Column Grid) */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-4xl bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">

          {/* LEFT COLUMN: 2-Step Sign In Form (5 cols on lg) */}
          <div className="md:col-span-6 lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign In</h1>
              <p className="text-xs text-slate-600 mb-5">Access your AWS account by user type.</p>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-xs text-red-800 flex items-start space-x-2 rounded-r">
                  <svg className="h-4 w-4 text-red-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{formError}</span>
                </div>
              )}

              {/* STEP 1: Ask for Email */}
              {step === 'email' && (
                <form onSubmit={handleNextStep} className="space-y-4">
                  {/* User Type Radio Selector Cards */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900">User type</span>
                      <a href="#not-sure" className="text-[#0073bb] hover:underline text-[11px]">
                        (not sure?)
                      </a>
                    </div>

                    {/* Option 1: Root user */}
                    <div
                      onClick={() => setUserType('root')}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${
                        userType === 'root'
                          ? 'border-2 border-[#0972D3] bg-blue-50/20'
                          : 'border-slate-300 hover:border-slate-400 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="userType"
                        checked={userType === 'root'}
                        onChange={() => setUserType('root')}
                        className="mt-0.5 h-4 w-4 text-[#0972D3] focus:ring-[#0972D3]"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Root user</div>
                        <div className="text-[11px] text-slate-600 leading-tight">
                          Account owner that performs tasks requiring unrestricted access.
                        </div>
                      </div>
                    </div>

                    {/* Option 2: IAM user */}
                    <div
                      onClick={() => setUserType('iam')}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${
                        userType === 'iam'
                          ? 'border-2 border-[#0972D3] bg-blue-50/20'
                          : 'border-slate-300 hover:border-slate-400 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="userType"
                        checked={userType === 'iam'}
                        onChange={() => setUserType('iam')}
                        className="mt-0.5 h-4 w-4 text-[#0972D3] focus:ring-[#0972D3]"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">IAM user</div>
                        <div className="text-[11px] text-slate-600 leading-tight">
                          User within an account that performs daily tasks.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input: Email */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="username@example.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
                    />
                  </div>

                  {/* Next Button */}
                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#ec7211] hover:bg-[#d9650c] text-slate-900 font-bold py-2.5 px-4 rounded-full text-sm transition-colors shadow-2xs cursor-pointer"
                  >
                    Next
                  </button>

                  {/* Divider */}
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-300"></div>
                    <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-500 uppercase">OR</span>
                    <div className="flex-grow border-t border-slate-300"></div>
                  </div>

                  {/* Sign Up Link */}
                  <Link
                    href="/register"
                    className="w-full border-2 border-[#0972D3] text-[#0972D3] hover:bg-blue-50 font-bold py-2 px-4 rounded-full text-sm text-center block transition-colors"
                  >
                    New to AWS? Sign up
                  </Link>
                </form>
              )}

              {/* STEP 2: Ask for Password */}
              {step === 'password' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Active Email Display */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block uppercase font-bold tracking-wider">
                        {userType === 'root' ? 'Root User' : 'IAM User'}
                      </span>
                      <span className="text-xs font-semibold text-slate-900">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-xs text-[#0972D3] font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  {/* Input: Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-900">
                        {userType === 'root' ? 'Root user password' : 'IAM password'}
                      </label>
                      <a href="#forgot" className="text-[11px] text-[#0972D3] hover:underline font-medium">
                        Forgot password?
                      </a>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter password"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
                      disabled={loginMutation.isPending}
                    />
                  </div>

                  {/* Show Password Toggle */}
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      id="showPassLogin"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="rounded border-slate-400 text-[#0972D3] focus:ring-[#0972D3]"
                    />
                    <label htmlFor="showPassLogin" className="cursor-pointer select-none">
                      Show password
                    </label>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-[#ec7211] hover:bg-[#d9650c] text-slate-900 font-bold py-2.5 px-4 rounded-full text-sm mt-3 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer flex items-center justify-center"
                  >
                    {loginMutation.isPending ? (
                      <span className="flex items-center space-x-2">
                        <svg className="animate-spin h-4 w-4 text-slate-900" fill="none" viewBox="0 0 24 24">
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
                    className="w-full text-xs text-slate-600 hover:text-slate-900 font-medium text-center pt-2"
                  >
                    ← Back to email entry
                  </button>
                </form>
              )}
            </div>

            {/* Quick Demo Credentials Reminder */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-900 space-y-1">
              <div className="font-semibold text-amber-950 flex items-center space-x-1">
                <span>💡 Demo Credentials:</span>
              </div>
              <p>Email: <span className="font-mono bg-amber-100 px-1 py-0.5 rounded font-bold">demo@route53clone.dev</span></p>
              <p>Password: <span className="font-mono bg-amber-100 px-1 py-0.5 rounded font-bold">Demo1234!</span></p>
            </div>
          </div>

          {/* RIGHT COLUMN: AWS Promo Banner (Amazon Quick AI - Matches User Screenshot 100%) */}
          <div className="md:col-span-6 lg:col-span-7 bg-[#f5f5f3] p-6 sm:p-8 border-t md:border-t-0 md:border-l border-slate-200 flex flex-col justify-between">
            {/* Top Graphics Banner: Colorful 3D Blocks */}
            <div>
              <div className="w-full h-32 sm:h-36 bg-gradient-to-r from-teal-400 via-pink-400 to-yellow-300 rounded-lg overflow-hidden relative shadow-sm border border-slate-300/60 flex items-center justify-center">
                {/* SVG Isometric Block Graphic Pattern matching Screenshot */}
                <svg className="w-full h-full" viewBox="0 0 500 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Block 1 (Cyan/Green Grid) */}
                  <rect x="10" y="20" width="70" height="120" rx="4" fill="#5eead4" stroke="#0f172a" strokeWidth="2" />
                  <path d="M 10 20 Q 80 20 80 140" stroke="#0f172a" strokeWidth="2" fill="none" />

                  {/* Block 2 (Orange Pyramid) */}
                  <rect x="90" y="20" width="70" height="120" rx="4" fill="#f97316" stroke="#0f172a" strokeWidth="2" />
                  <polygon points="125,20 90,140 160,140" fill="#ea580c" stroke="#0f172a" strokeWidth="2" />

                  {/* Block 3 (Pink Grid Cube) */}
                  <rect x="170" y="20" width="70" height="120" rx="4" fill="#ec4899" stroke="#0f172a" strokeWidth="2" />
                  <line x1="170" y1="60" x2="240" y2="60" stroke="#0f172a" strokeWidth="2" />
                  <line x1="170" y1="100" x2="240" y2="100" stroke="#0f172a" strokeWidth="2" />
                  <line x1="205" y1="20" x2="205" y2="140" stroke="#0f172a" strokeWidth="2" />

                  {/* Block 4 (Light Blue Curve) */}
                  <rect x="250" y="20" width="45" height="120" rx="4" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
                  <path d="M 250 20 C 295 40 295 120 250 140" fill="#0284c7" stroke="#0f172a" strokeWidth="2" />

                  {/* Block 5 (Purple Pink Grid) */}
                  <rect x="305" y="20" width="70" height="120" rx="4" fill="#f472b6" stroke="#0f172a" strokeWidth="2" />
                  <line x1="305" y1="60" x2="375" y2="60" stroke="#0f172a" strokeWidth="2" />
                  <line x1="305" y1="100" x2="375" y2="100" stroke="#0f172a" strokeWidth="2" />
                  <line x1="340" y1="20" x2="340" y2="140" stroke="#0f172a" strokeWidth="2" />

                  {/* Block 6 (Yellow X-Box) */}
                  <rect x="385" y="20" width="55" height="120" rx="4" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
                  <line x1="385" y1="20" x2="440" y2="140" stroke="#0f172a" strokeWidth="2" />
                  <line x1="440" y1="20" x2="385" y2="140" stroke="#0f172a" strokeWidth="2" />

                  {/* Block 7 (Teal Stripes) */}
                  <rect x="450" y="20" width="40" height="120" rx="4" fill="#2dd4bf" stroke="#0f172a" strokeWidth="2" />
                  <line x1="450" y1="40" x2="490" y2="80" stroke="#0f172a" strokeWidth="2" />
                  <line x1="450" y1="80" x2="490" y2="120" stroke="#0f172a" strokeWidth="2" />
                </svg>
              </div>

              {/* Promo Text Copy (Exact text from screenshot) */}
              <div className="pt-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
                  Amazon Quick is AI built for how you work
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed mb-6">
                  No more hunting across systems. Quick connects your apps and delivers answers fast.
                </p>
              </div>
            </div>

            {/* Bottom Promo CTA Link */}
            <div className="pt-4 border-t border-slate-300/60">
              <a
                href="https://aws.amazon.com/quick/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 font-bold text-xs text-slate-900 hover:underline"
              >
                <span>Get Started with Amazon Quick</span>
                <span className="text-base leading-none">→</span>
              </a>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Legal & Cookie Notice */}
      <footer className="py-4 text-center text-[11px] text-slate-500 z-10 px-4">
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

