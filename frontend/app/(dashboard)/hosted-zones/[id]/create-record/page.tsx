'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../../lib/api';
import { RecordType } from '../../../../../lib/types';
import { useToast } from '../../../../../hooks/useToast';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  RotateCw,
  Search,
  ChevronLeft,
  Settings,
} from 'lucide-react';

interface RecordFormItem {
  id: string;
  name: string;
  type: RecordType;
  value: string;
  ttl: number;
  routingPolicy: string;
  isAlias: boolean;
}

export default function CreateRecordPage({ params }: { params: { id: string } }) {
  const zoneId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Fetch zone details
  const { data: zone } = useQuery({
    queryKey: ['hosted-zone', zoneId],
    queryFn: () => api.getHostedZone(zoneId),
  });

  // Fetch existing records for zone
  const { data: recordsData } = useQuery({
    queryKey: ['records', zoneId],
    queryFn: () =>
      api.getRecords(zoneId, {
        page: 1,
        page_size: 100,
      }),
  });

  const domainName = zone?.domain_name || 'si99hi.tech';
  const existingRecords = recordsData?.items || [];

  // Form State for multiple record creation
  const [recordForms, setRecordForms] = useState<RecordFormItem[]>([
    {
      id: 'rec-1',
      name: '',
      type: 'A',
      value: '',
      ttl: 300,
      routingPolicy: 'Simple routing',
      isAlias: false,
    },
  ]);

  const [isViewExistingOpen, setIsViewExistingOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter state for existing records table
  const [existingSearch, setExistingSearch] = useState('');
  const [existingTypeFilter, setExistingTypeFilter] = useState('all');

  const addAnotherRecord = () => {
    setRecordForms((prev) => [
      ...prev,
      {
        id: `rec-${prev.length + 1}`,
        name: '',
        type: 'A',
        value: '',
        ttl: 300,
        routingPolicy: 'Simple routing',
        isAlias: false,
      },
    ]);
  };

  const removeRecordForm = (id: string) => {
    if (recordForms.length === 1) return;
    setRecordForms((prev) => prev.filter((item) => item.id !== id));
  };

  const updateRecordForm = (id: string, field: keyof RecordFormItem, value: any) => {
    setRecordForms((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleCreateRecords = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      for (const form of recordForms) {
        if (!form.value.trim()) {
          throw new Error(`Record value cannot be empty.`);
        }

        // Construct record payload
        let recordName = form.name.trim();
        if (recordName && !recordName.endsWith(`.${domainName}`)) {
          recordName = `${recordName}.${domainName}`;
        } else if (!recordName) {
          recordName = domainName;
        }

        await api.createRecord(zoneId, {
          name: recordName,
          type: form.type,
          value: form.value.trim(),
          ttl: Number(form.ttl) || 300,
          alias: form.isAlias,
          routing_policy: form.routingPolicy,
        });
      }

      toast.success(
        recordForms.length > 1
          ? `${recordForms.length} DNS records created successfully!`
          : `DNS record created successfully!`
      );

      queryClient.invalidateQueries({ queryKey: ['records', zoneId] });
      queryClient.invalidateQueries({ queryKey: ['hosted-zone', zoneId] });

      router.push(`/hosted-zones/${zoneId}`);
    } catch (err: any) {
      setErrorMessage(err.detail || err.message || 'Failed to create records.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExistingRecords = existingRecords.filter((rec) => {
    const matchesSearch =
      rec.name.toLowerCase().includes(existingSearch.toLowerCase()) ||
      rec.value.toLowerCase().includes(existingSearch.toLowerCase());
    const matchesType =
      existingTypeFilter === 'all' || rec.type.toUpperCase() === existingTypeFilter.toUpperCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f1419] text-[#16191F] dark:text-slate-100 font-sans pb-16">
      {/* 1. Breadcrumbs */}
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
          <span className="text-slate-800 dark:text-slate-200 font-normal">Create record</span>
        </nav>

        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title="Info">
          <Info className="h-4 w-4" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-5 space-y-6">
        {/* 2. Page Title */}
        <div className="flex items-baseline space-x-2">
          <h1 className="text-2xl font-bold text-[#16191F] dark:text-white tracking-tight">
            Create record
          </h1>
          <a
            href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-creating.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#0972D3] dark:text-[#539fe5] hover:underline flex items-center space-x-1"
          >
            <span>Info</span>
          </a>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
            <span className="font-bold">Error:</span> {errorMessage}
          </div>
        )}

        {/* 3. Card 1: Quick create record */}
        <div className="bg-white dark:bg-[#16191F] border border-[#D5DBDB] dark:border-slate-800 rounded-lg p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-[#16191F] dark:text-white">
              Quick create record
            </h2>
            <button
              onClick={() => toast.info('Wizard mode coming soon!')}
              className="text-xs font-bold text-[#0972D3] dark:text-[#539fe5] hover:underline cursor-pointer"
            >
              Switch to wizard
            </button>
          </div>

          {/* Form blocks for each record */}
          {recordForms.map((form, index) => (
            <div
              key={form.id}
              className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-800 last:border-0 last:pb-0"
            >
              {/* Accordion header line */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="font-bold text-sm text-[#16191F] dark:text-white">
                    Record {index + 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeRecordForm(form.id)}
                  disabled={recordForms.length === 1}
                  className={`px-3 py-1 text-xs rounded-full border border-slate-300 dark:border-slate-700 font-semibold transition-colors ${
                    recordForms.length === 1
                      ? 'text-slate-400 bg-slate-100 dark:bg-slate-800/40 cursor-not-allowed border-transparent'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                  }`}
                >
                  Delete
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Record Name */}
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <label className="text-xs font-bold text-[#16191F] dark:text-slate-200">
                      Record name
                    </label>
                    <span className="text-xs font-semibold text-[#0972D3] dark:text-[#539fe5] hover:underline cursor-pointer">
                      Info
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateRecordForm(form.id, 'name', e.target.value)}
                      placeholder="subdomain"
                      className="w-full bg-white dark:bg-[#0f1419] border border-slate-400 dark:border-slate-600 rounded px-3 py-1.5 text-xs text-[#16191F] dark:text-white italic placeholder:not-italic placeholder-slate-400 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {domainName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Keep blank to create a record for the root domain.
                  </p>
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
                      value={form.type}
                      onChange={(e) =>
                        updateRecordForm(form.id, 'type', e.target.value as RecordType)
                      }
                      className="w-full bg-white dark:bg-[#0f1419] border border-slate-400 dark:border-slate-600 rounded px-3 py-1.5 text-xs text-[#16191F] dark:text-white appearance-none cursor-pointer focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
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

                {/* Alias Toggle */}
                <div className="md:col-span-2 flex items-center space-x-3 pt-1">
                  <button
                    type="button"
                    onClick={() => updateRecordForm(form.id, 'isAlias', !form.isAlias)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      form.isAlias ? 'bg-[#0972D3]' : 'bg-slate-400 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                        form.isAlias ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-[#16191F] dark:text-white">
                    Alias
                  </span>
                </div>

                {/* Value Textarea */}
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-1 mb-1">
                    <label className="text-xs font-bold text-[#16191F] dark:text-slate-200">
                      Value
                    </label>
                    <span className="text-xs font-semibold text-[#0972D3] dark:text-[#539fe5] hover:underline cursor-pointer">
                      Info
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={form.value}
                    onChange={(e) => updateRecordForm(form.id, 'value', e.target.value)}
                    placeholder="192.0.2.235"
                    className="w-full bg-white dark:bg-[#0f1419] border border-slate-400 dark:border-slate-600 rounded p-3 text-xs text-[#16191F] dark:text-white placeholder:text-slate-400 font-mono focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Enter multiple values on separate lines.
                  </p>
                </div>

                {/* TTL (seconds) */}
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <label className="text-xs font-bold text-[#16191F] dark:text-slate-200">
                      TTL (seconds)
                    </label>
                    <span className="text-xs font-semibold text-[#0972D3] dark:text-[#539fe5] hover:underline cursor-pointer">
                      Info
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={form.ttl}
                      onChange={(e) =>
                        updateRecordForm(form.id, 'ttl', Number(e.target.value) || 0)
                      }
                      className="w-full bg-white dark:bg-[#0f1419] border border-slate-400 dark:border-slate-600 rounded px-3 py-1.5 text-xs text-[#16191F] dark:text-white focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
                    />
                    <button
                      type="button"
                      onClick={() => updateRecordForm(form.id, 'ttl', 60)}
                      className="px-3 py-1 rounded-full border-2 border-[#0972D3] dark:border-[#539fe5] text-[#0972D3] dark:text-[#539fe5] text-xs font-bold hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      1m
                    </button>
                    <button
                      type="button"
                      onClick={() => updateRecordForm(form.id, 'ttl', 3600)}
                      className="px-3 py-1 rounded-full border-2 border-[#0972D3] dark:border-[#539fe5] text-[#0972D3] dark:text-[#539fe5] text-xs font-bold hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      1h
                    </button>
                    <button
                      type="button"
                      onClick={() => updateRecordForm(form.id, 'ttl', 86400)}
                      className="px-3 py-1 rounded-full border-2 border-[#0972D3] dark:border-[#539fe5] text-[#0972D3] dark:text-[#539fe5] text-xs font-bold hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      1d
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Recommended values: 60 to 172800 (two days)
                  </p>
                </div>

                {/* Routing Policy */}
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <label className="text-xs font-bold text-[#16191F] dark:text-slate-200">
                      Routing policy
                    </label>
                    <span className="text-xs font-semibold text-[#0972D3] dark:text-[#539fe5] hover:underline cursor-pointer">
                      Info
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      value={form.routingPolicy}
                      onChange={(e) =>
                        updateRecordForm(form.id, 'routingPolicy', e.target.value)
                      }
                      className="w-full bg-white dark:bg-[#0f1419] border border-slate-400 dark:border-slate-600 rounded px-3 py-1.5 text-xs text-[#16191F] dark:text-white appearance-none cursor-pointer focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
                    >
                      <option value="Simple routing">Simple routing</option>
                      <option value="Weighted">Weighted</option>
                      <option value="Geolocation">Geolocation</option>
                      <option value="Latency">Latency</option>
                      <option value="Failover">Failover</option>
                      <option value="Multivalue answer">Multivalue answer</option>
                      <option value="IP-based">IP-based</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Another Record button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={addAnotherRecord}
              className="px-4 py-1.5 rounded-full border-2 border-[#0972D3] dark:border-[#539fe5] text-[#0972D3] dark:text-[#539fe5] font-bold text-xs hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Add another record
            </button>
          </div>
        </div>

        {/* 4. Action Buttons (Cancel / Create records) */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href={`/hosted-zones/${zoneId}`}
            className="text-xs font-bold text-[#0972D3] dark:text-[#539fe5] hover:underline"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleCreateRecords}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-full bg-[#ec7211] hover:bg-[#eb5f07] text-[#16191f] font-bold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create records'}
          </button>
        </div>

        {/* 5. View existing records Section */}
        <div className="space-y-3 pt-4">
          <div
            onClick={() => setIsViewExistingOpen(!isViewExistingOpen)}
            className="flex items-center space-x-2 cursor-pointer text-[#16191F] dark:text-white"
          >
            {isViewExistingOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <h2 className="text-base font-bold">View existing records</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            The following table lists the existing records in {domainName}.
          </p>

          {isViewExistingOpen && (
            <div className="bg-white dark:bg-[#16191F] border border-[#D5DBDB] dark:border-slate-800 rounded-lg p-6 shadow-2xs space-y-4">
              <div className="flex items-baseline space-x-2">
                <h3 className="text-sm font-bold text-[#16191F] dark:text-white">
                  Existing records ({filteredExistingRecords.length})
                </h3>
                <span className="text-xs font-semibold text-[#0972D3] dark:text-[#539fe5] hover:underline cursor-pointer">
                  Info
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatic mode is the current search behavior optimized for best filter results.{' '}
                <span className="text-[#0972D3] dark:text-[#539fe5] underline cursor-pointer">
                  To change modes go to settings.
                </span>
              </p>

              {/* Filter toolbar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[260px]">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={existingSearch}
                    onChange={(e) => setExistingSearch(e.target.value)}
                    placeholder="Filter records by property or value"
                    className="w-full bg-white dark:bg-[#0f1419] border border-slate-400 dark:border-slate-600 rounded px-3 py-1.5 pl-9 text-xs text-[#16191F] dark:text-white italic focus:outline-none focus:border-[#0972D3]"
                  />
                </div>

                <div className="relative min-w-[100px]">
                  <select
                    value={existingTypeFilter}
                    onChange={(e) => setExistingTypeFilter(e.target.value)}
                    className="w-full bg-white dark:bg-[#0f1419] border border-slate-400 dark:border-slate-600 rounded px-3 py-1.5 text-xs text-[#16191F] dark:text-white appearance-none cursor-pointer focus:outline-none"
                  >
                    <option value="all">Type</option>
                    <option value="A">A</option>
                    <option value="AAAA">AAAA</option>
                    <option value="CNAME">CNAME</option>
                    <option value="NS">NS</option>
                    <option value="SOA">SOA</option>
                    <option value="TXT">TXT</option>
                    <option value="MX">MX</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>

                <button className="px-3 py-1.5 rounded border border-slate-400 dark:border-slate-600 bg-white dark:bg-[#0f1419] text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center space-x-1">
                  <span>Routing p...</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                <button className="px-3 py-1.5 rounded border border-slate-400 dark:border-slate-600 bg-white dark:bg-[#0f1419] text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center space-x-1">
                  <span>Alias</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                <div className="flex items-center space-x-2 text-xs text-slate-500 ml-auto">
                  <span>&lt; 1 &gt;</span>
                  <Settings className="h-4 w-4 text-slate-500 cursor-pointer" />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8f9fa] dark:bg-[#1c212a] border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3 w-8">
                        <input type="checkbox" className="rounded border-slate-300" disabled />
                      </th>
                      <th className="p-3">Record name ▼</th>
                      <th className="p-3">Type ▼</th>
                      <th className="p-3">Routing ▼</th>
                      <th className="p-3">Differentiator ▼</th>
                      <th className="p-3">Alias ▼</th>
                      <th className="p-3">Value/Route traffic to ▼</th>
                      <th className="p-3">TTL (s) ▼</th>
                      <th className="p-3">Health ▼</th>
                      <th className="p-3">Evaluate ▼</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                    {filteredExistingRecords.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-4 text-center text-slate-400">
                          No records found.
                        </td>
                      </tr>
                    ) : (
                      filteredExistingRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-[#1f2735]">
                          <td className="p-3">
                            <input type="checkbox" className="rounded border-slate-300" />
                          </td>
                          <td className="p-3 font-semibold text-[#0972D3] dark:text-[#539fe5]">
                            {rec.name}
                          </td>
                          <td className="p-3 font-bold text-slate-700 dark:text-slate-300">
                            {rec.type}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">Simple</td>
                          <td className="p-3 text-slate-400">-</td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">No</td>
                          <td className="p-3 font-mono text-slate-800 dark:text-slate-200 whitespace-pre-line max-w-xs truncate">
                            {rec.value}
                          </td>
                          <td className="p-3 text-slate-700 dark:text-slate-300">
                            {rec.ttl ? rec.ttl.toLocaleString() : '300'}
                          </td>
                          <td className="p-3 text-slate-400">-</td>
                          <td className="p-3 text-slate-400">-</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
