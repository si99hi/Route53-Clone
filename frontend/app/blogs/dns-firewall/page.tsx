'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import figure1 from '../../../public/images/figure1.jpg';
import figure2 from '../../../public/images/figure2.jpg';
import AwsLogo from '../../../components/layout/AwsLogo';

export default function DNSFirewallBlogPage() {
  // Helper for irrelevant / non-functional buttons
  const inactiveProps = {
    onClick: (e: React.MouseEvent) => e.preventDefault(),
    title: "Button disabled in demo",
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP NAV BAR (DARK)                                        */}
      {/* ------------------------------------------------------------- */}
      <header className="bg-[#19222d] text-slate-200 text-xs py-2 px-4 border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-slate-400 font-medium cursor-not-allowed select-none">AWS Documentation & Marketing</span>
          </div>

          <div className="flex items-center space-x-6">
            <button {...inactiveProps} className="flex items-center space-x-1 hover:text-white cursor-not-allowed">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>English</span>
              <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            <button {...inactiveProps} className="hover:text-white cursor-not-allowed">Contact us</button>
            <button {...inactiveProps} className="hover:text-white cursor-not-allowed">AWS Marketplace</button>

            <button {...inactiveProps} className="flex items-center space-x-1 hover:text-white cursor-not-allowed">
              <span>Support</span>
              <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            <button {...inactiveProps} className="flex items-center space-x-1 hover:text-white cursor-not-allowed">
              <span>My account</span>
              <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center cursor-not-allowed" title="Account profile">
              <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN HEADER BAR                                           */}
      {/* ------------------------------------------------------------- */}
      <nav className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
              <AwsLogo className="h-8 w-auto text-slate-900" />
            </Link>

            <span className="text-slate-300 h-5 w-[1px] bg-slate-300"></span>

            <button {...inactiveProps} className="text-sm font-medium text-slate-700 hover:text-slate-900 cursor-not-allowed">re:Invent</button>

            <span className="text-slate-300 h-5 w-[1px] bg-slate-300"></span>

            <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-700">
              <button {...inactiveProps} className="hover:text-slate-900 cursor-not-allowed">Discover AWS</button>
              <button {...inactiveProps} className="hover:text-slate-900 cursor-not-allowed">Products</button>
              <button {...inactiveProps} className="hover:text-slate-900 cursor-not-allowed">Solutions</button>
              <button {...inactiveProps} className="hover:text-slate-900 cursor-not-allowed">Pricing</button>
              <button {...inactiveProps} className="hover:text-slate-900 cursor-not-allowed">Resources</button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden lg:block">
              <input
                type="text"
                placeholder="Search"
                disabled
                className="w-48 bg-slate-100 border border-slate-300 rounded-full py-1.5 pl-8 pr-3 text-xs text-slate-500 cursor-not-allowed"
              />
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <Link href="/login" className="text-sm font-medium text-slate-800 hover:text-[#0073bb] px-3 py-1.5 rounded transition-colors">
              Sign in to console
            </Link>

            <Link href="/register" className="bg-[#19222d] hover:bg-[#232f3e] text-white text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-sm">
              Create account
            </Link>
          </div>
        </div>
      </nav>

      {/* ------------------------------------------------------------- */}
      {/* 3. AWS BLOGS SUB-BAR                                         */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-slate-50 border-b border-slate-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8 text-sm font-semibold text-slate-800">
            <span className="text-[#0073bb] font-bold text-base">AWS Blogs</span>
            <button {...inactiveProps} className="hover:text-[#0073bb] cursor-not-allowed">Home</button>
            <button {...inactiveProps} className="flex items-center space-x-1 hover:text-[#0073bb] cursor-not-allowed">
              <span>Blogs</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <button {...inactiveProps} className="flex items-center space-x-1 hover:text-[#0073bb] cursor-not-allowed">
              <span>Editions</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. MAIN ARTICLE CONTENT & SIDEBAR MATCHING SCREENSHOT #3    */}
      {/* ------------------------------------------------------------- */}
      <main className="py-10 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-start">

          {/* Article Main Body (Col 8) */}
          <article className="md:col-span-8 space-y-6">
            {/* Category Tag */}
            <div className="text-xs font-bold text-[#0073bb] uppercase tracking-wider">
              Networking & Content Delivery
            </div>

            {/* Article Heading */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Secure your Amazon VPC DNS resolution with Amazon Route 53 Resolver DNS Firewall
            </h1>

            {/* Author Metadata */}
            <div className="text-xs text-slate-600 border-b border-slate-200 pb-4 space-x-2">
              <span>by <strong className="text-slate-800">Mike Bentzen</strong> and <strong className="text-slate-800">Mahmoud Ismail</strong></span>
              <span>|</span>
              <span>on 15 APR 2021</span>
              <span>|</span>
              <span>in <span className="text-[#0073bb]">Amazon Route 53</span>, <span className="text-[#0073bb]">Networking & Content Delivery</span></span>
              <span>|</span>
              <span className="text-[#0073bb] hover:underline cursor-pointer">Permalink</span>
              <span>|</span>
              <span className="text-[#0073bb] hover:underline cursor-pointer">Share</span>
            </div>

            {/* Prose Content */}
            <div className="prose prose-slate max-w-none text-slate-700 space-y-6 text-base leading-relaxed">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">Introduction</h2>
              <p>
                There are many services that help you configure network security within your Amazon Virtual Private Cloud (VPC), including security groups (SGs), network access control lists (network ACLs), and the AWS Network Firewall. These services inspect and filter network traffic, but they do not apply to DNS queries provided by Route 53 Resolver, potentially allowing bad-actors to exfiltrate data using DNS. A DNS lookup is an integral part of outbound network communication and is typically used as a starting point for establishing outbound connectivity.
              </p>
              <p>
                Recently, we’ve launched Amazon Route 53 Resolver DNS Firewall – a service that enables customers to defend against DNS-level threats such as DNS Exfiltration. Throughout this post, we’ll refer to the Amazon Route 53 Resolver DNS Firewall as "DNS Firewall".
              </p>
              <p>
                With DNS Firewall, customers protect against data exfiltration attempts by building rules, specifying a list of domains to filter, and configuring actions for each rule to take when listed entries are queried. Customers group these rules together known as rule groups. Additionally, customers use AWS managed domain lists to easily apply rules to known bad domains.
              </p>

              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">Introduction to Amazon VPC DNS resolution</h2>
              <p>
                By default, queries that are issued within the VPC are directed towards the Route 53 Resolver service to handle the resolution, which has the VPC CIDR address +2. For example, the DNS Server on a 10.0.0.0/16 network is located at 10.0.0.2. This VPC CIDR +2 acts as a gateway endpoint to a shared resolver service represented by zonal fleets of resolver instances.
              </p>

              {/* FIGURE 1 DIAGRAM (ORIGINAL ATTACHED SS1) */}
              <div className="my-8 space-y-2">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Figure 1: Resolution of DNS queries using the Amazon Route 53 Resolver</div>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white p-3 shadow-sm flex justify-center">
                  <Image
                    src={figure1}
                    alt="Figure 1: Resolution of DNS queries using the Amazon Route 53 Resolver"
                    className="w-full max-w-2xl h-auto rounded object-contain"
                    priority
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">Concepts of DNS Firewall</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Rules</strong> – A DNS Firewall rule specifies a single domain list and action to take when the DNS domain query matches a domain in the domain list. You can allow, block, or alert on matching queries.</li>
                <li><strong>Domain List</strong> – A domain list can be reused across many rules, containing specific domains or regex entries.</li>
                <li><strong>Rule Group</strong> – A collection of rules associated with VPCs to provide unified protection.</li>
                <li><strong>Capacity Units</strong> – Each rule group includes up to 100 rules with prioritized execution.</li>
              </ul>

              {/* FIGURE 2 DIAGRAM (SCREENSHOT SS2) */}
              <div className="my-8 space-y-2">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Figure 2: Association of a DNS Firewall Rule Group to multiple VPCs</div>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white p-3 shadow-sm flex justify-center">
                  <Image
                    src={figure2}
                    alt="Figure 2: Association of a DNS Firewall Rule Group to multiple VPCs"
                    className="w-full max-w-xl h-auto rounded object-contain"
                    priority
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">Centralized Management of DNS Firewalls using AWS Firewall Manager</h2>
              <p>
                AWS Firewall Manager is a security management service that allows security administrators to centrally configure and manage firewall rules across the accounts and applications in your organization. As new applications are created, Firewall Manager makes it easy to bring new resources into compliance by enforcing a common set of security rules.
              </p>

              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">Conclusion</h2>
              <p>
                In this blog post, you learned how to secure your Amazon VPC DNS resolution with Amazon Route 53 Resolver DNS Firewall. You also learned how security administrators can use Firewall Manager to create security policies for the Amazon Route 53 Resolver DNS Firewall and push them out at scale to their organization.
              </p>

              {/* Author Bios */}
              <div className="mt-8 p-6 bg-slate-100 rounded-xl space-y-4 border border-slate-200">
                <div className="border-b border-slate-300 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">Mahmoud Ismail</h3>
                  <p className="text-xs text-slate-600">Technical Account Manager based in Melbourne, Australia specializing in Networking.</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Mike Bentzen</h3>
                  <p className="text-xs text-slate-600">Solutions Architect based out of Brisbane, Australia specializing in Networking & Cloud Infrastructure.</p>
                </div>
              </div>
            </div>
          </article>

          {/* Right Sidebar (Matching Screenshot #3) */}
          <aside className="md:col-span-4 space-y-8 bg-slate-50 p-6 border border-slate-200 rounded-xl sticky top-20 shadow-sm">
            {/* Resources Section */}
            <div className="space-y-3 border-b border-slate-200 pb-6">
              <h3 className="text-base font-bold text-slate-900">Resources</h3>
              <ul className="space-y-2 text-xs font-semibold text-[#0073bb]">
                <li><button {...inactiveProps} className="hover:underline text-left cursor-not-allowed">Networking Products</button></li>
                <li><button {...inactiveProps} className="hover:underline text-left cursor-not-allowed">Getting Started</button></li>
                <li><button {...inactiveProps} className="hover:underline text-left cursor-not-allowed">Amazon CloudFront</button></li>
              </ul>
            </div>

            {/* Follow Section with Exact Social Media Redirects */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Follow</h3>
              <ul className="space-y-3 text-xs font-medium text-slate-700">
                <li>
                  <a
                    href="https://x.com/awscloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2.5 hover:text-[#0073bb] transition-colors"
                  >
                    <span className="w-5 h-5 bg-slate-900 text-white rounded flex items-center justify-center font-bold text-[10px]">𝕏</span>
                    <span>Twitter</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/awscloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2.5 hover:text-[#0073bb] transition-colors"
                  >
                    <span className="w-5 h-5 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-xs">f</span>
                    <span>Facebook</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/company/amazon-web-services"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2.5 hover:text-[#0073bb] transition-colors"
                  >
                    <span className="w-5 h-5 bg-blue-700 text-white rounded flex items-center justify-center font-bold text-xs">in</span>
                    <span>LinkedIn</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.twitch.tv/aws"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2.5 hover:text-[#0073bb] transition-colors"
                  >
                    <span className="w-5 h-5 bg-purple-600 text-white rounded flex items-center justify-center font-bold text-xs">👾</span>
                    <span>Twitch</span>
                  </a>
                </li>
                <li>
                  <button {...inactiveProps} className="flex items-center space-x-2.5 hover:text-[#0073bb] cursor-not-allowed">
                    <span className="w-5 h-5 bg-slate-700 text-white rounded flex items-center justify-center text-xs">✉</span>
                    <span>Email Updates</span>
                  </button>
                </li>
              </ul>
            </div>
          </aside>

        </div>
      </main>

      {/* AWS Dark Footer */}
      <footer className="bg-[#111827] text-slate-300 py-12 px-4 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <h3 className="text-base font-bold text-white">Create an AWS account</h3>
            <Link href="/register" className="bg-[#ec7211] text-slate-950 font-bold px-5 py-2 rounded text-xs">Create account</Link>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <a href="https://x.com/awscloud" target="_blank" rel="noopener noreferrer" className="hover:text-white">Twitter / X</a>
            <a href="https://www.facebook.com/awscloud" target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook</a>
            <a href="https://www.linkedin.com/company/amazon-web-services" target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a>
          </div>

          <div className="text-slate-500 text-[11px]">
            &copy; 2026, Amazon Web Services, Inc. or its affiliates. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
