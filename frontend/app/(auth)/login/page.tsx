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
      <header className="py-8 flex justify-center z-10">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <AwsLogo className="h-9 w-auto text-slate-900" />
        </Link>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* LEFT CARD: Sign In Form Box */}
          <div className="lg:col-span-6 bg-white border border-slate-300 rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#16191f] mb-1">Sign In</h1>
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

              {/* STEP 1: Email Address & User Type */}
              {step === 'email' && (
                <form onSubmit={handleNextStep} className="space-y-4">
                  {/* User Type Radio Selector Cards */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[#16191f]">User type</span>
                      <a href="#not-sure" className="text-[#0972D3] hover:underline text-[12px] font-normal">
                        (not sure?)
                      </a>
                    </div>

                    {/* Option 1: Root user */}
                    <div
                      onClick={() => setUserType('root')}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${
                        userType === 'root'
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
                          className="h-4 w-4 text-[#0972D3] focus:ring-[#0972D3] accent-[#0972D3] cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#16191f]">Root user</div>
                        <div className="text-[11px] text-slate-600 leading-snug mt-0.5">
                          Account owner that performs tasks requiring unrestricted access.
                        </div>
                      </div>
                    </div>

                    {/* Option 2: IAM user */}
                    <div
                      onClick={() => setUserType('iam')}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${
                        userType === 'iam'
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
                          className="h-4 w-4 text-[#0972D3] focus:ring-[#0972D3] accent-[#0972D3] cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#16191f]">IAM user</div>
                        <div className="text-[11px] text-slate-600 leading-snug mt-0.5">
                          User within an account that performs daily tasks.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input: Email */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-[#16191f] mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="username@example.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3] transition-shadow placeholder:text-slate-400"
                    />
                  </div>

                  {/* Next Button */}
                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#ec7211] hover:bg-[#d9650c] active:bg-[#c45a0a] text-[#16191f] font-bold py-2.5 px-4 rounded-full text-sm transition-colors shadow-xs cursor-pointer text-center"
                  >
                    Next
                  </button>

                  {/* Divider */}
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">OR</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  {/* Sign Up Link Button */}
                  <Link
                    href="/register"
                    className="w-full border-2 border-[#0972D3] text-[#0972D3] hover:bg-blue-50/50 font-bold py-2 px-4 rounded-full text-sm text-center block transition-colors"
                  >
                    New to AWS? Sign up
                  </Link>
                </form>
              )}

              {/* STEP 2: Ask for Password */}
              {step === 'password' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Active Email Display Badge */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-[#16191f]">
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3] transition-shadow placeholder:text-slate-400"
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
                      className="rounded border-slate-300 text-[#0972D3] focus:ring-[#0972D3] cursor-pointer"
                    />
                    <label htmlFor="showPassLogin" className="cursor-pointer select-none">
                      Show password
                    </label>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-[#ec7211] hover:bg-[#d9650c] active:bg-[#c45a0a] text-[#16191f] font-bold py-2.5 px-4 rounded-full text-sm mt-3 transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center"
                  >
                    {loginMutation.isPending ? (
                      <span className="flex items-center space-x-2">
                        <svg className="animate-spin h-4 w-4 text-[#16191f]" fill="none" viewBox="0 0 24 24">
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
                    className="w-full text-xs text-slate-600 hover:text-slate-900 font-medium text-center pt-2 block"
                  >
                    ← Back to email entry
                  </button>
                </form>
              )}
            </div>

            {/* Quick Demo Credentials Badge */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-lg text-[11px] text-amber-900 space-y-1 mt-4">
              <div className="font-semibold text-amber-950 flex items-center space-x-1">
                <span>💡 Demo Credentials:</span>
              </div>
              <p className="flex items-center space-x-1">
                <span>Email:</span>
                <span className="font-mono bg-amber-100/80 px-1.5 py-0.5 rounded font-bold">demo@route53clone.dev</span>
              </p>
              <p className="flex items-center space-x-1">
                <span>Password:</span>
                <span className="font-mono bg-amber-100/80 px-1.5 py-0.5 rounded font-bold">Demo1234!</span>
              </p>
            </div>
          </div>

          {/* RIGHT CARD: AWS Amazon Quick Promo Banner (Matching exact AWS Design in User Image) */}
          <div className="lg:col-span-6 bg-[#f4f3ee] border border-slate-300/70 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Graphic Banner: Connecting Line & Colorful 3D Blocks */}
              <div className="w-full h-36 bg-[#e9e7e1] rounded-xl overflow-hidden relative shadow-inner border border-slate-300/50 flex items-center justify-center p-2">
                <svg className="w-full h-full" viewBox="0 0 460 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Center Horizontal Connecting Wire */}
                  <line x1="0" y1="70" x2="460" y2="70" stroke="#1e293b" strokeWidth="2.5" />

                  {/* Block 1: Cyan Arc Block */}
                  <g transform="translate(10, 20)">
                    <rect x="0" y="0" width="45" height="100" rx="4" fill="#5eead4" stroke="#1e293b" strokeWidth="2" />
                    <path d="M 0 0 C 45 20 45 80 0 100" stroke="#1e293b" strokeWidth="2" fill="none" />
                  </g>
                  {/* Dot 1 */}
                  <circle cx="62" cy="70" r="5" fill="#1e293b" />

                  {/* Block 2: Orange Pyramid Block */}
                  <g transform="translate(70, 20)">
                    <rect x="0" y="0" width="48" height="100" rx="4" fill="#f97316" stroke="#1e293b" strokeWidth="2" />
                    <polygon points="24,0 0,100 48,100" fill="#ea580c" stroke="#1e293b" strokeWidth="2" />
                  </g>
                  {/* Dot 2 */}
                  <circle cx="125" cy="70" r="5" fill="#1e293b" />

                  {/* Block 3: Blue Grid Block */}
                  <g transform="translate(133, 20)">
                    <rect x="0" y="0" width="52" height="100" rx="4" fill="#38bdf8" stroke="#1e293b" strokeWidth="2" />
                    <line x1="0" y1="33" x2="52" y2="33" stroke="#1e293b" strokeWidth="2" />
                    <line x1="0" y1="66" x2="52" y2="66" stroke="#1e293b" strokeWidth="2" />
                    <line x1="26" y1="0" x2="26" y2="100" stroke="#1e293b" strokeWidth="2" />
                  </g>
                  {/* Dot 3 */}
                  <circle cx="192" cy="70" r="5" fill="#1e293b" />

                  {/* Block 4: Narrow Cyan Curve */}
                  <g transform="translate(200, 20)">
                    <rect x="0" y="0" width="28" height="100" rx="4" fill="#2dd4bf" stroke="#1e293b" strokeWidth="2" />
                    <path d="M 0 0 Q 28 50 0 100" fill="#0f766e" stroke="#1e293b" strokeWidth="2" />
                  </g>
                  {/* Dot 4 */}
                  <circle cx="234" cy="70" r="5" fill="#1e293b" />

                  {/* Block 5: Pink Grid Block */}
                  <g transform="translate(242, 20)">
                    <rect x="0" y="0" width="52" height="100" rx="4" fill="#f472b6" stroke="#1e293b" strokeWidth="2" />
                    <line x1="0" y1="33" x2="52" y2="33" stroke="#1e293b" strokeWidth="2" />
                    <line x1="0" y1="66" x2="52" y2="66" stroke="#1e293b" strokeWidth="2" />
                    <line x1="26" y1="0" x2="26" y2="100" stroke="#1e293b" strokeWidth="2" />
                  </g>
                  {/* Dot 5 */}
                  <circle cx="301" cy="70" r="5" fill="#1e293b" />

                  {/* Block 6: Yellow X Block */}
                  <g transform="translate(309, 20)">
                    <rect x="0" y="0" width="48" height="100" rx="4" fill="#facc15" stroke="#1e293b" strokeWidth="2" />
                    <line x1="0" y1="0" x2="48" y2="100" stroke="#1e293b" strokeWidth="2" />
                    <line x1="48" y1="0" x2="0" y2="100" stroke="#1e293b" strokeWidth="2" />
                  </g>
                  {/* Dot 6 */}
                  <circle cx="363" cy="70" r="5" fill="#1e293b" />

                  {/* Block 7: Green Vertical Stripes Block */}
                  <g transform="translate(371, 20)">
                    <rect x="0" y="0" width="42" height="100" rx="4" fill="#34d399" stroke="#1e293b" strokeWidth="2" />
                    <line x1="14" y1="0" x2="14" y2="100" stroke="#1e293b" strokeWidth="2" />
                    <line x1="28" y1="0" x2="28" y2="100" stroke="#1e293b" strokeWidth="2" />
                  </g>
                  {/* Dot 7 */}
                  <circle cx="420" cy="70" r="5" fill="#1e293b" />

                  {/* Block 8: Orange Stripes Block */}
                  <g transform="translate(427, 20)">
                    <rect x="0" y="0" width="30" height="100" rx="4" fill="#fb923c" stroke="#1e293b" strokeWidth="2" />
                    <line x1="0" y1="30" x2="30" y2="60" stroke="#1e293b" strokeWidth="2" />
                    <line x1="0" y1="70" x2="30" y2="100" stroke="#1e293b" strokeWidth="2" />
                  </g>
                </svg>
              </div>

              {/* Headline & Description Copy */}
              <div className="pt-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16191f] tracking-tight leading-snug mb-3">
                  Amazon Quick is AI built for how you work
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
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
                className="inline-flex items-center space-x-1.5 font-bold text-xs text-[#16191f] hover:underline group"
              >
                <span>Get Started with Amazon Quick</span>
                <span className="text-sm leading-none transition-transform group-hover:translate-x-0.5">→</span>
              </a>
            </div>
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


