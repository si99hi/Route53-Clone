'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ChevronRight, PanelLeft, Info, Menu } from 'lucide-react';

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Parse pathname to generate breadcrumb links
  const pathSegments = pathname.split('/').filter(Boolean);

  const isZoneRoute = pathSegments[0] === 'hosted-zones' && pathSegments[1] && pathSegments[1] !== 'new';
  const zoneId = isZoneRoute ? pathSegments[1] : null;

  const { data: zone } = useQuery({
    queryKey: ['hosted-zone', zoneId],
    queryFn: () => (zoneId ? api.getHostedZone(zoneId) : null),
    enabled: Boolean(zoneId),
  });

  const getBreadcrumbName = (segment: string, index: number) => {
    if (segment === 'hosted-zones') return 'Hosted zones';
    if (segment === 'new') return 'Create hosted zone';
    if (segment === 'edit') return 'Edit';
    if (segment === 'records') return 'Records';
    if (segment === 'dashboard') return 'Dashboard';
    if (segment === 'traffic-policies') return 'Traffic policies';
    if (segment === 'health-checks') return 'Health checks';
    if (segment === 'resolver') return 'Resolver';
    if (segment === 'profiles') return 'Profiles';
    if (segment === 'global-resolvers') return 'Global resolvers';
    if (segment === 'shared-dns-views') return 'Shared DNS views';
    if (segment === 'vpcs') return 'VPCs';
    if (segment === 'inbound-endpoints') return 'Inbound endpoints';
    if (segment === 'outbound-endpoints') return 'Outbound endpoints';
    if (segment === 'rules') return 'Rules';
    if (segment === 'query-logging') return 'Query logging';
    if (segment === 'outposts') return 'Outposts';
    if (segment === 'registered-domains') return 'Registered domains';

    if (segment === zoneId) {
      return zone?.domain_name || segment;
    }

    if (segment.length === 36 && segment.includes('-')) {
      if (index === 1) return zone?.domain_name || 'Zone details';
      return 'Record details';
    }

    return segment;
  };

  return (
    <div className="h-10 bg-white border-b border-[#D5DBDB] px-4 flex items-center justify-between fixed top-10 left-0 right-0 z-40 select-none text-sm font-sans">
      {/* Left side: Blue menu icon & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        {/* Blue Circle Hamburger Icon */}
        <button
          className="h-7 w-7 rounded-full bg-[#0972D3] hover:bg-[#005293] text-white flex items-center justify-center transition-colors shadow-2xs"
          title="Toggle Navigation Sidebar"
        >
          <Menu className="h-4 w-4" strokeWidth={2} />
        </button>

        {/* Breadcrumb Links */}
        <nav className="flex items-center space-x-2 text-sm">
          <Link href="/hosted-zones" className="text-[#0972D3] hover:underline font-medium">
            Route 53
          </Link>

          {pathSegments.map((segment, index) => {
            const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
            const name = getBreadcrumbName(segment, index);
            const isLast = index === pathSegments.length - 1;

            return (
              <React.Fragment key={url}>
                <ChevronRight className="h-4 w-4 text-[#687078]" strokeWidth={1.5} />
                {isLast ? (
                  <span className="text-[#16191F] font-semibold truncate max-w-[280px]">
                    {name}
                  </span>
                ) : (
                  <Link href={url} className="text-[#0972D3] hover:underline font-medium">
                    {name}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right side: Split window & info icons */}
      <div className="flex items-center space-x-3 text-[#414D5C]">
        <button className="p-1 hover:text-[#16191F] rounded hover:bg-[#F7F8FA] transition-colors" title="Split Panel View">
          <PanelLeft className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button className="p-1 hover:text-[#16191F] rounded hover:bg-[#F7F8FA] transition-colors" title="Information">
          <Info className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
