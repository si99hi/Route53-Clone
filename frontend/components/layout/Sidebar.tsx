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

export default function Sidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname();

  // Section collapse states
  const [openSections, setOpenSections] = useState({
    globalResolver: true,
    vpcResolver: true,
    domains: true,
    ipRouting: true,
    trafficFlow: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isLinkActive = (href: string) => {
    if (href === '/hosted-zones') return pathname.startsWith('/hosted-zones');
    return pathname === href;
  };

  return (
    <aside className={`bg-white dark:bg-[#16191F] border-r border-[#D5DBDB] dark:border-slate-800 text-[#16191F] dark:text-slate-200 flex flex-col fixed top-28 left-0 z-30 select-none overflow-y-auto font-sans sidebar-scrollbar transition-all duration-300 ${
      isCollapsed ? 'w-[56px]' : 'w-[240px]'
    }`} style={{ height: 'calc(100vh - 112px)' }}>
      {/* 1. Sidebar Header */}
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} pb-2 flex items-center justify-start`}>
        {!isCollapsed && (
          <h2 className="text-base font-bold text-[#16191F] dark:text-white tracking-tight">
            Route 53
          </h2>
        )}
      </div>

      {/* 2. Navigation Items List */}
      <nav className="flex-1 pb-4">
        {/* Top level items */}
        <div className="space-y-0.5">
          <Link
            href="/dashboard"
            className={clsx(
              'flex items-center h-[32px] transition-colors text-xs',
              isCollapsed ? 'justify-center px-2' : '',
              isLinkActive('/dashboard')
                ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-transparent dark:bg-transparent border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[13px]'
                : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#0972D3] dark:hover:text-[#539fe5] hover:border-b hover:border-dotted hover:border-[#0972D3] dark:hover:border-[#539fe5] pl-4'
            )}
          >
            {!isCollapsed && 'Dashboard'}
          </Link>

          <Link
            href="/hosted-zones"
            className={clsx(
              'flex items-center h-[32px] transition-colors text-xs',
              isCollapsed ? 'justify-center px-2' : '',
              isLinkActive('/hosted-zones')
                ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-transparent dark:bg-transparent border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[13px]'
                : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#0972D3] dark:hover:text-[#539fe5] hover:border-b hover:border-dotted hover:border-[#0972D3] dark:hover:border-[#539fe5] pl-4'
            )}
          >
            {!isCollapsed && 'Hosted zones'}
          </Link>

          <Link
            href="/health-checks"
            className={clsx(
              'flex items-center h-[32px] transition-colors text-xs',
              isCollapsed ? 'justify-center px-2' : '',
              isLinkActive('/health-checks')
                ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-transparent dark:bg-transparent border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[13px]'
                : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#0972D3] dark:hover:text-[#539fe5] hover:border-b hover:border-dotted hover:border-[#0972D3] dark:hover:border-[#539fe5] pl-4'
            )}
          >
            {!isCollapsed && 'Health checks'}
          </Link>

          <Link
            href="/profiles"
            className={clsx(
              'flex items-center h-[32px] transition-colors text-xs',
              isCollapsed ? 'justify-center px-2' : '',
              isLinkActive('/profiles')
                ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-transparent dark:bg-transparent border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[13px]'
                : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#0972D3] dark:hover:text-[#539fe5] hover:border-b hover:border-dotted hover:border-[#0972D3] dark:hover:border-[#539fe5] pl-4'
            )}
          >
            {!isCollapsed && 'Profiles'}
          </Link>
        </div>

        {/* SECTION 1: Global Resolver */}
        <div className="mt-3.5">
          <button
            onClick={() => toggleSection('globalResolver')}
            className={`w-full flex items-center h-[32px] text-xs font-bold transition-colors text-left ${isCollapsed ? 'justify-center px-2' : 'px-4'} text-[#16191F] dark:text-white hover:text-[#0972D3] dark:hover:text-[#539fe5]`}
          >
            {!isCollapsed && <TriangleDisclosure isOpen={openSections.globalResolver} />}
            {!isCollapsed && <span>Global Resolver</span>}
          </button>

          {!isCollapsed && openSections.globalResolver && (
            <div className="space-y-0.5 mt-0.5">
              <Link
                href="/global-resolvers"
                className={clsx(
                  'flex items-center justify-between h-[32px] transition-colors text-xs pr-4',
                  isLinkActive('/global-resolvers')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-transparent dark:bg-transparent border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#0972D3] dark:hover:text-[#539fe5] hover:border-b hover:border-dotted hover:border-[#0972D3] dark:hover:border-[#539fe5] pl-[24px]'
                )}
              >
                <span>Global resolvers</span>
                <span className="text-[11px] font-semibold text-[#0972D3] dark:text-[#539fe5] border-b border-dotted border-[#0972D3] dark:border-[#539fe5] leading-none pb-[1px]">
                  New
                </span>
              </Link>

              <Link
                href="/shared-dns-views"
                className={clsx(
                  'flex items-center justify-between h-[32px] transition-colors text-xs pr-4',
                  isLinkActive('/shared-dns-views')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-transparent dark:bg-transparent border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#0972D3] dark:hover:text-[#539fe5] hover:border-b hover:border-dotted hover:border-[#0972D3] dark:hover:border-[#539fe5] pl-[24px]'
                )}
              >
                <span>Shared DNS views</span>
                <span className="text-[11px] font-semibold text-[#0972D3] dark:text-[#539fe5] border-b border-dotted border-[#0972D3] dark:border-[#539fe5] leading-none pb-[1px]">
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
            className={`w-full flex items-center h-[32px] text-xs font-bold transition-colors text-left ${isCollapsed ? 'justify-center px-2' : 'px-4'} text-[#16191F] dark:text-white hover:text-[#0972D3] dark:hover:text-[#539fe5]`}
          >
            {!isCollapsed && <TriangleDisclosure isOpen={openSections.vpcResolver} />}
            {!isCollapsed && <span>VPC Resolver</span>}
          </button>

          {!isCollapsed && openSections.vpcResolver && (
            <div className="space-y-0.5 mt-0.5">
              <Link
                href="/vpcs"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  isLinkActive('/vpcs')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-transparent dark:bg-transparent border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#0972D3] dark:hover:text-[#539fe5] hover:border-b hover:border-dotted hover:border-[#0972D3] dark:hover:border-[#539fe5] pl-[24px]'
                )}
              >
                VPCs
              </Link>

              <Link
                href="/inbound-endpoints"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  isLinkActive('/inbound-endpoints')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-transparent dark:bg-transparent border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#0972D3] dark:hover:text-[#539fe5] hover:border-b hover:border-dotted hover:border-[#0972D3] dark:hover:border-[#539fe5] pl-[24px]'
                )}
              >
                Inbound endpoints
              </Link>

              <Link
                href="/outbound-endpoints"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  isLinkActive('/outbound-endpoints')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-transparent dark:bg-transparent border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#0972D3] dark:hover:text-[#539fe5] hover:border-b hover:border-dotted hover:border-[#0972D3] dark:hover:border-[#539fe5] pl-[24px]'
                )}
              >
                Outbound endpoints
              </Link>

              <Link
                href="/rules"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  isLinkActive('/rules')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-transparent dark:bg-transparent border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#0972D3] dark:hover:text-[#539fe5] hover:border-b hover:border-dotted hover:border-[#0972D3] dark:hover:border-[#539fe5] pl-[24px]'
                )}
              >
                Rules
              </Link>

              <Link
                href="/query-logging"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  isLinkActive('/query-logging')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-transparent dark:bg-transparent border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#0972D3] dark:hover:text-[#539fe5] hover:border-b hover:border-dotted hover:border-[#0972D3] dark:hover:border-[#539fe5] pl-[24px]'
                )}
              >
                Query logging
              </Link>

              <Link
                href="/outposts"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  isLinkActive('/outposts')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-transparent dark:bg-transparent border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#0972D3] dark:hover:text-[#539fe5] hover:border-b hover:border-dotted hover:border-[#0972D3] dark:hover:border-[#539fe5] pl-[24px]'
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
            className={`w-full flex items-center h-[32px] text-xs font-bold transition-colors text-left ${isCollapsed ? 'justify-center px-2' : 'px-4'} text-[#16191F] dark:text-white hover:text-[#0972D3] dark:hover:text-[#539fe5]`}
          >
            {!isCollapsed && <TriangleDisclosure isOpen={openSections.domains} />}
            {!isCollapsed && <span>Domains</span>}
          </button>

          {!isCollapsed && openSections.domains && (
            <div className="space-y-0.5 mt-0.5">
              <Link
                href="/registered-domains"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  isLinkActive('/registered-domains')
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-transparent dark:bg-transparent border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#0972D3] dark:hover:text-[#539fe5] hover:border-b hover:border-dotted hover:border-[#0972D3] dark:hover:border-[#539fe5] pl-[24px]'
                )}
              >
                Registered domains
              </Link>
            </div>
          )}
        </div>

        {/* IP-based routing */}
        <div className="mt-3.5">
          <button
            onClick={() => toggleSection('ipRouting')}
            className={`w-full flex items-center h-[32px] text-xs font-bold transition-colors text-left ${isCollapsed ? 'justify-center px-2' : 'px-4'} text-[#16191F] dark:text-white hover:text-[#0972D3] dark:hover:text-[#539fe5]`}
          >
            {!isCollapsed && <TriangleDisclosure isOpen={openSections.ipRouting} />}
            {!isCollapsed && <span>IP-based routing</span>}
          </button>

          {!isCollapsed && openSections.ipRouting && (
            <div className="space-y-0.5 mt-0.5">
              <Link
                href="/cidr-collections"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  pathname === '/cidr-collections'
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-transparent dark:bg-transparent border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#0972D3] dark:hover:text-[#539fe5] hover:border-b hover:border-dotted hover:border-[#0972D3] dark:hover:border-[#539fe5] pl-[24px]'
                )}
              >
                CIDR collections
              </Link>
            </div>
          )}
        </div>

        {/* Traffic flow */}
        <div className="mt-3.5">
          <button
            onClick={() => toggleSection('trafficFlow')}
            className={`w-full flex items-center h-[32px] text-xs font-bold transition-colors text-left ${isCollapsed ? 'justify-center px-2' : 'px-4'} text-[#16191F] dark:text-white hover:text-[#0972D3] dark:hover:text-[#539fe5]`}
          >
            {!isCollapsed && <TriangleDisclosure isOpen={openSections.trafficFlow} />}
            {!isCollapsed && <span>Traffic flow</span>}
          </button>

          {!isCollapsed && openSections.trafficFlow && (
            <div className="space-y-0.5 mt-0.5">
              <Link
                href="/traffic-policies"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  pathname === '/traffic-policies'
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-transparent dark:bg-transparent border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#0972D3] dark:hover:text-[#539fe5] hover:border-b hover:border-dotted hover:border-[#0972D3] dark:hover:border-[#539fe5] pl-[24px]'
                )}
              >
                Traffic policies
              </Link>
              <Link
                href="/policy-records"
                className={clsx(
                  'flex items-center h-[32px] transition-colors text-xs',
                  pathname === '/policy-records'
                    ? 'text-[#0972D3] dark:text-[#539fe5] font-semibold bg-transparent dark:bg-transparent border-l-[3px] border-[#0972D3] dark:border-[#539fe5] pl-[21px]'
                    : 'text-[#414D5C] dark:text-slate-300 font-normal hover:text-[#0972D3] dark:hover:text-[#539fe5] hover:border-b hover:border-dotted hover:border-[#0972D3] dark:hover:border-[#539fe5] pl-[24px]'
                )}
              >
                Policy records
              </Link>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
