'use client';

import React from 'react';
import Link from 'next/link';
import { HostedZone } from '../../lib/types';

export type SortField = 'domain_name' | 'type' | 'created_by' | 'record_count' | 'description' | 'id';
export type SortOrder = 'asc' | 'desc';

interface ZoneTableProps {
  zones: HostedZone[];
  isLoading: boolean;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string | null) => void;
  onSelectAll?: () => void;
  isAllSelected?: boolean;
  onDeleteClick: (zone: HostedZone) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

// AWS-style filled triangle sort indicator
function TriangleIcon({ direction, active }: { direction: 'asc' | 'desc'; active: boolean }) {
  if (direction === 'asc') {
    return (
      <svg
        className={`h-2.5 w-2.5 ml-1.5 shrink-0 inline-block align-middle ${
          active ? 'fill-[#16191F]' : 'fill-slate-400'
        }`}
        viewBox="0 0 10 10"
      >
        <polygon points="5,1 9,9 1,9" />
      </svg>
    );
  }
  return (
    <svg
      className={`h-2.5 w-2.5 ml-1.5 shrink-0 inline-block align-middle ${
        active ? 'fill-[#16191F]' : 'fill-slate-400'
      }`}
      viewBox="0 0 10 10"
    >
      <polygon points="1,1 9,1 5,9" />
    </svg>
  );
}

export default function ZoneTable({
  zones,
  isLoading,
  selectedZoneId,
  onSelectZone,
  onSelectAll,
  isAllSelected = false,
  sortField,
  sortOrder,
  onSort,
}: ZoneTableProps) {

  const handleHeaderClick = (field: SortField) => {
    onSort(field);
  };

  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto bg-white dark:bg-[#16191F]">
        <table className="w-full text-xs text-left text-[#16191F] dark:text-slate-200 border-collapse">
          <thead className="bg-white dark:bg-[#16191F] border-b border-slate-300 dark:border-slate-700">
            <tr className="h-9">
              <th className="w-10 px-4 py-2.5 border-r border-slate-300 dark:border-slate-700"></th>
              <th className="px-4 py-2.5 font-bold border-r border-slate-300 dark:border-slate-700 text-[#16191F] dark:text-white">Hosted zone name</th>
              <th className="px-4 py-2.5 font-bold border-r border-slate-300 dark:border-slate-700 text-[#16191F] dark:text-white">Type</th>
              <th className="px-4 py-2.5 font-bold border-r border-slate-300 dark:border-slate-700 text-[#16191F] dark:text-white">Created by</th>
              <th className="px-4 py-2.5 font-bold border-r border-slate-300 dark:border-slate-700 text-[#16191F] dark:text-white">Record count</th>
              <th className="px-4 py-2.5 font-bold border-r border-slate-300 dark:border-slate-700 text-[#16191F] dark:text-white">Description</th>
              <th className="px-4 py-2.5 font-bold border-r border-slate-300 dark:border-slate-700 text-[#16191F] dark:text-white">Hosted zone ID</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#16191F] divide-y divide-slate-200 dark:divide-slate-800">
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="h-10 animate-pulse">
                <td className="px-4 py-2.5">
                  <div className="h-3.5 w-3.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-36"></div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-[#16191F]">
      <table className="w-full text-xs text-left text-[#16191F] dark:text-slate-200 border-collapse bg-white dark:bg-[#16191F]">
        {/* Header Row */}
        <thead className="bg-white dark:bg-[#16191F] border-b border-slate-300 dark:border-[#384252] select-none">
          <tr className="h-9">
            {/* Selection Column */}
            <th className="w-10 px-4 py-2.5 text-center border-r border-slate-300 dark:border-[#384252]">
              <input
                type="radio"
                disabled
                className="w-3.5 h-3.5 border-slate-400 dark:border-slate-600 text-[#0972D3] focus:ring-[#0972D3] opacity-40 cursor-not-allowed"
              />
            </th>

            {/* Hosted zone name */}
            <th
              onClick={() => handleHeaderClick('domain_name')}
              className="px-4 py-2.5 font-normal text-slate-700 dark:text-[#aab7c4] cursor-pointer hover:bg-slate-50 dark:hover:bg-[#242b35] transition-colors border-r border-slate-300 dark:border-[#384252]"
            >
              <div className="flex items-center justify-between space-x-1">
                <span>Hosted zone name</span>
                <TriangleIcon
                  direction={sortField === 'domain_name' ? sortOrder : 'desc'}
                  active={sortField === 'domain_name'}
                />
              </div>
            </th>

            {/* Type */}
            <th
              onClick={() => handleHeaderClick('type')}
              className="px-4 py-2.5 font-normal text-slate-700 dark:text-[#aab7c4] cursor-pointer hover:bg-slate-50 dark:hover:bg-[#242b35] transition-colors border-r border-slate-300 dark:border-[#384252]"
            >
              <div className="flex items-center justify-between space-x-1">
                <span>Type</span>
                <TriangleIcon
                  direction={sortField === 'type' ? sortOrder : 'desc'}
                  active={sortField === 'type'}
                />
              </div>
            </th>

            {/* Created by */}
            <th
              onClick={() => handleHeaderClick('created_by')}
              className="px-4 py-2.5 font-normal text-slate-700 dark:text-[#aab7c4] cursor-pointer hover:bg-slate-50 dark:hover:bg-[#242b35] transition-colors border-r border-slate-300 dark:border-[#384252]"
            >
              <div className="flex items-center justify-between space-x-1">
                <span>Created by</span>
                <TriangleIcon
                  direction={sortField === 'created_by' ? sortOrder : 'desc'}
                  active={sortField === 'created_by'}
                />
              </div>
            </th>

            {/* Record count */}
            <th
              onClick={() => handleHeaderClick('record_count')}
              className="px-4 py-2.5 font-normal text-slate-700 dark:text-[#aab7c4] cursor-pointer hover:bg-slate-50 dark:hover:bg-[#242b35] transition-colors border-r border-slate-300 dark:border-[#384252]"
            >
              <div className="flex items-center justify-between space-x-1">
                <span>Record count</span>
                <TriangleIcon
                  direction={sortField === 'record_count' ? sortOrder : 'desc'}
                  active={sortField === 'record_count'}
                />
              </div>
            </th>

            {/* Description */}
            <th
              onClick={() => handleHeaderClick('description')}
              className="px-4 py-2.5 font-normal text-slate-700 dark:text-[#aab7c4] cursor-pointer hover:bg-slate-50 dark:hover:bg-[#242b35] transition-colors border-r border-slate-300 dark:border-[#384252]"
            >
              <div className="flex items-center justify-between space-x-1">
                <span>Description</span>
                <TriangleIcon
                  direction={sortField === 'description' ? sortOrder : 'desc'}
                  active={sortField === 'description'}
                />
              </div>
            </th>

            {/* Hosted zone ID */}
            <th
              onClick={() => handleHeaderClick('id')}
              className="px-4 py-2.5 font-normal text-slate-700 dark:text-[#aab7c4] cursor-pointer hover:bg-slate-50 dark:hover:bg-[#242b35] transition-colors border-r border-slate-300 dark:border-[#384252]"
            >
              <div className="flex items-center justify-between space-x-1">
                <span className="truncate">Hosted zone ID</span>
                <TriangleIcon
                  direction={sortField === 'id' ? sortOrder : 'desc'}
                  active={sortField === 'id'}
                />
              </div>
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        {zones.length === 0 ? (
          <tbody className="bg-white dark:bg-[#16191F]">
            <tr>
              <td colSpan={7} className="py-12 px-4 text-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <h3 className="text-sm font-semibold text-[#16191F] dark:text-white">No hosted zones</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    There are no hosted zones created for this account.
                  </p>
                  <Link
                    href="/hosted-zones/new"
                    className="px-4 py-1.5 bg-[#ec7211] hover:bg-[#d65f00] text-slate-900 font-bold rounded-full text-xs transition-colors inline-flex items-center justify-center mt-1"
                  >
                    Create hosted zone
                  </Link>
                </div>
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody className="bg-white dark:bg-[#16191F] divide-y divide-slate-200 dark:divide-slate-800">
            {zones.map((zone) => {
              const isSelected = selectedZoneId === zone.id;
              const displayType =
                zone.type === 'public' || zone.type?.toLowerCase().includes('public')
                  ? 'Public'
                  : 'Private';

              const truncatedId =
                zone.id.length > 14 ? `${zone.id.substring(0, 14)}...` : zone.id;

              return (
                <tr
                  key={zone.id}
                  className={`h-10 transition-colors ${
                    isSelected ? 'bg-[#e6f2fc] dark:bg-[#1d324f]' : 'hover:bg-[#f2f8fd] dark:hover:bg-[#1c2533]'
                  }`}
                >
                  {/* Selection Column */}
                  <td className="px-4 py-2.5 text-center align-middle">
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => onSelectZone(isSelected ? null : zone.id)}
                      onClick={() => {
                        if (isSelected) onSelectZone(null);
                      }}
                      className="w-3.5 h-3.5 border-slate-400 dark:border-slate-500 text-[#0972D3] focus:ring-[#0972D3] cursor-pointer"
                    />
                  </td>

                  {/* Domain Name Link */}
                  <td className="px-4 py-2.5 font-normal align-middle">
                    <Link
                      href={`/hosted-zones/${zone.id}`}
                      className="text-[#0972D3] dark:text-[#539fe4] hover:underline cursor-pointer font-normal text-xs"
                    >
                      {zone.domain_name}
                    </Link>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-2.5 font-normal text-[#16191F] dark:text-slate-200 align-middle">
                    {displayType}
                  </td>

                  {/* Created By */}
                  <td className="px-4 py-2.5 font-normal text-[#16191F] dark:text-slate-200 align-middle">
                    Route 53
                  </td>

                  {/* Record Count */}
                  <td className="px-4 py-2.5 font-normal text-[#16191F] dark:text-slate-200 align-middle">
                    {zone.record_count}
                  </td>

                  {/* Description */}
                  <td className="px-4 py-2.5 font-normal text-[#16191F] dark:text-slate-200 align-middle max-w-xs truncate">
                    {zone.description && zone.description.trim() ? zone.description : '-'}
                  </td>

                  {/* Hosted Zone ID */}
                  <td className="px-4 py-2.5 font-normal text-[#16191F] dark:text-slate-200 align-middle">
                    <span title={zone.id}>{truncatedId}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        )}
      </table>
    </div>
  );
}
