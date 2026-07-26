'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import {
  Search,
  Grid,
  Bell,
  HelpCircle,
  Settings,
  Terminal,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  User,
  Circle,
} from 'lucide-react';
import AwsLogo from './AwsLogo';

export default function Topbar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: api.getMe,
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.clear();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    },
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const accountName = user?.email ? user.email.split('@')[0] : 'wevilo';
  const accountId = '1034-1531-9055';

  return (
    <header className="h-10 bg-[#16191F] text-white flex items-center justify-between px-3 fixed top-0 left-0 right-0 z-50 select-none text-xs font-sans border-b border-slate-800">
      {/* LEFT SECTION */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
        {/* AWS White Logo */}
        <div
          className="flex items-center cursor-pointer hover:opacity-90 transition-opacity pr-1"
          onClick={() => router.push('/hosted-zones')}
        >
          <AwsLogo className="h-4 w-auto" variant="dark" />
        </div>

        {/* AWS Q Icon (Gradient Hexagon) */}
        <button
          className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#2e3542] transition-colors shrink-0"
          title="Amazon Q"
        >
          <div className="h-4 w-4 bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-400 rounded-xs flex items-center justify-center font-semibold text-[9px] text-white shadow-2xs">
            Q
          </div>
        </button>

        {/* 9-Dots Grid Icon */}
        <button
          className="p-1 rounded text-slate-300 hover:text-white hover:bg-[#2e3542] transition-colors shrink-0"
          title="AWS Services"
        >
          <Grid className="h-4 w-4" strokeWidth={1.5} />
        </button>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-xl mx-1 sm:mx-2">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#0f1419] border border-slate-700/80 rounded-[4px] py-1 pl-8 pr-16 text-xs text-white placeholder-slate-400 font-normal italic focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
            />
            <div className="absolute right-2 flex items-center space-x-1.5 text-[10px] text-slate-400 pointer-events-none">
              <span className="bg-slate-800 px-1 py-0.5 rounded-xs text-[9px] font-mono border border-slate-700">
                [Alt+S]
              </span>
              <div className="h-3.5 w-3.5 bg-gradient-to-tr from-purple-500 to-blue-400 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                Q
              </div>
            </div>
          </div>
        </div>

        {/* External Launcher Icon next to search */}
        <button
          className="p-1 text-slate-400 hover:text-white hover:bg-[#2e3542] rounded transition-colors hidden md:block"
          title="Open in new window"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
        {/* CloudShell Icon */}
        <button
          className="p-1.5 text-slate-300 hover:text-white hover:bg-[#2e3542] rounded transition-colors"
          title="CloudShell"
        >
          <Terminal className="h-4 w-4" strokeWidth={1.5} />
        </button>

        {/* Notifications Icon */}
        <button
          className="p-1.5 text-slate-300 hover:text-white hover:bg-[#2e3542] rounded transition-colors relative"
          title="Notifications"
        >
          <Bell className="h-4 w-4" strokeWidth={1.5} />
        </button>

        {/* Help Icon */}
        <button
          className="p-1.5 text-slate-300 hover:text-white hover:bg-[#2e3542] rounded transition-colors"
          title="Help"
        >
          <HelpCircle className="h-4 w-4" strokeWidth={1.5} />
        </button>

        {/* Settings Icon */}
        <button
          className="p-1.5 text-slate-300 hover:text-white hover:bg-[#2e3542] rounded transition-colors"
          title="Console Settings"
        >
          <Settings className="h-4 w-4" strokeWidth={1.5} />
        </button>

        {/* Vertical Divider */}
        <div className="h-4 w-[1px] bg-slate-700 mx-1" />

        {/* Region Selector */}
        <button className="flex items-center space-x-1 px-2 py-1 rounded text-slate-300 hover:text-white hover:bg-[#2e3542] transition-colors font-medium">
          <span>Global</span>
          <ChevronDown className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
        </button>

        {/* User Account Menu Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex flex-col items-end px-2 py-0.5 rounded hover:bg-[#2e3542] transition-colors text-right"
          >
            <div className="flex items-center space-x-1 font-medium text-slate-200 hover:text-white text-xs">
              <span>
                {accountName} ({accountId.replace(/-/g, '')})
              </span>
              {isUserMenuOpen ? (
                <ChevronUp className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
              ) : (
                <ChevronDown className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
              )}
            </div>
            <span className="text-[10px] text-slate-400 leading-none">{accountName}</span>
          </button>

          {/* User Menu Popup */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1 w-[360px] max-h-[calc(100vh-50px)] overflow-y-auto sidebar-scrollbar bg-[#16191F] border border-slate-700/80 rounded-md shadow-2xl z-50 text-xs text-slate-200 font-sans p-4 space-y-3">
              {/* SECTION 1: Free plan status & Credits */}
              <div className="space-y-2 pb-2.5 border-b border-slate-700/80">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Credits remaining</span>
                    <a href="#credits" className="text-[#539fe5] hover:underline font-semibold text-sm">
                      $100.00 USD
                    </a>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Days remaining</span>
                    <span className="font-semibold text-sm text-white">185 days</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  Your free access to AWS services will end on Jan 26, 2027 or when you have depleted all credits. To ensure uninterrupted AWS access, see{' '}
                  <a href="#upgrade" className="text-[#539fe5] hover:underline">
                    upgrading your plan
                  </a>{' '}
                  for details.
                </p>
              </div>

              {/* SECTION 2: Account ID, Name & Color */}
              <div className="space-y-2 pb-2.5 border-b border-slate-700/80 text-xs">
                {/* Account ID */}
                <div>
                  <span className="text-slate-400 text-[11px] block">Account ID</span>
                  <div className="flex items-center space-x-1.5 text-white font-medium mt-0.5">
                    <Copy className="h-3.5 w-3.5 text-[#539fe5] cursor-pointer hover:opacity-80" strokeWidth={1.5} />
                    <span>{accountId}</span>
                  </div>
                </div>

                {/* Account Name */}
                <div>
                  <span className="text-slate-400 text-[11px] block">Account name</span>
                  <div className="flex items-center space-x-1.5 text-white font-medium mt-0.5">
                    <User className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                    <span>{accountName}</span>
                  </div>
                </div>

                {/* Account Color */}
                <div>
                  <span className="text-slate-400 text-[11px] block">Account color</span>
                  <div className="flex items-center space-x-1.5 text-slate-300 mt-0.5">
                    <Circle className="h-3.5 w-3.5 text-slate-500 fill-slate-500" strokeWidth={1.5} />
                    <span>Unset</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Account Menu Items */}
              <div className="space-y-1 pb-2.5 border-b border-slate-700/80 font-normal">
                <a href="#account" className="block py-0.5 hover:text-[#539fe5] transition-colors">
                  Account
                </a>
                <a href="#organization" className="block py-0.5 hover:text-[#539fe5] transition-colors">
                  Organization
                </a>
                <a href="#service-quotas" className="block py-0.5 hover:text-[#539fe5] transition-colors">
                  Service Quotas
                </a>
                <a href="#billing" className="block py-0.5 hover:text-[#539fe5] transition-colors">
                  Billing and Cost Management
                </a>
                <a href="#security-credentials" className="block py-0.5 hover:text-[#539fe5] transition-colors">
                  Security credentials
                </a>
                <a href="#mobile-app" className="block py-0.5 hover:text-[#539fe5] transition-colors">
                  Console Mobile App
                </a>
                <a href="#agent-toolkit" className="block py-0.5 hover:text-[#539fe5] transition-colors">
                  Agent Toolkit for AWS
                </a>
              </div>

              {/* SECTION 4: Bottom Action Buttons */}
              <div className="flex flex-col items-end space-y-2.5 pt-1">
                {/* Non-functional Multi-session support button */}
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="py-1.5 px-5 rounded-full border-2 border-[#539fe5] text-[#539fe5] font-semibold text-xs transition-colors hover:bg-blue-900/20 cursor-default"
                  title="Multi-session support is not available in demo"
                >
                  Turn on multi-session support
                </button>

                {/* Functional Sign out button */}
                <button
                  type="button"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="py-1.5 px-7 rounded-full bg-[#ec7211] hover:bg-[#d65f00] text-slate-900 font-bold text-xs transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
