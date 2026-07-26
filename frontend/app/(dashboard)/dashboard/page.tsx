'use client';

import React from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex flex-col space-y-6 font-sans">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#16191F] tracking-tight">
          Route 53 Dashboard <span className="text-xs font-normal text-[#0972D3] hover:underline cursor-pointer">Info</span>
        </h1>
      </div>

      {/* Main Grid Container matching AWS Console */}
      <div className="bg-white border border-slate-300 rounded-md p-6 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Box 1: DNS Management */}
          <div className="flex flex-col items-center text-center p-4 border border-slate-100 rounded-lg bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900 mb-1">DNS management</h2>
            <p className="text-xs text-slate-600 max-w-sm mb-4 leading-relaxed">
              A hosted zone tells Route 53 how to respond to DNS queries for a domain such as example.com.
            </p>
            <Link
              href="/hosted-zones/new"
              className="px-6 py-1.5 border border-[#0972D3] text-[#0972D3] hover:bg-blue-50 font-semibold rounded-full text-xs transition-colors shadow-2xs"
            >
              Create hosted zone
            </Link>
          </div>

          {/* Box 2: Availability monitoring */}
          <div className="flex flex-col items-center text-center p-4 border border-slate-100 rounded-lg bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Availability monitoring</h2>
            <p className="text-xs text-slate-600 max-w-sm mb-4 leading-relaxed">
              Health checks monitor your applications and web resources, and direct DNS queries to healthy resources.
            </p>
            <Link
              href="/health-checks"
              className="px-6 py-1.5 border border-[#0972D3] text-[#0972D3] hover:bg-blue-50 font-semibold rounded-full text-xs transition-colors shadow-2xs"
            >
              Create health check
            </Link>
          </div>

          {/* Box 3: Traffic management */}
          <div className="flex flex-col items-center text-center p-4 border border-slate-100 rounded-lg bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Traffic management</h2>
            <p className="text-xs text-slate-600 max-w-sm mb-4 leading-relaxed">
              A visual tool that lets you easily create policies for multiple endpoints in complex configurations.
            </p>
            <Link
              href="/traffic-policies"
              className="px-6 py-1.5 border border-[#0972D3] text-[#0972D3] hover:bg-blue-50 font-semibold rounded-full text-xs transition-colors shadow-2xs"
            >
              Create policy
            </Link>
          </div>

          {/* Box 4: Domain registration */}
          <div className="flex flex-col items-center text-center p-4 border border-slate-100 rounded-lg bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Domain registration</h2>
            <p className="text-xs text-slate-600 max-w-sm mb-4 leading-relaxed">
              Register new domains or transfer existing domains to Amazon Route 53.
            </p>
            <Link
              href="/registered-domains"
              className="px-6 py-1.5 border border-[#0972D3] text-[#0972D3] hover:bg-blue-50 font-semibold rounded-full text-xs transition-colors shadow-2xs"
            >
              Register domain
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

