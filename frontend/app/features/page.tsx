'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AwsLogo from '../../components/layout/AwsLogo';

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'about-dns': true, // Open by default matching screenshot #4
    'resolver': true,
    'firewall': true,
  });

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openAll = () => {
    const allOpened: Record<string, boolean> = {};
    featureSections.forEach((sec) => {
      sec.items.forEach((item) => {
        allOpened[item.id] = true;
      });
    });
    setExpandedItems(allOpened);
  };

  const closeAll = () => {
    setExpandedItems({});
  };

  // Helper for irrelevant / non-functional buttons
  const inactiveProps = {
    onClick: (e: React.MouseEvent) => e.preventDefault(),
    title: "Button disabled in demo",
  };

  const sidebarItems = [
    { id: 'key-features', label: 'Key features', count: 19 },
    { id: 'functionality', label: 'Functionality', count: 1 },
    { id: 'about-dns', label: 'About DNS', count: 1 },
    { id: 'apis', label: 'Working with Amazon Route 53s APIs', count: 1 },
    { id: 'global-network', label: 'The Amazon Route 53 Global Network', count: 1 },
    { id: 'restrictions', label: 'Intended Usage and Restrictions', count: 1 },
  ];

  const featureSections = [
    {
      categoryId: 'key-features',
      categoryTitle: 'Key features',
      items: [
        {
          id: 'resolver',
          title: 'Route 53 Resolver',
          desc: 'Get recursive DNS for your Amazon VPCs in AWS Regions, VPCs in AWS Outposts racks, or any other on-premises networks. Create conditional forwarding rules and Route 53 endpoints to resolve custom names mastered in Amazon Route 53 private hosted zones or in your on-premises DNS servers.',
        },
        {
          id: 'outposts',
          title: 'Route 53 Resolver on Outposts endpoints',
          desc: 'Connect Route 53 Resolvers on Outpost racks with DNS servers in your on-premises data centers through Route 53 Resolver endpoints. This enables resolution of DNS queries between the Outposts racks and your other on-premises resources.',
        },
        {
          id: 'firewall',
          title: 'Route 53 Resolver DNS Firewall',
          desc: 'Protect your recursive DNS queries within the Route 53 Resolver. Create domain lists and build firewall rules that filter outbound DNS traffic against these rules.',
        },
        {
          id: 'profiles',
          title: 'Route 53 Profiles',
          desc: 'Manage one or more shareable configurations for Route 53, including private hosted zones, Route 53 Resolver DNS Firewall rule groups, and Route 53 Resolver rules, in the form of a Profile. Automatically apply such configurations across VPCs and AWS accounts, even as new resources are added or updated.',
        },
        {
          id: 'traffic-flow',
          title: 'Traffic flow',
          desc: 'Easy-to-use and cost-effective global traffic management: route end users to the best endpoint for your application based on geoproximity, latency, health, and other considerations.',
        },
        {
          id: 'geoproximity',
          title: 'Geoproximity routing',
          desc: 'Improves application responsiveness for your end users and helps apply data residency preferences by routing traffic to the geographically nearest resource.',
        },
        {
          id: 'latency',
          title: 'Latency based routing',
          desc: 'Route end users to the AWS region that provides the lowest possible latency.',
        },
        {
          id: 'ip-based',
          title: 'IP-based routing',
          desc: 'Fine-tune your DNS routing approach based on the Classless Inter-Domain Routing (CIDR) block that the query-originating IP address belongs to.',
        },
        {
          id: 'geo-dns',
          title: 'Geo DNS',
          desc: 'Route end users to a particular endpoint that you specify based on the end user’s geographic location.',
        },
        {
          id: 'private-dns',
          title: 'Private DNS for Amazon VPC',
          desc: 'Manage custom domain names for your internal AWS resources without exposing DNS data to the public Internet.',
        },
        {
          id: 'dns-failover',
          title: 'DNS Failover',
          desc: 'Automatically route your website visitors to an alternate location to avoid site outages.',
        },
        {
          id: 'health-checks',
          title: 'Health Checks and Monitoring',
          desc: 'Amazon Route 53 can monitor the health and performance of your application as well as your web servers and other resources.',
        },
        {
          id: 'domain-reg',
          title: 'Domain Registration',
          desc: 'Amazon Route 53 offers domain name registration services, where you can search for and register available domain names or transfer in existing domain names to be managed by Route 53. View a full list of supported top-level domains (TLDs) and current pricing.',
        },
        {
          id: 'dnssec',
          title: 'DNSSEC',
          desc: 'Enable DNSSEC signing for all existing and new public hosted zones, as well as DNSSEC validation for Amazon Route 53 Resolver.',
        },
        {
          id: 'cloudfront-apex',
          title: 'CloudFront Zone Apex Support',
          desc: 'Route 53 supports alias records that map your root domain directly to CloudFront distributions.',
        },
        {
          id: 's3-apex',
          title: 'S3 Zone Apex Support',
          desc: 'Visitors to your website hosted on Amazon S3 can now access your site at the zone apex (or "root domain").',
        },
        {
          id: 'elb-integration',
          title: 'Amazon ELB Integration',
          desc: 'Amazon Route 53 is integrated with Elastic Load Balancing (ELB).',
        },
        {
          id: 'console',
          title: 'Management Console',
          desc: 'Amazon Route 53 works with the AWS Management Console. This web-based, point-and-click, graphical user interface lets you manage Amazon Route 53 without writing any code at all.',
        },
        {
          id: 'wrr',
          title: 'Weighted Round Robin',
          desc: 'Amazon Route 53 offers Weighted Round Robin (WRR) functionality.',
        },
      ],
    },
    {
      categoryId: 'functionality',
      categoryTitle: 'Functionality',
      items: [
        {
          id: 'func-overview',
          title: 'Functionality Overview',
          desc: 'Amazon Route 53 has a simple web-services interface that lets you get started in minutes. Your DNS records are organized into "hosted zones" that you configure with Route 53’s API. To use Route 53, subscribe to the service, create a hosted zone, populate DNS records, and associate name servers.',
        },
      ],
    },
    {
      categoryId: 'about-dns',
      categoryTitle: 'About DNS',
      items: [
        {
          id: 'about-dns',
          title: 'Overview',
          desc: 'The Domain Name System (DNS) is a globally distributed service that is foundational to the way people use the Internet. DNS uses a hierarchical name structure, and different levels in the hierarchy are each separated with a dot ( . ). Consider the domain names www.amazon.com and aws.amazon.com. In both these examples, "com" is the Top-Level Domain and "amazon" the Second-Level Domain. There can be any number of lower levels (e.g., "www" and "aws") below the Second-Level Domain. Computers use the DNS hierarchy to translate human readable names like www.amazon.com into the IP addresses like 192.0.2.1 that computers use to connect to one another. Route 53 is an "authoritative DNS" system. An authoritative DNS system provides an update mechanism that developers use to manage their public DNS names.',
        },
      ],
    },
    {
      categoryId: 'apis',
      categoryTitle: 'Working with Amazon Route 53s APIs',
      items: [
        {
          id: 'api-overview',
          title: 'Working with Amazon Route 53s APIs Overview',
          desc: 'Amazon Route 53 provides REST APIs to programmatically create, list, update, and delete hosted zones and DNS record sets.',
        },
      ],
    },
    {
      categoryId: 'global-network',
      categoryTitle: 'The Amazon Route 53 Global Network',
      items: [
        {
          id: 'global-network-overview',
          title: 'The Amazon Route 53 Global Network Overview',
          desc: 'Route 53 uses a global network of DNS servers at locations all over the world to give you high availability and fast performance.',
        },
      ],
    },
    {
      categoryId: 'restrictions',
      categoryTitle: 'Intended Usage and Restrictions',
      items: [
        {
          id: 'restrictions-overview',
          title: 'Intended Usage and Restrictions Overview',
          desc: 'Review operational limits, maximum resource quotas, and acceptable use policies for Amazon Route 53.',
        },
      ],
    },
  ];

  const filteredSections = activeTab === 'all'
    ? featureSections
    : featureSections.filter((sec) => sec.categoryId === activeTab);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP NAV BAR (DARK)                                        */}
      {/* ------------------------------------------------------------- */}
      <header className="bg-[#19222d] text-slate-200 text-xs py-2 px-4 border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-slate-400 font-normal cursor-not-allowed select-none">AWS Documentation & Marketing</span>
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
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
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

            <button {...inactiveProps} className="text-[16px] font-normal text-slate-700 hover:text-slate-900 cursor-not-allowed">re:Invent</button>

            <span className="text-slate-300 h-5 w-[1px] bg-slate-300"></span>

            <div className="hidden md:flex items-center space-x-6 text-[16px] font-normal text-slate-700">
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

            <Link href="/login" className="text-[15px] font-medium text-slate-800 hover:text-[#0073bb] px-3 py-1.5 rounded transition-colors">
              Sign in to console
            </Link>

            <Link href="/register" className="bg-[#19222d] hover:bg-[#232f3e] text-white text-[15px] font-medium px-4 py-2 rounded-full transition-all shadow-sm">
              Create account
            </Link>
          </div>
        </div>
      </nav>

      {/* ------------------------------------------------------------- */}
      {/* 3. SUB-HEADER BAR & BREADCRUMBS                              */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-slate-50 border-b border-slate-200 py-6 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Amazon Route 53</h2>
            <div className="flex items-center space-x-6 text-[15px] font-normal text-slate-700">
              <Link href="/" className="text-slate-600 hover:text-slate-900">Overview</Link>
              <Link href="/features" className="border-b-2 border-slate-900 font-medium text-slate-900 pb-1 flex items-center space-x-1">
                <span>Features</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </Link>
              <button {...inactiveProps} className="text-slate-600 hover:text-slate-600 cursor-not-allowed">Pricing</button>
              <button {...inactiveProps} className="text-slate-600 hover:text-slate-600 cursor-not-allowed">Resources</button>
              <button {...inactiveProps} className="text-slate-600 hover:text-slate-600 cursor-not-allowed">FAQs</button>
            </div>
          </div>

          <div className="text-xs text-slate-600 flex items-center space-x-2 pt-2">
            <span {...inactiveProps}>Networking and Content Delivery</span>
            <span>&rsaquo;</span>
            <span {...inactiveProps}>Amazon Route 53</span>
            <span>&rsaquo;</span>
            <span className="font-medium text-slate-800">Features</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 pt-2 tracking-tight">
            Amazon Route 53 features
          </h1>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. MAIN FEATURES LAYOUT (SIDEBAR + CONTENT)                   */}
      {/* ------------------------------------------------------------- */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-8 items-start">

          {/* Left Sidebar Navigation */}
          <div className="md:col-span-4 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm sticky top-20">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-900 text-sm">
              Features Categories
            </div>
            <div className="divide-y divide-slate-100">
              <button
                onClick={() => setActiveTab('all')}
                className={`w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold transition-colors ${
                  activeTab === 'all' ? 'bg-[#19222d] text-white' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>All Features</span>
              </button>

              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-3.5 text-left text-xs font-medium transition-colors ${
                    activeTab === item.id ? 'bg-[#19222d] text-white font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="pr-2">{item.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    activeTab === item.id ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="md:col-span-8 space-y-8">
            {/* Top Toggle Controls */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="text-xs text-slate-500 font-medium">Showing Route 53 technical documentation & capabilities</span>
              <div className="flex items-center space-x-3 text-xs">
                <button onClick={openAll} className="text-[#0073bb] hover:underline font-medium border border-slate-300 rounded px-2.5 py-1 bg-slate-50">
                  Open all
                </button>
                <button onClick={closeAll} className="text-[#0073bb] hover:underline font-medium border border-slate-300 rounded px-2.5 py-1 bg-slate-50">
                  Close all
                </button>
              </div>
            </div>

            {/* Feature Sections */}
            <div className="space-y-10">
              {filteredSections.map((sec) => (
                <div key={sec.categoryId} className="space-y-6">
                  <h2 className="text-2xl font-semibold text-slate-900 border-b-2 border-slate-800 pb-2">
                    {sec.categoryTitle}
                  </h2>

                  <div className="space-y-4">
                    {sec.items.map((item) => {
                      const isOpen = expandedItems[item.id] ?? false;
                      return (
                        <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-900 hover:bg-slate-50 transition-colors text-base"
                          >
                            <span>{item.title}</span>
                            <span className="text-xl text-slate-500">{isOpen ? '−' : '+'}</span>
                          </button>

                          {isOpen && (
                            <div className="p-4 bg-slate-50 border-t border-slate-200 text-sm text-slate-700 leading-[1.6] space-y-3">
                              <p>{item.desc}</p>
                              <button {...inactiveProps} className="text-xs font-medium text-[#0073bb] hover:underline flex items-center cursor-not-allowed">
                                Learn more &rarr;
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. BOTTOM CTAs & FOOTER                                      */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold text-slate-900">Get started with Route 53</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 shadow-sm">
              <h3 className="font-semibold text-slate-900 text-lg">Pricing</h3>
              <p className="text-xs text-slate-600 leading-[1.5]">Learn more about Amazon Route 53 pricing and cost calculators.</p>
              <button {...inactiveProps} className="text-xs font-medium text-[#0073bb] hover:underline cursor-not-allowed">Learn more &rarr;</button>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 shadow-sm">
              <h3 className="font-semibold text-slate-900 text-lg">Getting started</h3>
              <p className="text-xs text-slate-600 leading-[1.5]">Sign up for a free account to begin managing your domains.</p>
              <Link href="/register" className="text-xs font-medium text-[#0073bb] hover:underline">Sign up for free account &rarr;</Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 shadow-sm">
              <h3 className="font-semibold text-slate-900 text-lg">Console</h3>
              <p className="text-xs text-slate-600 leading-[1.5]">Start building and managing hosted zones directly in the AWS console.</p>
              <Link href="/login" className="text-xs font-medium text-[#0073bb] hover:underline">Start building in console &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      {/* AWS Dark Footer */}
      <footer className="bg-[#111827] text-slate-300 py-12 px-4 text-xs">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <h3 className="text-base font-semibold text-white">Create an AWS account</h3>
            <Link href="/register" className="bg-[#ec7211] text-slate-950 font-medium px-5 py-2 rounded text-xs">Create account</Link>
          </div>
          <div className="text-slate-500 text-[11px]">
            &copy; 2026, Amazon Web Services, Inc. or its affiliates. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
