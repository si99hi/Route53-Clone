'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col space-y-4">
      {/* Title */}
      <h1 className="text-2xl font-bold text-[#16191f] tracking-tight">{title}</h1>

      {/* Card container */}
      <div className="bg-white border border-slate-300 rounded-md p-10 flex flex-col items-center justify-center text-center shadow-2xs min-h-[360px]">
        <div className="text-4xl mb-3">🚧</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Coming Soon</h2>
        <p className="text-xs text-slate-600 max-w-md mb-6 leading-relaxed">
          {description || 'This section is outside the scope of this Route53 Clone.'}
        </p>

        <Link
          href="/hosted-zones"
          className="inline-flex items-center space-x-1.5 px-5 py-2 bg-[#0972D3] hover:bg-[#005293] text-white font-medium text-xs rounded-full transition-colors shadow-2xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>Go to Hosted zones</span>
        </Link>
      </div>
    </div>
  );
}

