import React from 'react';
import Topbar from '../../components/layout/Topbar';
import Sidebar from '../../components/layout/Sidebar';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import Footer from '../../components/layout/Footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#16191f] font-sans antialiased">
      {/* Top Navbar */}
      <Topbar />

      {/* Subheader / Breadcrumb row */}
      <Breadcrumbs />

      <div className="flex flex-1">
        {/* Left Sidebar (300px) */}
        <Sidebar />

        {/* Scrollable Main Console Canvas */}
        <main className="flex-1 pl-[300px] pt-20 pb-10 min-w-0 bg-white">
          <div className="p-6 max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>

      {/* Dark Console Footer */}
      <Footer />
    </div>
  );
}
