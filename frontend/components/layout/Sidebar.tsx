'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// AWS-style filled disclosure triangle for collapsibles
function TriangleDisclosure({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`h-2.5 w-2.5 mr-2 shrink-0 fill-[#16191F] dark:fill-slate-300 transition-transform duration-150 ${
        isOpen ? '' : '-rotate-90'
      }`}
      viewBox="0 0 10 10"
    >
      <polygon points="1,2 9,2 5,8" />
    </svg>
  );
}

// AWS-style filled chevron for sidebar header collapse button
function ChevronCollapseIcon() {
  return (
    <svg className="h-3 w-3 fill-[#414D5C] hover:fill-[#16191F] dark:fill-slate-400 dark:hover:fill-white" viewBox="0 0 10 10">
      <polygon points="7,1 2,5 7,9" />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  // Section collapse states
  const [openSections, setOpenSections] = useState({
    globalResolver: true,
    vpcResolver: true,
    domains: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isLinkActive = (href: string) => {
    if (href === '/hosted-zones') return pathname.startsWith('/hosted-zones');
    return pathname === href;
  };

  return (
    <aside className="w-[240px] bg-white dark:bg-[#16191F] border-r border-[#D5DBDB] dark:border-slate-800 text-[#16191F] dark:text-slate-200 flex flex-col fixed top-20 bottom-8 left-0 z-30 select-none overflow-y-auto font-sans sidebar-scrollbar">
      {/* 1. Sidebar Header */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#16191F] dark:text-white tracking-tight">
          Route 53
        </h2>
        <button
          className="p-1 rounded hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] transition-colors flex items-center justify-center"
          title="Collapse sidebar"
        >
          <ChevronCollapseIcon />
        </button>
      </div>

      {/* 2. Navigation Items List */}
      <nav className="flex-1 pb-4">
        {/* Top level items */}
        <div className="space-y-0.5">
          <Link
            href="/dashboard"
            className={clsx(
              'flex items-center h-[32px] transition-colors text-xs',
              isLinkActive('/dashboard')
                ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-[#EBF3FE] dark:bg-[#1c2738] border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[13px]'
                : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#16191F] dark:hover:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] pl-4'
            )}
          >
            Dashboard
          </Link>

          <Link
            href="/hosted-zones"
            className={clsx(
              'flex items-center h-[32px] transition-colors text-xs',
              isLinkActive('/hosted-zones')
                ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-[#EBF3FE] dark:bg-[#1c2738] border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[13px]'
                : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#16191F] dark:hover:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] pl-4'
            )}
          >
            Hosted zones
          </Link>

          <Link
            href="/health-checks"
            className={clsx(
              'flex items-center h-[32px] transition-colors text-xs',
              isLinkActive('/health-checks')
                ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-[#EBF3FE] dark:bg-[#1c2738] border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[13px]'
                : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#16191F] dark:hover:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] pl-4'
            )}
          >
            Health checks
          </Link>

          <Link
            href="/profiles"
            className={clsx(
              'flex items-center h-[32px] transition-colors text-xs',
              isLinkActive('/profiles')
                ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-[#EBF3FE] dark:bg-[#1c2738] border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[13px]'
                : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#16191F] dark:hover:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] pl-4'
            )}
          >
            Profiles
          </Link>
        </div>

        {/* SECTION 1: Global Resolver */}
        <div className="mt-3.5">
          <button
            onClick={() => toggleSection('globalResolver')}
            className="w-full flex items-center h-[32px] px-4 text-xs font-bold text-[#16191F] dark:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] transition-colors text-left"
          >
            <TriangleDisclosure isOpen={openSections.globalResolver} />
            <span>Global Resolver</span>
          </button>

          {openSections.globalResolver && (
            <div className="space-y-0.5 mt-0.5">
              <Link
                href="/global-resolvers"
                className={clsx(
                  'flex items-center justify-between h-[32px] transition-colors text-xs pr-4',
                  isLinkActive('/global-resolvers')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-[#EBF3FE] dark:bg-[#1c2738] border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#16191F] dark:hover:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] pl-[24px]'
                )}
              >
                <span>Global resolvers</span>
                <span className="text-[10px] font-semibold text-[#0972D3] dark:text-[#539fe5] bg-[#EBF3FE] dark:bg-[#1c2738] border border-[#A5C8FF] dark:border-blue-900/60 px-1.5 py-0.5 rounded-[3px] leading-none">
                  New
                </span>
              </Link>

              <Link
                href="/shared-dns-views"
                className={clsx(
                  'flex items-center justify-between h-[32px] transition-colors text-xs pr-4',
                  isLinkActive('/shared-dns-views')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-[#EBF3FE] dark:bg-[#1c2738] border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#16191F] dark:hover:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] pl-[24px]'
                )}
              >
                <span>Shared DNS views</span>
                <span className="text-[10px] font-semibold text-[#0972D3] dark:text-[#539fe5] bg-[#EBF3FE] dark:bg-[#1c2738] border border-[#A5C8FF] dark:border-blue-900/60 px-1.5 py-0.5 rounded-[3px] leading-none">
                  New
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* SECTION 2: VPC Resolver */}
        <div className="mt-3.5">
          <button
            onClick={() => toggleSection('vpcResolver')}
            className="w-full flex items-center h-[32px] px-4 text-xs font-bold text-[#16191F] dark:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] transition-colors text-left"
          >
            <TriangleDisclosure isOpen={openSections.vpcResolver} />
            <span>VPC Resolver</span>
          </button>

          {openSections.vpcResolver && (
            <div className="space-y-0.5 mt-0.5">
              <Link
                href="/vpcs"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  isLinkActive('/vpcs')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-[#EBF3FE] dark:bg-[#1c2738] border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#16191F] dark:hover:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] pl-[24px]'
                )}
              >
                VPCs
              </Link>

              <Link
                href="/inbound-endpoints"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  isLinkActive('/inbound-endpoints')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-[#EBF3FE] dark:bg-[#1c2738] border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#16191F] dark:hover:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] pl-[24px]'
                )}
              >
                Inbound endpoints
              </Link>

              <Link
                href="/outbound-endpoints"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  isLinkActive('/outbound-endpoints')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-[#EBF3FE] dark:bg-[#1c2738] border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#16191F] dark:hover:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] pl-[24px]'
                )}
              >
                Outbound endpoints
              </Link>

              <Link
                href="/rules"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  isLinkActive('/rules')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-[#EBF3FE] dark:bg-[#1c2738] border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#16191F] dark:hover:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] pl-[24px]'
                )}
              >
                Rules
              </Link>

              <Link
                href="/query-logging"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  isLinkActive('/query-logging')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-[#EBF3FE] dark:bg-[#1c2738] border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#16191F] dark:hover:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] pl-[24px]'
                )}
              >
                Query logging
              </Link>

              <Link
                href="/outposts"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  isLinkActive('/outposts')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-[#EBF3FE] dark:bg-[#1c2738] border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#16191F] dark:hover:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] pl-[24px]'
                )}
              >
                Outposts
              </Link>
            </div>
          )}
        </div>

        {/* SECTION 3: Domains */}
        <div className="mt-3.5">
          <button
            onClick={() => toggleSection('domains')}
            className="w-full flex items-center h-[32px] px-4 text-xs font-bold text-[#16191F] dark:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] transition-colors text-left"
          >
            <TriangleDisclosure isOpen={openSections.domains} />
            <span>Domains</span>
          </button>

          {openSections.domains && (
            <div className="space-y-0.5 mt-0.5">
              <Link
                href="/registered-domains"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  isLinkActive('/registered-domains')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-[#EBF3FE] dark:bg-[#1c2738] border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#16191F] dark:hover:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#252c37] pl-[24px]'
                )}
              >
                Registered domains
              </Link>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
