'use client';

import React from 'react';
import { ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { DNSRecord, RecordType } from '../../lib/types';
import Badge from '../ui/Badge';

export type RecordSortField = 'name' | 'type' | 'ttl';
export type RecordSortOrder = 'asc' | 'desc';

interface RecordTableProps {
  records: DNSRecord[];
  isLoading: boolean;
  selectedRecordId?: string | null;
  onSelectRecord?: (recordId: string | null) => void;
  onEditClick: (record: DNSRecord) => void;
  onDeleteClick: (record: DNSRecord) => void;
  sortField: RecordSortField;
  sortOrder: RecordSortOrder;
  onSort: (field: RecordSortField) => void;
}

export default function RecordTable({
  records,
  isLoading,
  selectedRecordId,
  onSelectRecord,
  onEditClick,
  onDeleteClick,
  sortField,
  sortOrder,
  onSort,
}: RecordTableProps) {
  const getRecordTypeColor = (type: RecordType) => {
    switch (type) {
      case 'A': return 'blue';
      case 'AAAA': return 'blue';
      case 'CNAME': return 'orange';
      case 'TXT': return 'gray';
      case 'MX': return 'green';
      case 'NS': return 'green';
      default: return 'gray';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full border border-slate-300 rounded overflow-hidden bg-white">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="text-xs font-bold text-slate-800 bg-slate-50 border-b border-slate-300">
            <tr>
              <th className="w-10 px-3 py-2.5"></th>
              <th className="px-4 py-2.5">Record name</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Value/Route to</th>
              <th className="px-4 py-2.5 text-right">TTL (seconds)</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-3 py-4"><div className="h-3 w-3 bg-slate-200 rounded"></div></td>
                <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-64"></div></td>
                <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
                <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-300 rounded bg-white text-center">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">No records found</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          No DNS records match your filter criteria. Create a record or change your search filter query to display matching entries.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full border border-slate-300 rounded overflow-x-auto bg-white shadow-2xs">
      <table className="w-full text-xs text-left text-slate-700 bg-white">
        <thead className="text-[11px] font-semibold text-slate-600 bg-slate-50 border-b border-slate-300 select-none">
          <tr>
            <th className="w-10 px-3 py-1.5 text-center">
              <input
                type="checkbox"
                disabled
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th
              onClick={() => onSort('name')}
              className="px-4 py-1.5 cursor-pointer hover:bg-slate-100 transition-colors font-semibold text-slate-600"
            >
              <div className="flex items-center space-x-1">
                <span>Record name</span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </div>
            </th>
            <th
              onClick={() => onSort('type')}
              className="px-4 py-1.5 cursor-pointer hover:bg-slate-100 transition-colors font-semibold text-slate-600"
            >
              <div className="flex items-center space-x-1">
                <span>Type</span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </div>
            </th>
            <th className="px-4 py-1.5 font-semibold text-slate-600">Value/Route to</th>
            <th
              onClick={() => onSort('ttl')}
              className="px-4 py-1.5 cursor-pointer hover:bg-slate-100 transition-colors text-right font-semibold text-slate-600"
            >
              <div className="flex items-center justify-end space-x-1">
                <span>TTL (seconds)</span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </div>
            </th>
            <th className="px-4 py-1.5 text-right font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white font-mono">
          {records.map((record) => {
            const isSelected = selectedRecordId === record.id;
            return (
              <tr
                key={record.id}
                className={isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50 transition-colors'}
              >
                <td className="px-3 py-2 text-center font-sans">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelectRecord && onSelectRecord(isSelected ? null : record.id)}
                    className="rounded border-slate-400 text-[#0073bb] focus:ring-[#0073bb]"
                  />
                </td>
                <td className="px-4 py-2 font-semibold text-slate-900 truncate max-w-[200px] font-sans">
                  {record.name}
                </td>
                <td className="px-4 py-2 font-sans">
                  <Badge variant={getRecordTypeColor(record.type)}>{record.type}</Badge>
                </td>
                <td className="px-4 py-2 text-slate-700 truncate max-w-[300px]" title={record.value}>
                  {record.value}
                </td>
                <td className="px-4 py-2 text-right text-slate-800 font-medium">
                  {record.ttl}
                </td>
                <td className="px-4 py-2 text-right space-x-2 shrink-0 font-sans">
                  <button
                    onClick={() => onEditClick(record)}
                    className="inline-flex items-center p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                    title="Edit record"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteClick(record)}
                    className="inline-flex items-center p-1 text-slate-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

