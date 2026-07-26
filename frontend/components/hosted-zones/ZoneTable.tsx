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
      <div className="w-full overflow-x-auto bg-white">
        <table className="w-full text-base text-left text-[#16191F] border-collapse">
          <thead className="bg-white border-b border-slate-300">
            <tr className="h-14">
              <th className="w-12 px-7 py-4"></th>
              <th className="px-7 py-4 font-semibold">Hosted zone name</th>
              <th className="px-7 py-4 font-semibold">Type</th>
              <th className="px-7 py-4 font-semibold">Created by</th>
              <th className="px-7 py-4 font-semibold">Record count</th>
              <th className="px-7 py-4 font-semibold">Description</th>
              <th className="px-7 py-4 font-semibold">Hosted zone ID</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="h-16 animate-pulse">
                <td className="px-7 py-4">
                  <div className="h-4 w-4 rounded-full bg-slate-200"></div>
                </td>
                <td className="px-7 py-4">
                  <div className="h-4 bg-slate-200 rounded w-48"></div>
                </td>
                <td className="px-7 py-4">
                  <div className="h-4 bg-slate-200 rounded w-16"></div>
                </td>
                <td className="px-7 py-4">
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                </td>
                <td className="px-7 py-4">
                  <div className="h-4 bg-slate-200 rounded w-10"></div>
                </td>
                <td className="px-7 py-4">
                  <div className="h-4 bg-slate-200 rounded w-32"></div>
                </td>
                <td className="px-7 py-4">
                  <div className="h-4 bg-slate-200 rounded w-28"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white">
      <table className="w-full text-base text-left text-[#16191F] border-collapse bg-white">
        {/* Header Row */}
        <thead className="bg-white border-b border-slate-300 select-none">
          <tr className="h-14">
            {/* Checkbox Column */}
            <th className="w-12 px-7 py-4 text-center">
              <input
                type="checkbox"
                checked={isAllSelected || (zones.length > 0 && zones.every((z) => z.id === selectedZoneId))}
                onChange={() => {
                  if (onSelectAll) {
                    onSelectAll();
                  } else if (zones.length > 0) {
                    onSelectZone(selectedZoneId ? null : zones[0].id);
                  }
                }}
                className="w-4 h-4 rounded-full border-2 border-slate-400 text-[#0972D3] focus:ring-[#0972D3] cursor-pointer"
              />
            </th>

            {/* Hosted zone name */}
            <th
              onClick={() => handleHeaderClick('domain_name')}
              className="px-7 py-4 font-semibold text-[#16191F] cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-1">
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
              className="px-7 py-4 font-semibold text-[#16191F] cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-1">
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
              className="px-7 py-4 font-semibold text-[#16191F] cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-1">
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
              className="px-7 py-4 font-semibold text-[#16191F] cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-1">
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
              className="px-7 py-4 font-semibold text-[#16191F] cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-1">
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
              className="px-7 py-4 font-semibold text-[#16191F] cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-1">
                <span>Hosted zone ID</span>
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
          <tbody>
            <tr>
              <td colSpan={7} className="py-20 px-7 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <h3 className="text-lg font-semibold text-[#16191F]">No hosted zones</h3>
                  <p className="text-base text-slate-600">
                    There are no hosted zones created for this account.
                  </p>
                  <Link
                    href="/hosted-zones/new"
                    className="px-6 py-2 bg-[#ec7211] hover:bg-[#d65f00] text-slate-900 font-bold rounded-full text-sm transition-colors inline-flex items-center justify-center mt-2"
                  >
                    Create hosted zone
                  </Link>
                </div>
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody className="bg-white divide-y divide-slate-200">
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
                  className={`h-16 transition-colors ${
                    isSelected ? 'bg-[#e6f2fc]' : 'hover:bg-[#f2f8fd]'
                  }`}
                >
                  {/* Checkbox Column */}
                  <td className="px-7 py-4 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectZone(isSelected ? null : zone.id)}
                      className="w-4 h-4 rounded-full border-2 border-slate-400 text-[#0972D3] focus:ring-[#0972D3] cursor-pointer"
                    />
                  </td>

                  {/* Domain Name Link */}
                  <td className="px-7 py-4 font-normal align-middle">
                    <Link
                      href={`/hosted-zones/${zone.id}`}
                      className="text-[#0972D3] hover:underline cursor-pointer font-normal text-base"
                    >
                      {zone.domain_name}
                    </Link>
                  </td>

                  {/* Type */}
                  <td className="px-7 py-4 font-normal text-[#16191F] align-middle">
                    {displayType}
                  </td>

                  {/* Created By */}
                  <td className="px-7 py-4 font-normal text-[#16191F] align-middle">
                    Route 53
                  </td>

                  {/* Record Count */}
                  <td className="px-7 py-4 font-normal text-[#16191F] align-middle">
                    {zone.record_count}
                  </td>

                  {/* Description */}
                  <td className="px-7 py-4 font-normal text-[#16191F] align-middle max-w-xs truncate">
                    {zone.description && zone.description.trim() ? zone.description : '-'}
                  </td>

                  {/* Hosted Zone ID */}
                  <td className="px-7 py-4 font-normal text-[#16191F] align-middle">
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
