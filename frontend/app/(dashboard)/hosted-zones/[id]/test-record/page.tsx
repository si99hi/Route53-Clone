'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../../lib/api';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';

export default function TestRecordPage({ params }: { params: { id: string } }) {
  const zoneId = params.id;
  const router = useRouter();

  // Fetch zone details
  const { data: zone } = useQuery({
    queryKey: ['hosted-zone', zoneId],
    queryFn: () => api.getHostedZone(zoneId),
  });

  const domainName = zone?.domain_name || 'si99hi.tech';

  // Fetch records for the hosted zone
  const { data: recordsData } = useQuery({
    queryKey: ['records', zoneId],
    queryFn: () => api.getRecords(zoneId, { page: 1, page_size: 100 }),
  });

  const records = recordsData?.items || [];

  // Form state
  const [recordName, setRecordName] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [resolverIp, setResolverIp] = useState('192.0.2.25');
  const [showAdditionalConfig, setShowAdditionalConfig] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter suggestions based on input - more flexible matching
  const filteredSuggestions = records.filter((rec: any) => {
    if (rec.type !== recordType) return false;
    
    if (!recordName) return true; // Show all records of this type when input is empty
    
    const recNameLower = rec.name.toLowerCase();
    const searchNameLower = recordName.toLowerCase();
    
    // Show if record name contains search term
    if (recNameLower.includes(searchNameLower)) return true;
    
    // Show if search term matches subdomain part
    if (recNameLower === `${searchNameLower}.${domainName.toLowerCase()}`) return true;
    
    return false;
  });

  const handleGetResponse = async () => {
    setIsLoading(true);
    setResponse(null);

    // Find matching record - more flexible matching
    const searchName = recordName || domainName;
    const matchingRecord = records.find(
      (rec: any) => {
        // Check if record type matches
        if (rec.type !== recordType) return false;
        
        // Check if record name matches (exact match or with domain)
        const recNameLower = rec.name.toLowerCase();
        const searchNameLower = searchName.toLowerCase();
        
        // Exact match
        if (recNameLower === searchNameLower) return true;
        
        // If user entered subdomain, check if record has full domain
        if (recordName && recNameLower === `${recordName.toLowerCase()}.${domainName.toLowerCase()}`) return true;
        
        // If user left blank, check if record is the domain itself
        if (!recordName && recNameLower === domainName.toLowerCase()) return true;
        
        return false;
      }
    );

    setTimeout(() => {
      let mockResponse: any;
      if (matchingRecord) {
        mockResponse = {
          hostedZone: domainName,
          recordName: matchingRecord.name,
          recordType: matchingRecord.type,
          dnsResponseCode: 'No Error',
          protocol: 'UDP',
          ipAddress: matchingRecord.value,
        };
      } else {
        mockResponse = {
          hostedZone: domainName,
          recordName: searchName,
          recordType: recordType,
          dnsResponseCode: 'NXDOMAIN',
          protocol: 'UDP',
          ipAddress: 'N/A',
        };
      }
      setResponse(mockResponse);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f1419] text-[#16191F] dark:text-slate-100 font-sans pb-16">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-[#16191F] border-b border-[#D5DBDB] dark:border-slate-800 px-6 py-2 flex items-center justify-between text-xs">
        <nav className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
          <Link href="/hosted-zones" className="text-[#0972D3] dark:text-[#539fe5] hover:underline font-medium">
            Route 53
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link href="/hosted-zones" className="text-[#0972D3] dark:text-[#539fe5] hover:underline font-medium">
            Hosted zones
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link href={`/hosted-zones/${zoneId}`} className="text-[#0972D3] dark:text-[#539fe5] hover:underline font-medium">
            {domainName}
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-normal">Test record</span>
        </nav>

        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title="Info">
          <Info className="h-4 w-4" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-5 space-y-6">
        {/* Page Title */}
        <div className="flex items-baseline space-x-2">
          <h1 className="text-2xl font-bold text-[#16191F] dark:text-white tracking-tight">
            Test record
          </h1>
          <a
            href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/route-53-checking-dns.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#0972D3] dark:text-[#539fe5] hover:underline flex items-center space-x-1"
          >
            <span>Info</span>
          </a>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#16191F] border border-[#D5DBDB] dark:border-slate-800 rounded-lg p-6 shadow-2xs space-y-6">
          {/* Record Name */}
          <div>
            <div className="flex items-center space-x-1 mb-1">
              <label className="text-xs font-bold text-[#16191F] dark:text-slate-200">
                Record name - optional
              </label>
              <span className="text-xs font-semibold text-[#0972D3] dark:text-[#539fe5] hover:underline cursor-pointer">
                Info
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              To check a record that has the same name as the hosted zone {domainName}, leave this field blank. To check the record for a subdomain, enter the subdomain name excluding the domain name.
            </p>
            <div className="relative">
              <input
                type="text"
                value={recordName}
                onChange={(e) => {
                  setRecordName(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(recordName.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="www"
                className="w-full bg-white dark:bg-[#0f1419] border border-slate-400 dark:border-slate-600 rounded px-3 py-1.5 text-xs text-[#16191F] dark:text-white focus:outline-none focus:border-[#0972D3]"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#16191F] border border-slate-300 dark:border-slate-600 rounded shadow-lg z-10 max-h-60 overflow-y-auto">
                  {filteredSuggestions.map((rec: any) => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => {
                        setRecordName(rec.name);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 last:border-0"
                    >
                      <div className="font-semibold">{rec.name}</div>
                      <div className="text-slate-500 dark:text-slate-400">{rec.type} - {rec.value}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Record Type */}
          <div>
            <div className="flex items-center space-x-1 mb-1">
              <label className="text-xs font-bold text-[#16191F] dark:text-slate-200">
                Record type
              </label>
              <span className="text-xs font-semibold text-[#0972D3] dark:text-[#539fe5] hover:underline cursor-pointer">
                Info
              </span>
            </div>
            <div className="relative">
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full bg-white dark:bg-[#0f1419] border border-slate-400 dark:border-slate-600 rounded px-3 py-1.5 text-xs text-[#16191F] dark:text-white appearance-none cursor-pointer focus:outline-none focus:border-[#0972D3]"
              >
                <option value="A">A – Routes traffic to an IPv4 address and some AWS resources</option>
                <option value="AAAA">AAAA – Routes traffic to an IPv6 address and some AWS resources</option>
                <option value="CNAME">CNAME – Routes traffic to another domain name and to some AWS resources</option>
                <option value="MX">MX – Specifies mail servers</option>
                <option value="TXT">TXT – Used to verify domain ownership and for email security</option>
                <option value="NS">NS – Name server record</option>
                <option value="PTR">PTR – Reverse DNS record</option>
                <option value="SRV">SRV – Service locator record</option>
                <option value="SOA">SOA – Start of authority record</option>
                <option value="CAA">CAA – Certification Authority Authorization</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Settings to simulate DNS queries */}
          <div>
            <div className="flex items-center space-x-1 mb-1">
              <label className="text-xs font-bold text-[#16191F] dark:text-slate-200">
                Settings to simulate DNS queries - optional
              </label>
              <span className="text-xs font-semibold text-[#0972D3] dark:text-[#539fe5] hover:underline cursor-pointer">
                Info
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={resolverIp}
                onChange={(e) => setResolverIp(e.target.value)}
                placeholder="192.0.2.25"
                className="w-full bg-white dark:bg-[#0f1419] border border-slate-400 dark:border-slate-600 rounded px-3 py-1.5 text-xs text-[#16191F] dark:text-white focus:outline-none focus:border-[#0972D3]"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Resolver IP address
            </p>
          </div>

          {/* Additional Configuration */}
          <div className="border border-slate-200 dark:border-slate-800 rounded">
            <button
              type="button"
              onClick={() => setShowAdditionalConfig(!showAdditionalConfig)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-[#16191F] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span>Additional configuration</span>
              {showAdditionalConfig ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {showAdditionalConfig && (
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <p>Additional configuration options would go here.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <Link
              href={`/hosted-zones/${zoneId}`}
              className="text-xs font-bold text-[#0972D3] dark:text-[#539fe5] hover:underline"
            >
              Cancel
            </Link>
            <button
              onClick={handleGetResponse}
              disabled={isLoading}
              className="px-4 py-1.5 rounded-full bg-[#ec7211] hover:bg-[#d65f00] text-white font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Get response'}
            </button>
          </div>
        </div>

        {/* Response Section */}
        {response && (
          <div className="bg-white dark:bg-[#16191F] border border-[#D5DBDB] dark:border-slate-800 rounded-lg p-6 shadow-2xs space-y-4">
            <h2 className="text-lg font-bold text-[#16191F] dark:text-white">
              Response returned by Route 53
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Response from Route 53 based on the following options.
            </p>

            <div className="space-y-3">
              <div className="flex items-start space-x-4">
                <div className="w-40 text-xs font-bold text-[#16191F] dark:text-slate-200">
                  Hosted zone
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  {response.hostedZone}
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-40 text-xs font-bold text-[#16191F] dark:text-slate-200">
                  Record name
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  {response.recordName}
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-40 text-xs font-bold text-[#16191F] dark:text-slate-200">
                  Record type
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  {response.recordType}
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-40 text-xs font-bold text-[#16191F] dark:text-slate-200">
                  DNS response code
                </div>
                <div className="text-xs flex items-center">
                  {response.dnsResponseCode === 'NXDOMAIN' && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1 text-red-600">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94l-1.72-1.72z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={response.dnsResponseCode === 'NXDOMAIN' ? 'text-red-600 font-semibold' : 'text-slate-700 dark:text-slate-300'}>
                    {response.dnsResponseCode === 'NXDOMAIN' ? 'Non-Existent Domain' : response.dnsResponseCode}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-40 text-xs font-bold text-[#16191F] dark:text-slate-200">
                  Protocol
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  {response.protocol}
                </div>
              </div>

              <div className="flex items-start space-x-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="w-40 text-xs font-bold text-[#16191F] dark:text-slate-200">
                  Response returned by Route 53
                </div>
                <div className="text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold">
                  {response.ipAddress === 'N/A' ? '-' : response.ipAddress}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
