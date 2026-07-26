'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AwsLogo from '../components/layout/AwsLogo';

export default function LandingPage() {
  const [openBenefit, setOpenBenefit] = useState<number | null>(null);
  const [openUseCase, setOpenUseCase] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleBenefit = (index: number) => {
    setOpenBenefit(openBenefit === index ? null : index);
  };

  const toggleUseCase = (index: number) => {
    setOpenUseCase(openUseCase === index ? null : index);
  };

  // Helper for irrelevant / non-functional buttons
  const inactiveProps = {
    onClick: (e: React.MouseEvent) => e.preventDefault(),
    title: "Button disabled in demo",
  };

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
            {/* AWS Logo */}
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
            {/* Search Input (Disabled) */}
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

            {/* ACTION REDIRECT BUTTON: Sign in to console */}
            <Link
              href="/login"
              className="text-[15px] font-medium text-slate-800 hover:text-[#0073bb] px-3 py-1.5 rounded transition-colors"
            >
              Sign in to console
            </Link>

            {/* ACTION REDIRECT BUTTON: Create account */}
            <Link
              href="/register"
              className="bg-[#19222d] hover:bg-[#232f3e] text-white text-[15px] font-medium px-4 py-2 rounded-full transition-all shadow-sm"
            >
              Create account
            </Link>
          </div>
        </div>
      </nav>

      {/* ------------------------------------------------------------- */}
      {/* 3. HERO & SUB-HEADER SECTION                                 */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-[#ebf5ff] pt-6 pb-16 px-4">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Sub-navigation Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">Amazon Route 53</h2>
            <div className="flex items-center space-x-6 text-[15px] font-normal text-slate-700">
              <Link href="/" className="border-b-2 border-slate-900 font-medium text-slate-900 pb-1">Overview</Link>
              {/* Features Link to /features */}
              <Link href="/features" className="flex items-center space-x-1 text-slate-600 hover:text-[#0073bb]">
                <span>Features</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </Link>
              <button {...inactiveProps} className="text-slate-600 hover:text-slate-600 cursor-not-allowed">Pricing</button>
              <button {...inactiveProps} className="text-slate-600 hover:text-slate-600 cursor-not-allowed">Resources</button>
              <button {...inactiveProps} className="text-slate-600 hover:text-slate-600 cursor-not-allowed">FAQs</button>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="text-xs text-slate-600 flex items-center space-x-2 pt-2">
            <span className="hover:underline cursor-not-allowed" {...inactiveProps}>Products</span>
            <span>&rsaquo;</span>
            <span className="hover:underline cursor-not-allowed" {...inactiveProps}>Networking and Content Delivery</span>
            <span>&rsaquo;</span>
            <span className="font-normal text-slate-800">Amazon Route 53</span>
          </div>

          {/* Main Hero Banner with Refined Typography */}
          <div className="py-8 max-w-4xl space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-bold text-slate-900 tracking-[-0.02em] leading-[1.1]">
              Amazon Route 53 - DNS service
            </h1>
            <p className="text-[22px] font-normal text-slate-700 leading-[1.48]">
              A reliable and cost-effective way to route end users to Internet applications
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              {/* ACTION REDIRECT BUTTON: Get started with Route 53 */}
              <Link
                href="/register"
                className="bg-[#19222d] hover:bg-[#232f3e] text-white text-[15px] font-medium px-6 py-3 rounded-full transition-all shadow-sm"
              >
                Get started with Route 53
              </Link>

              {/* UNCLICKABLE BUTTON: Connect with an expert */}
              <button
                {...inactiveProps}
                className="bg-white border border-slate-400 text-slate-800 text-[15px] font-medium px-6 py-3 rounded-full cursor-not-allowed opacity-75 hover:bg-white"
              >
                Connect with an expert
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. BENEFITS OF ROUTE 53 (LEFT HEADING, RIGHT ITEMS)          */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 px-4 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-start">
          {/* Left Column: Section Heading */}
          <div className="md:col-span-5">
            <h2 className="text-3xl sm:text-[34px] font-bold text-slate-900 leading-snug">
              Benefits of Route 53
            </h2>
          </div>

          {/* Right Column: Benefits List matching screenshot #1 */}
          <div className="md:col-span-7 space-y-6">
            <div className="border-b border-slate-200 pb-6">
              <button
                onClick={() => toggleBenefit(0)}
                className="w-full flex items-start justify-between text-left group"
              >
                <span className="text-lg sm:text-[19px] font-semibold text-slate-900 leading-snug group-hover:text-[#0073bb] transition-colors pr-4">
                  Route end users to your site reliably with globally-dispersed Domain Name System (DNS) servers and automatic scaling.
                </span>
                <span className="text-2xl text-slate-500 font-light shrink-0 mt-0.5">{openBenefit === 0 ? '−' : '+'}</span>
              </button>
              {openBenefit === 0 && (
                <p className="mt-3 text-base text-slate-600 leading-[1.6]">
                  Route 53 uses an anycast network of DNS servers around the world to ensure your users get fast, redundant, and highly available DNS resolution.
                </p>
              )}
            </div>

            <div className="border-b border-slate-200 pb-6">
              <button
                onClick={() => toggleBenefit(1)}
                className="w-full flex items-start justify-between text-left group"
              >
                <span className="text-lg sm:text-[19px] font-semibold text-[#0073bb] leading-snug group-hover:text-[#0073bb] transition-colors pr-4">
                  Set up your DNS routing in minutes with domain name registration and straightforward visual traffic flow tools.
                </span>
                <span className="text-2xl text-slate-500 font-light shrink-0 mt-0.5">{openBenefit === 1 ? '−' : '+'}</span>
              </button>
              {openBenefit === 1 && (
                <p className="mt-3 text-base text-slate-600 leading-[1.6]">
                  Easily register domain names directly inside AWS and manage routing policies with a visual Traffic Flow policy builder.
                </p>
              )}
            </div>

            <div className="pb-2">
              <button
                onClick={() => toggleBenefit(2)}
                className="w-full flex items-start justify-between text-left group"
              >
                <span className="text-lg sm:text-[19px] font-semibold text-slate-900 leading-snug group-hover:text-[#0073bb] transition-colors pr-4">
                  Customize your DNS routing policies to reduce latency, improve application availability, and maintain compliance.
                </span>
                <span className="text-2xl text-slate-500 font-light shrink-0 mt-0.5">{openBenefit === 2 ? '−' : '+'}</span>
              </button>
              {openBenefit === 2 && (
                <p className="mt-3 text-base text-slate-600 leading-[1.6]">
                  Configure weighted, latency-based, geolocation, geoproximity, and failover routing to match your application logic.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. HOW IT WORKS SECTION (LEFT HEADING, RIGHT CONTENT)         */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 px-4 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-start">
          {/* Left Column: Section Heading */}
          <div className="md:col-span-5">
            <h2 className="text-3xl sm:text-[34px] font-bold text-slate-900 leading-snug">
              How it works
            </h2>
          </div>

          {/* Right Column: Paragraph Content matching screenshot #2 */}
          <div className="md:col-span-7 space-y-6 text-base text-slate-700 leading-[1.6]">
            <p>
              Amazon Route 53 provides highly available and scalable Domain Name System (DNS), domain name registration, and health-checking web services. It is designed to give developers and businesses an extremely reliable and cost-effective way to route end users to Internet applications by translating names like example.com into the numeric IP addresses like 192.0.2.1 that computers use to connect to each other. You can use Amazon Route 53 to perform three main functions: domain registration, DNS routing, and health checking.
            </p>

            <p>
              Route 53 effectively connects user requests to infrastructure running in AWS – such as{' '}
              <span className="text-[#0073bb] hover:underline cursor-not-allowed" {...inactiveProps}>Amazon EC2</span> instances,{' '}
              <span className="text-[#0073bb] hover:underline cursor-not-allowed" {...inactiveProps}>Elastic Load Balancing</span> load balancers, or{' '}
              <span className="text-[#0073bb] hover:underline cursor-not-allowed" {...inactiveProps}>Amazon S3</span> buckets – and can also be used to route users to infrastructure outside of AWS. You can use Amazon Route 53 to configure DNS health checks to route traffic to healthy endpoints or to independently monitor the health of your application and its endpoints.
            </p>

            <p>
              In addition,{' '}
              <span className="text-[#0073bb] hover:underline cursor-not-allowed" {...inactiveProps}>Route 53 Resolver</span> provides a regional DNS service that performs recursive DNS lookups for names hosted in Amazon Elastic Compute Cloud (EC2), as well as public names on the internet. Lastly, the{' '}
              <span className="text-[#0073bb] hover:underline cursor-not-allowed" {...inactiveProps}>Route 53 Resolver DNS Firewall</span> allows you to block queries made for known or suspected malicious domains, and to allow queries for trusted domains when using the Route 53 Resolver for recursive DNS resolution.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. USE CASES SECTION (LEFT HEADING, RIGHT ACCORDIONS)        */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 px-4 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-start">
          {/* Left Column: Section Heading */}
          <div className="md:col-span-5">
            <h2 className="text-3xl sm:text-[34px] font-bold text-slate-900 leading-snug">
              Use cases
            </h2>
          </div>

          {/* Right Column: Accordion Use Cases List matching screenshot #1 */}
          <div className="md:col-span-7 space-y-4">
            {/* Accordion Item 1 */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleUseCase(0)}
                className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-900 hover:bg-slate-50 transition-colors text-lg"
              >
                <span>Automate DNS configuration</span>
                <span className="text-xl text-slate-500 font-light">{openUseCase === 0 ? '−' : '+'}</span>
              </button>
              {openUseCase === 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-base text-slate-700 leading-[1.6]">
                  Use the Route 53 API or AWS SDKs to automatically create hosted zones, update DNS records, and integrate DNS management directly into your deployment pipelines.
                </div>
              )}
            </div>

            {/* Accordion Item 2 */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleUseCase(1)}
                className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-900 hover:bg-slate-50 transition-colors text-lg"
              >
                <span>Customize DNS routing based on your business rules</span>
                <span className="text-xl text-slate-500 font-light">{openUseCase === 1 ? '−' : '+'}</span>
              </button>
              {openUseCase === 1 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-base text-slate-700 leading-[1.6]">
                  Tailor DNS routing for low latency, geographic compliance, or active-passive disaster recovery using Route 53’s suite of intelligent routing policies.
                </div>
              )}
            </div>

            {/* Accordion Item 3 */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleUseCase(2)}
                className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-900 hover:bg-slate-50 transition-colors text-lg"
              >
                <span>Scale your DNS alongside your web applications</span>
                <span className="text-xl text-slate-500 font-light">{openUseCase === 2 ? '−' : '+'}</span>
              </button>
              {openUseCase === 2 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-base text-slate-700 leading-[1.6]">
                  Handle millions of queries per second automatically without provisioning or managing underlying DNS infrastructure.
                </div>
              )}
            </div>

            {/* Accordion Item 4 */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleUseCase(3)}
                className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-900 hover:bg-slate-50 transition-colors text-lg"
              >
                <span>Centralize VPC DNS management across your organization</span>
                <span className="text-xl text-slate-500 font-light">{openUseCase === 3 ? '−' : '+'}</span>
              </button>
              {openUseCase === 3 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-base text-slate-700 leading-[1.6]">
                  Manage private hosted zones and share Resolver rules across multiple VPCs and AWS accounts using AWS RAM and Route 53 Profiles.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. GET STARTED / FEATURED CARDS SECTION                        */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 px-4 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-slate-900">Get started with Route 53</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1: Read more about Amazon Route 53 -> REDIRECTS TO /features */}
            <Link
              href="/features"
              className="relative overflow-hidden rounded-xl bg-[#0073bb] text-white p-8 min-h-[260px] flex flex-col justify-between shadow-md hover:bg-[#005f9e] transition-colors group"
            >
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider font-semibold text-blue-200">Featured</p>
                <h3 className="text-xl font-semibold leading-snug text-white">
                  Read more about Amazon Route 53 features and technical capabilities
                </h3>
              </div>
              <div className="pt-4 flex items-center space-x-2 text-sm font-medium text-white">
                <span>Learn more</span>
                <span className="text-xl transition-transform group-hover:translate-x-1">&rarr;</span>
              </div>
            </Link>

            {/* Card 2: Secure your Amazon VPC DNS resolution -> REDIRECTS TO /blogs/dns-firewall */}
            <Link
              href="/blogs/dns-firewall"
              className="relative overflow-hidden rounded-xl bg-slate-900 text-white p-8 min-h-[260px] flex flex-col justify-between shadow-md hover:bg-slate-800 transition-colors group"
            >
              <div className="space-y-3">
                <h3 className="text-xl font-semibold leading-snug text-white group-hover:text-amber-400 transition-colors">
                  Secure your Amazon VPC DNS resolution with Amazon Route 53 Resolver DNS Firewall
                </h3>
              </div>
              <div className="pt-4 flex items-center space-x-2 text-sm font-medium text-amber-400">
                <span>Read blog post</span>
                <span className="text-xl transition-transform group-hover:translate-x-1">&rarr;</span>
              </div>
            </Link>

            {/* Card 3: Contact us / Connect with an expert */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#991b1b] to-[#450a0a] text-white p-8 min-h-[260px] flex flex-col justify-between shadow-md">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold leading-snug text-white">
                  Connect with an AWS cloud networking expert for personalized guidance
                </h3>
              </div>
              <div className="pt-4 flex items-center justify-between text-slate-300 text-xs">
                <span className="font-medium cursor-not-allowed opacity-75" {...inactiveProps}>Contact sales &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. AWS FOOTER                                                */}
      {/* ------------------------------------------------------------- */}
      <footer className="bg-[#111827] text-slate-300 py-12 px-4 text-xs">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">Create an AWS account</h3>
              <p className="text-slate-400">Get started managing hosted zones and DNS routing in minutes.</p>
            </div>
            <Link
              href="/register"
              className="bg-[#ec7211] hover:bg-[#d9650c] text-slate-950 font-medium px-5 py-2.5 rounded text-sm transition-all"
            >
              Create account
            </Link>
          </div>

          {/* Footer Navigation Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-400">
            <div className="space-y-2">
              <h4 className="text-white font-medium text-sm">Learn About AWS</h4>
              <ul className="space-y-1">
                <li><button {...inactiveProps} className="hover:text-white cursor-not-allowed">What Is Cloud Computing?</button></li>
                <li><button {...inactiveProps} className="hover:text-white cursor-not-allowed">AWS Cloud Security</button></li>
                <li><button {...inactiveProps} className="hover:text-white cursor-not-allowed">What's New</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-medium text-sm">Resources</h4>
              <ul className="space-y-1">
                <li><button {...inactiveProps} className="hover:text-white cursor-not-allowed">Getting Started</button></li>
                <li><button {...inactiveProps} className="hover:text-white cursor-not-allowed">AWS Documentation</button></li>
                <li><button {...inactiveProps} className="hover:text-white cursor-not-allowed">Architecture Center</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-medium text-sm">Developers</h4>
              <ul className="space-y-1">
                <li><button {...inactiveProps} className="hover:text-white cursor-not-allowed">SDKs & Tools</button></li>
                <li><button {...inactiveProps} className="hover:text-white cursor-not-allowed">Python on AWS</button></li>
                <li><button {...inactiveProps} className="hover:text-white cursor-not-allowed">Node.js on AWS</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-medium text-sm">Help</h4>
              <ul className="space-y-1">
                <li><button {...inactiveProps} className="hover:text-white cursor-not-allowed">Contact Us</button></li>
                <li><button {...inactiveProps} className="hover:text-white cursor-not-allowed">AWS Support</button></li>
                <li><button {...inactiveProps} className="hover:text-white cursor-not-allowed">Knowledge Center</button></li>
              </ul>
            </div>
          </div>

          {/* Social Icons & Language Bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-6 text-slate-400 font-normal">
              <a href="https://x.com/awscloud" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter (𝕏)</a>
              <a href="https://www.facebook.com/awscloud" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a>
              <a href="https://www.linkedin.com/company/amazon-web-services" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="https://www.twitch.tv/aws" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitch</a>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <span>Back to top</span>
              <span>&uarr;</span>
            </button>
          </div>

          {/* Legal / Copyright */}
          <div className="text-slate-500 text-[11px] pt-4 flex flex-col sm:flex-row justify-between gap-2 border-t border-slate-800/60">
            <div>
              Amazon is an Equal Opportunity Employer: Minority / Women / Disability / Veteran / Gender Identity / Sexual Orientation / Age.
            </div>
            <div>
              &copy; 2026, Amazon Web Services, Inc. or its affiliates. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
