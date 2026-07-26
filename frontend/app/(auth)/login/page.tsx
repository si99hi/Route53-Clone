'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import AwsLogo from '../../../components/layout/AwsLogo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: () => {
      // Refresh router and redirect
      router.refresh();
      router.push('/hosted-zones');
    },
    onError: (error: any) => {
      setFormError(error.detail || 'Login failed. Please check your credentials.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      {/* AWS-styled Logo/Header */}
      <div className="mb-6 flex flex-col items-center">
        <div className="flex items-center space-x-3 text-2xl font-bold text-slate-800">
          <AwsLogo className="h-9 w-auto text-slate-900" />
        </div>
      </div>

      {/* Login Box */}
      <div className="w-full max-w-[420px] bg-white border border-slate-300 rounded shadow-md p-8">
        <h2 className="text-xl font-medium text-slate-900 mb-6">Sign in</h2>

        {formError && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-sm text-red-800 flex items-start space-x-2">
            <svg
              className="h-5 w-5 text-red-500 shrink-0 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-400 rounded text-sm text-slate-900 focus:outline-none focus:border-[#ec7211] focus:ring-1 focus:ring-[#ec7211]"
              placeholder="e.g. demo@route53clone.dev"
              disabled={loginMutation.isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-400 rounded text-sm text-slate-900 focus:outline-none focus:border-[#ec7211] focus:ring-1 focus:ring-[#ec7211]"
              placeholder="e.g. Demo1234!"
              disabled={loginMutation.isPending}
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-1.5 px-4 bg-[#ec7211] hover:bg-[#d65f00] text-slate-900 font-medium rounded text-sm transition-colors border border-[#d65f00] focus:outline-none focus:ring-2 focus:ring-[#ec7211] flex items-center justify-center space-x-2"
          >
            {loginMutation.isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-700 mb-1">Testing Credentials:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Email: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">demo@route53clone.dev</span></li>
            <li>Password: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">Demo1234!</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
