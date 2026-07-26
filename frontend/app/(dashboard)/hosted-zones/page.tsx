'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { HostedZone } from '../../../lib/types';
import { useDebounce } from '../../../hooks/useDebounce';
import { useToast } from '../../../hooks/useToast';
import ZoneSearchBar from '../../../components/hosted-zones/ZoneSearchBar';
import ZoneTable, { SortField, SortOrder } from '../../../components/hosted-zones/ZoneTable';
import Modal from '../../../components/ui/Modal';
import { RotateCw } from 'lucide-react';

export default function HostedZonesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Table parameters
  const [search, setSearch] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [operator, setOperator] = useState<'and' | 'or'>('and');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('domain_name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Selected row state
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Delete modal state
  const [zoneToDelete, setZoneToDelete] = useState<HostedZone | null>(null);

  // Debounce search string
  const debouncedSearch = useDebounce(search, 300);

  // Fetch hosted zones from backend
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['hosted-zones', page, pageSize],
    queryFn: () =>
      api.getHostedZones({
        page: 1,
        page_size: 100, // Fetch list for client sorting & search filtering
      }),
  });

  const handleAddTag = (tag: string) => {
    if (!filterTags.includes(tag)) {
      setFilterTags([...filterTags, tag]);
    }
    setPage(1);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFilterTags(filterTags.filter((t) => t !== tagToRemove));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilterTags([]);
    setSearch('');
    setOperator('and');
    setPage(1);
  };

  // Filter items by active filter tags, operator ('and' | 'or') & live search string
  const filteredZones = React.useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((zone) => {
      const activeTerms = [...filterTags];
      if (debouncedSearch.trim()) {
        activeTerms.push(debouncedSearch.trim().toLowerCase());
      }

      if (activeTerms.length === 0) return true;

      const matchesTerm = (term: string) => {
        const t = term.toLowerCase();
        return (
          zone.domain_name.toLowerCase().includes(t) ||
          zone.type.toLowerCase().includes(t) ||
          (zone.description && zone.description.toLowerCase().includes(t)) ||
          zone.id.toLowerCase().includes(t)
        );
      };

      if (operator === 'or') {
        return activeTerms.some(matchesTerm);
      } else {
        return activeTerms.every(matchesTerm);
      }
    });
  }, [data?.items, filterTags, debouncedSearch, operator]);

  const totalCount = filteredZones.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Paginated & Sorted items
  const sortedZones = React.useMemo(() => {
    const list = [...filteredZones].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortField === 'created_by') {
        aVal = 'Route 53';
        bVal = 'Route 53';
      } else if (sortField === 'id') {
        aVal = a.id;
        bVal = b.id;
      } else if (sortField === 'description') {
        aVal = a.description || '';
        bVal = b.description || '';
      } else {
        aVal = a[sortField];
        bVal = b[sortField];
      }

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const startIndex = (page - 1) * pageSize;
    return list.slice(startIndex, startIndex + pageSize);
  }, [filteredZones, sortField, sortOrder, page, pageSize]);

  const selectedZone = React.useMemo(() => {
    if (!selectedZoneId || !data?.items) return null;
    return data.items.find((z) => z.id === selectedZoneId) || null;
  }, [selectedZoneId, data?.items]);

  // Delete zone mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteHostedZone(id),
    onSuccess: () => {
      toast.success(`Successfully deleted hosted zone: ${zoneToDelete?.domain_name}`);
      setZoneToDelete(null);
      setSelectedZoneId(null);
      queryClient.invalidateQueries({ queryKey: ['hosted-zones'] });
    },
    onError: (err: any) => {
      toast.error(err.detail || 'Failed to delete hosted zone.');
      setZoneToDelete(null);
    },
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleConfirmDelete = () => {
    if (zoneToDelete) {
      deleteMutation.mutate(zoneToDelete.id);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedZoneId) {
      setSelectedZoneId(null);
    } else if (sortedZones.length > 0) {
      setSelectedZoneId(sortedZones[0].id);
    }
  };

  return (
    <div className="flex flex-col space-y-6 font-sans">
      {/* Header Row: Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title */}
        <h1 className="text-2xl font-bold text-[#16191F] tracking-tight">
          Hosted zones ({totalCount})
        </h1>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            className="h-9 w-9 rounded-full border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors shadow-2xs"
            title="Refresh"
          >
            <RotateCw className="h-4 w-4 text-[#0972D3]" strokeWidth={1.5} />
          </button>

          {/* View Details Button */}
          <button
            onClick={() => selectedZoneId && router.push(`/hosted-zones/${selectedZoneId}`)}
            disabled={!selectedZoneId}
            className="px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-[#16191F] disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors shadow-2xs"
          >
            View details
          </button>

          {/* Edit Button */}
          <button
            disabled={!selectedZoneId}
            className="px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-[#16191F] disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors shadow-2xs"
          >
            Edit
          </button>

          {/* Delete Button */}
          <button
            onClick={() => selectedZone && setZoneToDelete(selectedZone)}
            disabled={!selectedZoneId}
            className="px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-[#16191F] disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors shadow-2xs"
          >
            Delete
          </button>

          {/* Create Hosted Zone Button */}
          <Link
            href="/hosted-zones/new"
            className="px-5 py-2 rounded-full bg-[#ec7211] hover:bg-[#d65f00] text-slate-900 font-bold text-sm transition-colors shadow-2xs inline-flex items-center justify-center"
          >
            Create hosted zone
          </Link>
        </div>
      </div>

      {/* Helper text notice under header */}
      <p className="text-sm text-slate-700 leading-relaxed">
        Automatic mode is the current search behavior optimized for best filter results.{' '}
        <a href="#settings" className="text-[#0972D3] hover:underline">
          To change modes go to settings.
        </a>
      </p>

      {/* Search Toolbar & Pagination */}
      <ZoneSearchBar
        value={search}
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        tags={filterTags}
        operator={operator}
        onOperatorChange={(op) => setOperator(op)}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onClearFilters={handleClearFilters}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />

      {/* Flat AWS-style Table */}
      <div className="border-t border-b border-slate-200">
        <ZoneTable
          zones={sortedZones}
          isLoading={isLoading}
          selectedZoneId={selectedZoneId}
          onSelectZone={(id) => setSelectedZoneId(id)}
          onSelectAll={handleToggleSelectAll}
          isAllSelected={selectedZoneId !== null && sortedZones.length > 0}
          onDeleteClick={(zone) => setZoneToDelete(zone)}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={zoneToDelete !== null}
        onClose={() => setZoneToDelete(null)}
        title="Delete hosted zone"
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        confirmVariant="danger"
        isConfirmLoading={deleteMutation.isPending}
      >
        <p className="mb-2 text-base text-[#16191F]">
          Are you sure you want to delete the hosted zone{' '}
          <span className="font-semibold text-slate-900">{zoneToDelete?.domain_name}</span>?
        </p>
        <p className="text-sm text-red-600 font-medium">
          Warning: This action is permanent and will cascade delete all associated DNS records!
        </p>
      </Modal>
    </div>
  );
}
