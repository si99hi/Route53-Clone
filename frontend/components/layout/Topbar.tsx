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
  FlaskConical,
  Layers,
  Hexagon,
  Menu,
} from 'lucide-react';
import AwsLogo from './AwsLogo';
import FeedbackModal from '../ui/FeedbackModal';

export default function Topbar({ isSidebarOpen = true, onToggleSidebar }: { isSidebarOpen?: boolean; onToggleSidebar?: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeNotificationTab, setActiveNotificationTab] = useState<'most-recent' | 'user-configured' | 'aws-managed'>('most-recent');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [comingSoonToast, setComingSoonToast] = useState<string | null>(null);
  const [visualMode, setVisualMode] = useState<'browser' | 'light' | 'dark'>('browser');
  const [selectedLanguage, setSelectedLanguage] = useState('browser');
  const menuRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Alt+S keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerComingSoon = (featureName: string) => {
    setComingSoonToast(featureName);
    setTimeout(() => {
      setComingSoonToast((prev) => (prev === featureName ? null : prev));
    }, 3500);
  };

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

  const applyVisualMode = (mode: 'browser' | 'light' | 'dark') => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('aws-visual-mode', mode);
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else if (mode === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  useEffect(() => {
    const savedMode = (localStorage.getItem('aws-visual-mode') as 'browser' | 'light' | 'dark') || 'browser';
    setVisualMode(savedMode);
    applyVisualMode(savedMode);
  }, []);

  const handleVisualModeChange = (mode: 'browser' | 'light' | 'dark') => {
    setVisualMode(mode);
    applyVisualMode(mode);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setIsHelpOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const accountName = user?.email ? user.email.split('@')[0] : 'wevilo';
  const accountId = '1034-1531-9055';

  return (
    <header className="h-16 bg-[#16191F] text-white flex items-center justify-between px-3 fixed top-0 left-0 right-0 z-50 select-none text-xs font-sans border-b border-slate-800">
      {/* Toast Notification for Coming Soon features */}
      {comingSoonToast && (
        <div className="fixed top-12 right-4 z-50 bg-[#16191F] border border-[#0972D3] text-white px-4 py-2.5 rounded-md shadow-2xl flex items-center space-x-3 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="h-2 w-2 rounded-full bg-[#0972D3] animate-pulse shrink-0" />
          <div>
            <span className="font-semibold">{comingSoonToast}</span> — Feature coming soon
          </div>
          <button
            onClick={() => setComingSoonToast(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
      {/* LEFT SECTION */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 flex-1 min-w-0">
        {/* Hamburger Menu Button */}
        <button
          onClick={onToggleSidebar}
          className="p-1 rounded hover:bg-slate-700 transition-colors flex items-center justify-center text-white"
          title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          <Menu className="h-4 w-4" strokeWidth={2.5} />
        </button>

        {/* AWS White Logo */}
        <div
          className="flex items-center cursor-pointer hover:opacity-90 transition-opacity px-1"
          onClick={() => router.push('/hosted-zones')}
        >
          <AwsLogo className="h-4 w-auto" variant="dark" />
        </div>

        {/* Vertical Divider */}
        <div className="h-4 w-[1px] bg-slate-700/80 mx-0.5" />

        {/* AWS Q Icon (Gradient Hexagon Button) */}
        <button
          onClick={() => triggerComingSoon('Amazon Q')}
          className="p-1 rounded hover:bg-[#2e3542] transition-colors shrink-0 flex items-center justify-center"
          title="Amazon Q"
        >
          <div className="h-5 w-5 bg-gradient-to-tr from-purple-600 via-blue-600 to-indigo-500 rounded flex items-center justify-center font-bold text-[10px] text-white shadow-sm border border-indigo-400/40">
            Q
          </div>
        </button>

        {/* Vertical Divider */}
        <div className="h-4 w-[1px] bg-slate-700/80 mx-0.5" />

        {/* 9-Dots Grid Icon */}
        <button
          onClick={() => triggerComingSoon('AWS Services')}
          className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-[#2e3542] transition-colors shrink-0"
          title="AWS Services"
        >
          <Grid className="h-4 w-4" strokeWidth={1.5} />
        </button>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-2xl mx-1">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" strokeWidth={1.5} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search"
              className="w-full bg-[#0b0e14] border border-slate-700/80 rounded-md py-2 pl-10 pr-24 text-sm text-white placeholder-slate-400 font-normal italic focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
            />
            <div className="absolute right-2 flex items-center space-x-1.5 text-sm text-slate-400 pointer-events-none">
              <span className="text-sm text-[#0972D3] font-bold font-sans">
                [Alt+S]
              </span>
              <div className="h-4 w-4 rounded flex items-center justify-center text-slate-400 border border-slate-700 bg-slate-800/80">
                <Hexagon className="h-3 w-3 text-slate-300" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0 text-slate-300">
        {/* CloudShell Icon */}
        <button
          onClick={() => triggerComingSoon('CloudShell')}
          className="p-1.5 hover:text-[#539fe5] hover:bg-[#2e3542] rounded transition-colors"
          title="CloudShell"
        >
          <Terminal className="h-4 w-4" strokeWidth={1.5} />
        </button>

        {/* Vertical Divider */}
        <div className="h-4 w-[1px] bg-slate-700/80 my-auto" />

        {/* Notifications Icon & Popover Panel */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsHelpOpen(false);
              setIsUserMenuOpen(false);
              setIsSettingsOpen(false);
            }}
            className={`p-1.5 rounded transition-colors ${
              isNotificationsOpen
                ? 'bg-[#2e3542] text-[#539fe5]'
                : 'hover:text-[#539fe5] hover:bg-[#2e3542]'
            }`}
            title="Notifications"
          >
            <Bell className="h-4 w-4" strokeWidth={1.5} />
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-1.5 w-[420px] bg-[#16191F] border border-slate-700/80 rounded-md shadow-2xl z-50 text-xs text-slate-200 font-sans overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/80">
                <span className="font-bold text-sm text-white tracking-tight">Notifications</span>
                <a
                  href="#notification-center"
                  onClick={(e) => {
                    e.preventDefault();
                    triggerComingSoon('Notification center');
                    setIsNotificationsOpen(false);
                  }}
                  className="text-[#539fe5] hover:underline font-semibold text-xs"
                >
                  Notification center
                </a>
              </div>

              {/* Tabs */}
              <div className="flex items-center border-b border-slate-700/80 text-xs px-2 pt-1 bg-[#191d26]">
                <button
                  onClick={() => setActiveNotificationTab('most-recent')}
                  className={`px-3 py-2 font-bold transition-colors border-b-2 ${
                    activeNotificationTab === 'most-recent'
                      ? 'border-[#539fe5] text-[#539fe5]'
                      : 'border-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  Most recent
                </button>
                <button
                  onClick={() => setActiveNotificationTab('user-configured')}
                  className={`px-3 py-2 font-bold transition-colors border-b-2 flex items-center space-x-1.5 ${
                    activeNotificationTab === 'user-configured'
                      ? 'border-[#539fe5] text-[#539fe5]'
                      : 'border-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>User configured</span>
                </button>
                <button
                  onClick={() => setActiveNotificationTab('aws-managed')}
                  className={`px-3 py-2 font-bold transition-colors border-b-2 flex items-center space-x-1.5 ${
                    activeNotificationTab === 'aws-managed'
                      ? 'border-[#539fe5] text-[#539fe5]'
                      : 'border-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>AWS managed</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-4 max-h-[340px] overflow-y-auto sidebar-scrollbar bg-[#16191F]">
                {activeNotificationTab === 'most-recent' && (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-2.5 rounded bg-[#1c212a] border border-slate-700/60 hover:border-slate-600 transition-colors cursor-pointer">
                      <div className="p-1.5 bg-slate-800 rounded border border-slate-700 shrink-0 mt-0.5">
                        <Layers className="h-4 w-4 text-slate-300" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">AWS Health Event</span>
                          <span className="text-[11px] text-slate-400">8 hours ago</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          Health Event: AWS ACCOUNT CUSTOMER VERIFICATION SUCCESS in us-east-1 on account 103415319055.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeNotificationTab === 'user-configured' && (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <User className="h-8 w-8 mx-auto text-slate-600" strokeWidth={1.5} />
                    <p className="font-semibold text-white">No user configured notifications</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      You have not configured any custom notification rules in AWS User Notifications.
                    </p>
                  </div>
                )}

                {activeNotificationTab === 'aws-managed' && (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-2.5 rounded bg-[#1c212a] border border-slate-700/60 hover:border-slate-600 transition-colors cursor-pointer">
                      <div className="p-1.5 bg-slate-800 rounded border border-slate-700 shrink-0 mt-0.5">
                        <Layers className="h-4 w-4 text-slate-300" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">AWS Health Event</span>
                          <span className="text-[11px] text-slate-400">8 hours ago</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          Health Event: AWS ACCOUNT CUSTOMER VERIFICATION SUCCESS in us-east-1 on account 103415319055.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-4 w-[1px] bg-slate-700/80 my-auto" />

        {/* Help / Support Icon & Popover Menu */}
        <div className="relative" ref={helpRef}>
          <button
            onClick={() => {
              setIsHelpOpen(!isHelpOpen);
              setIsNotificationsOpen(false);
              setIsUserMenuOpen(false);
              setIsSettingsOpen(false);
            }}
            className={`p-1.5 rounded transition-colors ${
              isHelpOpen
                ? 'bg-[#2e3542] text-[#539fe5]'
                : 'hover:text-[#539fe5] hover:bg-[#2e3542]'
            }`}
            title="Support & Help"
          >
            <HelpCircle className="h-4 w-4" strokeWidth={1.5} />
          </button>

          {/* Support Dropdown Menu */}
          {isHelpOpen && (
            <div className="absolute right-0 mt-1.5 w-[230px] bg-[#16191F] border border-slate-700/80 rounded-md shadow-2xl z-50 text-xs text-slate-200 font-sans p-3 space-y-2">
              {/* Header: Support [↗] */}
              <div
                onClick={() => {
                  triggerComingSoon('Support');
                  setIsHelpOpen(false);
                }}
                className="flex items-center justify-between font-bold text-sm text-white hover:text-[#539fe5] cursor-pointer py-1 border-b border-slate-700/80 pb-2.5"
              >
                <span>Support</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-300" strokeWidth={1.5} />
              </div>

              {/* Section 1 */}
              <div className="space-y-1.5 pt-1 border-b border-slate-700/80 pb-2">
                <div
                  onClick={() => {
                    triggerComingSoon('Support Center');
                    setIsHelpOpen(false);
                  }}
                  className="py-1 px-1.5 rounded hover:bg-[#242b35] hover:text-white cursor-pointer transition-colors"
                >
                  Support Center
                </div>
                <div
                  onClick={() => {
                    triggerComingSoon('re:Post');
                    setIsHelpOpen(false);
                  }}
                  className="py-1 px-1.5 rounded hover:bg-[#242b35] hover:text-white cursor-pointer transition-colors"
                >
                  re:Post
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-1.5 pt-1 border-b border-slate-700/80 pb-2">
                <a
                  href="https://docs.aws.amazon.com/route53/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsHelpOpen(false)}
                  className="block py-1 px-1.5 rounded hover:bg-[#242b35] text-slate-200 hover:text-white cursor-pointer transition-colors"
                >
                  Documentation
                </a>
                <div
                  onClick={() => {
                    triggerComingSoon('Training');
                    setIsHelpOpen(false);
                  }}
                  className="py-1 px-1.5 rounded hover:bg-[#242b35] hover:text-white cursor-pointer transition-colors"
                >
                  Training
                </div>
                <div
                  onClick={() => {
                    triggerComingSoon('Getting Started Resource Center');
                    setIsHelpOpen(false);
                  }}
                  className="py-1 px-1.5 rounded hover:bg-[#242b35] hover:text-white cursor-pointer transition-colors"
                >
                  Getting Started Resource Center
                </div>
              </div>

              {/* Section 3: Send Feedback */}
              <div className="pt-1">
                <div
                  onClick={() => {
                    setIsHelpOpen(false);
                    setIsFeedbackOpen(true);
                  }}
                  className="py-1 px-1.5 rounded text-[#539fe5] hover:underline font-semibold cursor-pointer transition-colors"
                >
                  Send feedback
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-4 w-[1px] bg-slate-700/80 my-auto" />

        {/* Settings Icon & Popover Menu */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen);
              setIsHelpOpen(false);
              setIsNotificationsOpen(false);
              setIsUserMenuOpen(false);
            }}
            className={`p-1.5 rounded transition-colors ${
              isSettingsOpen
                ? 'bg-[#2e3542] text-[#539fe5]'
                : 'hover:text-[#539fe5] hover:bg-[#2e3542]'
            }`}
            title="Console Settings"
          >
            <Settings className="h-4 w-4" strokeWidth={1.5} />
          </button>

          {/* Current User Settings Popover */}
          {isSettingsOpen && (
            <div className="absolute right-0 mt-1.5 w-[260px] bg-[#16191F] border border-slate-700/80 rounded-md shadow-2xl z-50 text-xs text-white font-sans p-4 space-y-4">
              <h3 className="font-bold text-sm text-white tracking-tight">Current user settings</h3>

              {/* Language Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1">
                  Language
                </label>
                <div className="relative">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-[#0f1419] border border-slate-600 rounded px-3 py-1.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
                  >
                    <option value="browser">Browser default</option>
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-[#0972D3] pointer-events-none" strokeWidth={2} />
                </div>
              </div>

              {/* Visual Mode Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1.5">
                  Visual mode - <span className="italic font-normal">beta</span>
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-200 hover:text-white">
                    <input
                      type="radio"
                      name="visualMode"
                      value="browser"
                      checked={visualMode === 'browser'}
                      onChange={() => handleVisualModeChange('browser')}
                      className="h-3.5 w-3.5 text-[#0972D3] accent-[#0972D3] focus:ring-[#0972D3] cursor-pointer"
                    />
                    <span>Browser default</span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-200 hover:text-white">
                    <input
                      type="radio"
                      name="visualMode"
                      value="light"
                      checked={visualMode === 'light'}
                      onChange={() => handleVisualModeChange('light')}
                      className="h-3.5 w-3.5 text-[#0972D3] accent-[#0972D3] focus:ring-[#0972D3] cursor-pointer"
                    />
                    <span>Light</span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-200 hover:text-white">
                    <input
                      type="radio"
                      name="visualMode"
                      value="dark"
                      checked={visualMode === 'dark'}
                      onChange={() => handleVisualModeChange('dark')}
                      className="h-3.5 w-3.5 text-[#0972D3] accent-[#0972D3] focus:ring-[#0972D3] cursor-pointer"
                    />
                    <span>Dark</span>
                  </label>
                </div>
              </div>

              {/* Bottom Divider & Links */}
              <div className="border-t border-slate-700/80 pt-3 space-y-2 text-xs">
                <a
                  href="#user-settings"
                  onClick={(e) => e.preventDefault()}
                  className="block text-[#539fe5] hover:underline font-semibold"
                >
                  See all user settings
                </a>
                <a
                  href="#preview"
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center space-x-1.5 text-[#539fe5] hover:underline font-semibold"
                >
                  <span>AWS experimental preview</span>
                  <FlaskConical className="h-3.5 w-3.5 ml-0.5" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-4 w-[1px] bg-slate-700/80 mx-0.5" />

        {/* Region Selector */}
        <button
          onClick={() => triggerComingSoon('Region selector')}
          className="flex items-center space-x-1 px-2 py-1 rounded text-slate-300 hover:text-[#539fe5] hover:bg-[#2e3542] transition-colors font-medium cursor-pointer"
        >
          <span>Global</span>
          <ChevronDown className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
        </button>

        {/* Vertical Divider */}
        <div className="h-4 w-[1px] bg-slate-700/80 mx-0.5" />

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

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </header>
  );
}
