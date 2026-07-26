'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Topbar from '../../components/layout/Topbar';
import Sidebar from '../../components/layout/Sidebar';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import Footer from '../../components/layout/Footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideSidebar =
    pathname.endsWith('/edit') ||
    pathname.includes('/edit') ||
    pathname.endsWith('/new') ||
    pathname.endsWith('/create');

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0f1419] text-[#16191f] dark:text-[#eaedd5] font-sans antialiased">
      {/* Top Navbar */}
      <Topbar />

      {/* Subheader / Breadcrumb row */}
      <Breadcrumbs />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        {!hideSidebar && <Sidebar />}

        {/* Scrollable Main Console Canvas */}
        <main
          className={`flex-1 pt-20 pb-10 min-w-0 bg-white dark:bg-[#0f1419] ${
            hideSidebar ? 'pl-0' : 'pl-[240px]'
          }`}
        >
          <div className="p-6 max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>

      {/* Dark Console Footer */}
      <Footer />
    </div>
  );
}
