'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../lib/api';
import { DNSRecord, HostedZone } from '../../../../lib/types';
import { useDebounce } from '../../../../hooks/useDebounce';
import { useToast } from '../../../../hooks/useToast';
import RecordFormModal from '../../../../components/dns-records/RecordFormModal';
import ZoneSearchBar from '../../../../components/hosted-zones/ZoneSearchBar';
import Modal from '../../../../components/ui/Modal';
import { RotateCw, X, CheckCircle2, ChevronRight, ChevronDown, Search, ChevronLeft, Trash2, Settings, Copy } from 'lucide-react';

interface TagItem {
  key: string;
  value: string;
}

export default function HostedZoneDetailPage({ params }: { params: { id: string } }) {
  const zoneId = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();

  const isNewlyCreated = searchParams.get('created') === 'true';
  const createdDomain = searchParams.get('domain') || '';

  const [showBanner, setShowBanner] = useState(isNewlyCreated);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'records' | 'recovery' | 'dnssec' | 'tags'>('records');

  // Hosted Zone Delete Modal State
  const [isDeleteZoneModalOpen, setIsDeleteZoneModalOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [operator, setOperator] = useState<'and' | 'or'>('and');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRoutingPolicy, setSelectedRoutingPolicy] = useState<string>('all');
  const [selectedAlias, setSelectedAlias] = useState<string>('all');
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);

  // Tags State
  const [userTags, setUserTags] = useState<TagItem[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const [editTags, setEditTags] = useState<TagItem[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Record Modals State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<DNSRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<DNSRecord | null>(null);
  const [formErrorMsg, setFormErrorMsg] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Fetch Hosted Zone Details
  const { data: zone } = useQuery({
    queryKey: ['hosted-zone', zoneId],
    queryFn: () => api.getHostedZone(zoneId),
  });

  const domainDisplayName = zone?.domain_name || createdDomain || 'Hosted zone';

  // Sync tags from backend zone data
  useEffect(() => {
    if (zone && zone.tags !== undefined) {
      setUserTags(zone.tags);
    }
  }, [zone]);

  // Fetch Records
  const { data: recordsData, isLoading: isRecordsLoading, refetch: refetchRecords } = useQuery({
    queryKey: ['records', zoneId],
    queryFn: () =>
      api.getRecords(zoneId, {
        page: 1,
        page_size: 100,
      }),
  });

  const rawRecords = recordsData?.items || [];

  const nsRecord = rawRecords.find((r) => r.type === 'NS');
  const nameServersFromRecord = nsRecord
    ? nsRecord.value.split('\n').map((s) => s.trim()).filter(Boolean)
    : [];
  const defaultNameServers = [
    'ns-604.awsdns-11.net',
    'ns-1933.awsdns-49.co.uk',
    'ns-1479.awsdns-56.org',
    'ns-403.awsdns-50.com',
  ];
  const nameServersToDisplay =
    nameServersFromRecord.length > 0 ? nameServersFromRecord : defaultNameServers;

  const handleAddTagFilter = (tag: string) => {
    if (!filterTags.includes(tag)) {
      setFilterTags([...filterTags, tag]);
    }
    setPage(1);
  };

  const handleRemoveTagFilter = (tagToRemove: string) => {
    setFilterTags(filterTags.filter((t) => t !== tagToRemove));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilterTags([]);
    setSearch('');
    setOperator('and');
    setSelectedType('all');
    setSelectedRoutingPolicy('all');
    setSelectedAlias('all');
    setSelectedRecordIds([]);
    setPage(1);
  };

  // Filter records by type, routing policy, alias, search tags, operator ('and' | 'or')
  const filteredRecords = React.useMemo(() => {
    return rawRecords.filter((rec) => {
      const recAliasStr = (rec as any).alias ? 'Yes' : 'No';

      if (selectedType !== 'all' && rec.type !== selectedType) {
        return false;
      }
      if (selectedRoutingPolicy !== 'all') {
        const recRouting = ((rec as any).routing_policy || 'Simple').toLowerCase();
        if (!recRouting.includes(selectedRoutingPolicy.toLowerCase())) {
          return false;
        }
      }
      if (selectedAlias !== 'all' && recAliasStr !== selectedAlias) {
        return false;
      }

      const activeTerms = [...filterTags];
      if (debouncedSearch.trim()) {
        activeTerms.push(debouncedSearch.trim());
      }

      if (activeTerms.length === 0) return true;

      const matchesTerm = (term: string) => {
        const normalized = term.trim();
        // Check for key:value or key=value patterns
        const match = normalized.match(/^([^:=]+)[:=]\s*(.+)$/i);

        if (match) {
          const key = match[1].trim().toLowerCase();
          const val = match[2].trim().toLowerCase();

          if (key === 'alias') {
            const isYes = val === 'yes' || val === 'true' || val === 'y';
            const isNo = val === 'no' || val === 'false' || val === 'n';
            if (isYes) return recAliasStr === 'Yes';
            if (isNo) return recAliasStr === 'No';
            return recAliasStr.toLowerCase().includes(val);
          }

          if (key === 'type' || key === 'record type') {
            return rec.type.toLowerCase() === val || rec.type.toLowerCase().includes(val);
          }

          if (key === 'routing' || key === 'routing policy') {
            const recRouting = ((rec as any).routing_policy || 'simple').toLowerCase();
            return recRouting.includes(val);
          }

          if (key === 'name' || key === 'record name') {
            return rec.name.toLowerCase().includes(val);
          }

          if (key === 'value' || key === 'value/route traffic to') {
            return rec.value.toLowerCase().includes(val);
          }

          if (key === 'ttl' || key === 'ttl (seconds)') {
            return String(rec.ttl).includes(val);
          }
        }

        // Generic fallback search across name, type, value, alias, ttl
        const t = term.toLowerCase();
        return (
          rec.name.toLowerCase().includes(t) ||
          rec.type.toLowerCase().includes(t) ||
          rec.value.toLowerCase().includes(t) ||
          recAliasStr.toLowerCase().includes(t) ||
          String(rec.ttl).includes(t)
        );
      };

      if (operator === 'or') {
        return activeTerms.some(matchesTerm);
      } else {
        return activeTerms.every(matchesTerm);
      }
    });
  }, [rawRecords, selectedType, selectedRoutingPolicy, selectedAlias, filterTags, debouncedSearch, operator]);

  const totalRecords = filteredRecords.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  const records = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page, pageSize]);

  const selectedRecord = rawRecords.find((r) => selectedRecordIds.includes(r.id)) || null;

  // Filtered tags for Hosted Zone Tags tab
  const filteredUserTags = React.useMemo(() => {
    if (!tagSearch.trim()) return userTags;
    const term = tagSearch.trim().toLowerCase();
    return userTags.filter(
      (t) => t.key.toLowerCase().includes(term) || t.value.toLowerCase().includes(term)
    );
  }, [userTags, tagSearch]);

  // Update Zone Tags Mutation
  const updateTagsMutation = useMutation({
    mutationFn: (tagsToSave: TagItem[]) =>
      api.updateHostedZone(zoneId, { tags: tagsToSave }),
    onSuccess: (updated) => {
      setUserTags(updated.tags || []);
      queryClient.invalidateQueries({ queryKey: ['hosted-zone', zoneId] });
      queryClient.invalidateQueries({ queryKey: ['hosted-zones'] });
      setIsManageTagsOpen(false);
      toast.success('Hosted zone tags updated.');
    },
    onError: (err: any) => {
      toast.error(err.detail || 'Failed to update hosted zone tags.');
    },
  });

  // Save tags from Manage Tags Modal
  const handleSaveManagedTags = () => {
    const valid = editTags
      .filter((t) => t.key.trim().length > 0)
      .map((t) => ({ key: t.key.trim(), value: t.value.trim() }));
    updateTagsMutation.mutate(valid);
  };

  // Create Record Mutation
  const createRecordMutation = useMutation({
    mutationFn: (payload: any) => api.createRecord(zoneId, payload),
    onSuccess: (newRec) => {
      toast.success(`Record for ${newRec.name} created successfully.`);
      setIsRecordModalOpen(false);
      setRecordToEdit(null);
      queryClient.invalidateQueries({ queryKey: ['records', zoneId] });
      queryClient.invalidateQueries({ queryKey: ['hosted-zone', zoneId] });
    },
    onError: (err: any) => {
      setFormErrorMsg(err.detail || 'Failed to create DNS record.');
    },
  });

  // Update Record Mutation
  const updateRecordMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      api.updateRecord(zoneId, id, payload),
    onSuccess: (updatedRec) => {
      toast.success(`Record for ${updatedRec.name} updated successfully.`);
      setIsRecordModalOpen(false);
      setRecordToEdit(null);
      queryClient.invalidateQueries({ queryKey: ['records', zoneId] });
    },
    onError: (err: any) => {
      setFormErrorMsg(err.detail || 'Failed to update DNS record.');
    },
  });

  // Delete Record Mutation
  const deleteRecordMutation = useMutation({
    mutationFn: (recId: string) => api.deleteRecord(zoneId, recId),
    onSuccess: () => {
      toast.success('DNS record deleted successfully.');
      setRecordToDelete(null);
      setSelectedRecordIds([]);
      queryClient.invalidateQueries({ queryKey: ['records', zoneId] });
      queryClient.invalidateQueries({ queryKey: ['hosted-zone', zoneId] });
    },
    onError: (err: any) => {
      toast.error(err.detail || 'Failed to delete record.');
      setRecordToDelete(null);
    },
  });

  // Delete Hosted Zone Mutation
  const deleteZoneMutation = useMutation({
    mutationFn: () => api.deleteHostedZone(zoneId),
    onSuccess: () => {
      toast.success(`Deleted hosted zone: ${domainDisplayName}`);
      router.push('/hosted-zones');
    },
    onError: (err: any) => {
      toast.error(err.detail || 'Failed to delete hosted zone.');
      setIsDeleteZoneModalOpen(false);
    },
  });

  const handleRecordFormSubmit = (data: any) => {
    setFormErrorMsg(null);
    if (recordToEdit) {
      updateRecordMutation.mutate({ id: recordToEdit.id, payload: data });
    } else {
      createRecordMutation.mutate(data);
    }
  };

  const zoneTypeLabel = zone?.type ? zone.type.toLowerCase() : 'public';

  return (
    <div className="flex flex-col space-y-6 font-sans max-w-[1650px] w-full text-[#16191F] pb-8">
      {/* 1. Full-width Green Success Banner */}
      {showBanner && (
        <div className="bg-[#037f0c] text-white p-4 rounded-xl flex items-start justify-between shadow-2xs transition-all animate-fadeIn w-full">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 shrink-0">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-snug">
                {domainDisplayName} was successfully created.
              </h2>
              <p className="text-xs text-white/90 mt-0.5">
                Now you can create records in the hosted zone to specify how you want Route 53 to route traffic for your domain.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2. Top Title Row & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-sans">
        {/* Left: Type Badge + Domain Name + Info */}
        <div className="flex items-center space-x-2">
          <span className="bg-[#0972D3] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            {zoneTypeLabel === 'public' ? 'Public' : 'Private'}
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-[#16191F] tracking-tight">
            {domainDisplayName}
          </h1>
          <button className="text-[#0972D3] hover:underline text-[11px] font-medium ml-0.5">
            Info
          </button>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setIsDeleteZoneModalOpen(true)}
            className="px-3 py-1 rounded-full border-2 border-[#0972D3] text-[#0972D3] hover:bg-blue-50/60 text-[11px] font-semibold transition-colors shadow-2xs"
          >
            Delete zone
          </button>
          <button
            onClick={() => toast.info('Test record feature coming soon!')}
            className="px-3 py-1 rounded-full border-2 border-[#0972D3] text-[#0972D3] hover:bg-blue-50/60 text-[11px] font-semibold transition-colors shadow-2xs"
          >
            Test record
          </button>
          <button
            onClick={() => toast.info('Configure query logging feature coming soon!')}
            className="px-3 py-1 rounded-full border-2 border-[#0972D3] text-[#0972D3] hover:bg-blue-50/60 text-[11px] font-semibold transition-colors shadow-2xs"
          >
            Configure query logging
          </button>
        </div>
      </div>

      {/* 3. Collapsible Hosted Zone Details Card */}
      <div className="border border-slate-300 rounded-xl bg-white p-3 sm:p-4 shadow-2xs font-sans">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
        >
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-[#16191F] font-bold">
              {isDetailsExpanded ? '▼' : '►'}
            </span>
            <h2 className="text-sm font-bold text-[#16191F]">Hosted zone details</h2>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/hosted-zones/${zoneId}/edit`);
            }}
            className="px-3 py-1 border-2 border-[#0972D3] hover:bg-blue-50/60 text-[#0972D3] font-semibold text-[11px] rounded-full transition-colors shadow-2xs"
          >
            Edit hosted zone
          </button>
        </div>

        {isDetailsExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 mt-2 border-t border-slate-200 text-[11px]">
            {/* Column 1: Zone Name, ID, Description */}
            <div className="space-y-2.5">
              <div>
                <div className="font-bold text-[#16191F] text-[11px]">Hosted zone name</div>
                <div className="text-[#16191F] text-[11px] mt-0.5">{domainDisplayName}</div>
              </div>

              <div>
                <div className="font-bold text-[#16191F] text-[11px]">Hosted zone ID</div>
                <div className="text-[#16191F] text-[11px] mt-0.5">{zone?.id || zoneId}</div>
              </div>

              <div>
                <div className="font-bold text-[#16191F] text-[11px]">Description</div>
                <div className="text-[#16191F] text-[11px] mt-0.5">{zone?.description || '-'}</div>
              </div>
            </div>

            {/* Column 2: Query Log, Type, Record Count */}
            <div className="space-y-2.5 md:border-l md:border-slate-200 md:pl-5">
              <div>
                <div className="font-bold text-[#16191F] text-[11px]">Query log</div>
                <div className="text-[#16191F] text-[11px] mt-0.5">-</div>
              </div>

              <div>
                <div className="font-bold text-[#16191F] text-[11px]">Type</div>
                <div className="text-[#16191F] text-[11px] mt-0.5">
                  {zoneTypeLabel === 'public' ? 'Public hosted zone' : 'Private hosted zone'}
                </div>
              </div>

              <div>
                <div className="font-bold text-[#16191F] text-[11px]">Record count</div>
                <div className="text-[#16191F] text-[11px] mt-0.5">{rawRecords.length}</div>
              </div>
            </div>

            {/* Column 3: Name Servers */}
            <div className="space-y-2.5 md:border-l md:border-slate-200 md:pl-5">
              <div>
                <div className="font-bold text-[#16191F] text-[11px]">Name servers</div>
                <div className="text-[#16191F] text-[11px] mt-0.5 space-y-0.5">
                  {nameServersToDisplay.map((ns, i) => (
                    <div key={i}>{ns}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. AWS-Style Tab Navigation Bar */}
      <div className="border-b border-slate-200 font-sans select-none flex items-center space-x-4 text-[11px] font-semibold pt-1">
        <button
          type="button"
          className="pb-2 text-slate-500 hover:text-slate-800 transition-colors"
          title="Previous tabs"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`pb-2 border-b-2 transition-colors ${
            activeTab === 'records'
              ? 'border-[#0972D3] text-[#0972D3] font-bold'
              : 'border-transparent text-[#16191F] hover:text-[#0972D3]'
          }`}
        >
          Records ({rawRecords.length})
        </button>

        <button
          onClick={() => setActiveTab('recovery')}
          className={`pb-2 border-b-2 transition-colors ${
            activeTab === 'recovery'
              ? 'border-[#0972D3] text-[#0972D3] font-bold'
              : 'border-transparent text-[#16191F] hover:text-[#0972D3]'
          }`}
        >
          Accelerated recovery
        </button>

        <button
          onClick={() => setActiveTab('dnssec')}
          className={`pb-2 border-b-2 transition-colors ${
            activeTab === 'dnssec'
              ? 'border-[#0972D3] text-[#0972D3] font-bold'
              : 'border-transparent text-[#16191F] hover:text-[#0972D3]'
          }`}
        >
          DNSSEC signing
        </button>

        <button
          onClick={() => setActiveTab('tags')}
          className={`pb-2 border-b-2 transition-colors ${
            activeTab === 'tags'
              ? 'border-[#0972D3] text-[#0972D3] font-bold'
              : 'border-transparent text-[#16191F] hover:text-[#0972D3]'
          }`}
        >
          Hosted zone tags ({userTags.length})
        </button>

        <button
          type="button"
          className="pb-2 text-slate-500 hover:text-slate-800 transition-colors"
          title="Next tabs"
        >
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* TAB 1: Records View */}
      {activeTab === 'records' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Section: Records Section Card (8 cols if expanded, 12 cols if collapsed) */}
          <div
            className={`${
              isInspectorCollapsed ? 'lg:col-span-12' : 'lg:col-span-8'
            } border border-slate-300 rounded-xl bg-white p-4 space-y-4 shadow-2xs transition-all duration-200`}
          >
            {/* Header Row: Section Title & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-[#16191F] tracking-tight">
                  Records{' '}
                  {selectedRecordIds.length > 0
                    ? `(${selectedRecordIds.length}/${totalRecords})`
                    : `(${totalRecords})`}
                </h2>
                {selectedRecordIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedRecordIds([])}
                    className="px-2 py-0.5 rounded border border-[#0972D3] bg-blue-50/50 text-[#0972D3] hover:bg-blue-100 text-[10px] font-semibold transition-colors cursor-pointer"
                    title="Clear selected records"
                  >
                    Clear selection
                  </button>
                )}
                <button
                  type="button"
                  className="text-[#0972D3] hover:underline text-[11px] font-normal"
                  onClick={(e) => e.preventDefault()}
                >
                  Info
                </button>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {isInspectorCollapsed && (
                  <button
                    onClick={() => setIsInspectorCollapsed(false)}
                    className="px-3 py-1 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-800 flex items-center space-x-1 transition-colors shadow-2xs mr-1"
                    title="Expand details panel"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 text-[#0972D3]" strokeWidth={2} />
                    <span>Record details</span>
                  </button>
                )}

                <button
                  onClick={() => refetchRecords()}
                  className="h-7 w-7 rounded-full border-2 border-[#0972D3] bg-white hover:bg-blue-50 flex items-center justify-center text-[#0972D3] transition-colors shadow-2xs"
                  title="Refresh"
                >
                  <RotateCw className="h-3.5 w-3.5 text-[#0972D3]" strokeWidth={2} />
                </button>

                <button
                  onClick={() => {
                    if (selectedRecord) setRecordToDelete(selectedRecord);
                  }}
                  disabled={selectedRecordIds.length === 0}
                  className={`px-3.5 py-1 rounded-full text-[11px] font-bold transition-colors shadow-2xs ${
                    selectedRecordIds.length === 0
                      ? 'border border-slate-300 bg-white text-[#879596] cursor-not-allowed'
                      : 'border-2 border-[#0972D3] text-[#0972D3] hover:bg-blue-50'
                  }`}
                >
                  {selectedRecordIds.length > 1 ? 'Delete records' : 'Delete record'}
                </button>

                <button
                  onClick={() => toast.info('Import zone file feature coming soon!')}
                  className="px-3.5 py-1 rounded-full border-2 border-[#0972D3] hover:bg-blue-50 text-[#0972D3] text-[11px] font-bold transition-colors shadow-2xs"
                >
                  Import zone file
                </button>

                <button
                  onClick={() => {
                    setRecordToEdit(null);
                    setFormErrorMsg(null);
                    setIsRecordModalOpen(true);
                  }}
                  className="px-3.5 py-1 rounded-full bg-[#ec7211] hover:bg-[#d65f00] text-slate-950 font-bold text-[11px] transition-colors shadow-2xs"
                >
                  Create record
                </button>
              </div>
            </div>

            {/* Subtitle / Helper notice */}
            <p className="text-[11px] text-[#16191F] font-normal leading-relaxed">
              Automatic mode is the current search behavior optimized for best filter results.{' '}
              <button
                type="button"
                onClick={() => toast.info('Filter settings coming soon!')}
                className="text-[#0972D3] hover:underline"
              >
                To change modes go to settings.
              </button>
            </p>

            {/* Filter Controls Row */}
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="w-full">
                <ZoneSearchBar
                  mode="records"
                  value={search}
                  onChange={(val) => {
                    setSearch(val);
                    setPage(1);
                  }}
                  tags={filterTags}
                  operator={operator}
                  onOperatorChange={(op) => setOperator(op)}
                  onAddTag={handleAddTagFilter}
                  onRemoveTag={handleRemoveTagFilter}
                  onClearFilters={handleClearFilters}
                  matchCount={totalRecords}
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                  selectedType={selectedType}
                  onTypeChange={(t) => {
                    setSelectedType(t);
                    setPage(1);
                  }}
                  selectedRoutingPolicy={selectedRoutingPolicy}
                  onRoutingPolicyChange={(r) => {
                    setSelectedRoutingPolicy(r);
                    setPage(1);
                  }}
                  selectedAlias={selectedAlias}
                  onAliasChange={(a) => {
                    setSelectedAlias(a);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {/* Records Table */}
            <div className="border border-slate-300 rounded-xl overflow-x-auto bg-white shadow-2xs">
              <table className="w-full text-xs text-left text-slate-800 font-sans">
                <thead className="bg-slate-50/90 border-b border-slate-300 text-[11px] font-semibold select-none text-slate-600">
                  <tr>
                    <th className="w-10 px-3 py-1.5 text-center border-r border-slate-200">
                      <input
                        type="checkbox"
                        checked={records.length > 0 && selectedRecordIds.length === records.length}
                        ref={(input) => {
                          if (input) {
                            input.indeterminate =
                              selectedRecordIds.length > 0 &&
                              selectedRecordIds.length < records.length;
                          }
                        }}
                        onChange={() => {
                          if (selectedRecordIds.length > 0) {
                            setSelectedRecordIds([]);
                          } else {
                            const currentPageIds = records.map((r) => r.id);
                            setSelectedRecordIds(currentPageIds);
                          }
                        }}
                        className="rounded border-slate-400 text-[#0972D3] focus:ring-[#0972D3]"
                      />
                    </th>
                    <th className="px-4 py-1.5 font-semibold text-slate-600 min-w-[150px] border-r border-slate-200">Record name ▼</th>
                    <th className="px-3 py-1.5 font-semibold text-slate-600 w-[70px] border-r border-slate-200">Type ▼</th>
                    <th className="px-3 py-1.5 font-semibold text-slate-600 w-[100px] border-r border-slate-200">Routing policy ▼</th>
                    <th className="px-3 py-1.5 font-semibold text-slate-600 w-[80px] border-r border-slate-200">Differentiator ▼</th>
                    <th className="px-3 py-1.5 font-semibold text-slate-600 w-[70px] border-r border-slate-200">Alias ▼</th>
                    <th className="px-4 py-1.5 font-semibold text-slate-600 min-w-[280px] border-r border-slate-200">Value/Route traffic to ▼</th>
                    <th className="px-3 py-1.5 font-semibold text-slate-600 w-[90px]">TTL (seconds) ▼</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {isRecordsLoading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="animate-pulse h-[40px]">
                        <td className="px-3 py-2 text-center">
                          <div className="h-3.5 w-3.5 bg-slate-200 rounded mx-auto"></div>
                        </td>
                        <td className="px-4 py-2"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                        <td className="px-3 py-2"><div className="h-4 bg-slate-200 rounded w-10"></div></td>
                        <td className="px-3 py-2"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                        <td className="px-3 py-2"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                        <td className="px-3 py-2"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                        <td className="px-4 py-2"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                        <td className="px-3 py-2"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                      </tr>
                    ))
                  ) : records.length === 0 ? (
                    <tr className="h-[80px]">
                      <td colSpan={8} className="px-4 py-6 text-center text-slate-500 font-sans italic">
                        No records found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    records.map((rec) => {
                      const isSelected = selectedRecordIds.includes(rec.id);
                      const formattedTtl = rec.ttl ? rec.ttl.toLocaleString('en-US') : '300';
                      const valueLines = rec.value.split('\n');

                      const toggleRow = () => {
                        if (isSelected) {
                          setSelectedRecordIds(selectedRecordIds.filter((id) => id !== rec.id));
                        } else {
                          setSelectedRecordIds([...selectedRecordIds, rec.id]);
                        }
                      };

                      return (
                        <tr
                          key={rec.id}
                          onClick={toggleRow}
                          className={`cursor-pointer transition-colors min-h-[40px] ${
                            isSelected ? 'bg-blue-50/90 font-medium' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-3 py-2 text-center align-top border-r border-slate-200">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={toggleRow}
                              className="rounded border-slate-400 text-[#0972D3] focus:ring-[#0972D3] mt-0.5"
                            />
                          </td>
                          <td className="px-4 py-2 font-normal text-slate-900 align-top leading-snug border-r border-slate-200">
                            {rec.name}
                          </td>
                          <td className="px-3 py-2 font-semibold text-slate-800 align-top leading-snug border-r border-slate-200">
                            {rec.type}
                          </td>
                          <td className="px-3 py-2 font-normal text-slate-700 align-top leading-snug border-r border-slate-200">
                            Simple
                          </td>
                          <td className="px-3 py-2 font-normal text-slate-500 align-top leading-snug border-r border-slate-200">
                            -
                          </td>
                          <td className="px-3 py-2 font-normal text-slate-700 align-top leading-snug border-r border-slate-200">
                            {(rec as any).alias ? 'Yes' : 'No'}
                          </td>
                          <td className="px-4 py-2 font-normal text-slate-800 align-top leading-snug whitespace-pre-wrap break-words border-r border-slate-200">
                            {valueLines.map((line, lIdx) => (
                              <div key={lIdx} className="leading-snug py-0.2">
                                {line}
                              </div>
                            ))}
                          </td>
                          <td className="px-3 py-2 font-normal text-slate-700 align-top leading-snug">
                            {formattedTtl}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Section: Collapsible Inspector Panel (~30% width) */}
          {!isInspectorCollapsed && (
            <div className="lg:col-span-4 border border-slate-300 rounded-2xl bg-white p-6 space-y-5 shadow-2xs min-h-[360px] font-sans animate-fadeIn">
              {/* Header matching user screenshots: "Record details" vs "2 records selected" vs "0 records selected" */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-[#16191F]">
                    {selectedRecordIds.length === 0
                      ? '0 records selected'
                      : selectedRecordIds.length === 1
                      ? 'Record details'
                      : `${selectedRecordIds.length} records selected`}
                  </h3>
                  {selectedRecordIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedRecordIds([])}
                      className="text-[#0972D3] hover:underline text-xs font-semibold"
                      title="Clear selection"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                    title="Preferences"
                  >
                    <Settings className="h-4 w-4 text-slate-600" strokeWidth={1.5} />
                  </button>
                  <div className="h-4 w-[1px] bg-slate-300 mx-0.5"></div>
                  <button
                    type="button"
                    onClick={() => setIsInspectorCollapsed(true)}
                    className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                    title="Collapse details panel"
                  >
                    <ChevronRight className="h-5 w-5 text-slate-700" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Case 1: Exactly 1 record selected (Screenshot 1) */}
              {selectedRecordIds.length === 1 && selectedRecord && (
                <div className="space-y-5 text-xs font-sans">
                  <div>
                    <button
                      onClick={() => {
                        setRecordToEdit(selectedRecord);
                        setFormErrorMsg(null);
                        setIsRecordModalOpen(true);
                      }}
                      className="px-5 py-1.5 rounded-full border border-[#0972D3] hover:bg-blue-50/50 text-[#0972D3] text-xs font-semibold transition-colors shadow-2xs"
                    >
                      Edit record
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-slate-600 font-medium text-xs mb-1">Record name</div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedRecord.name);
                            toast.success('Copied to clipboard');
                          }}
                          className="p-1 text-[#0972D3] hover:bg-blue-50 rounded"
                          title="Copy record name"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-normal text-slate-900 text-xs">{selectedRecord.name}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-600 font-medium text-xs mb-0.5">Record type</div>
                      <div className="font-normal text-slate-900 text-xs">{selectedRecord.type}</div>
                    </div>

                    <div>
                      <div className="text-slate-600 font-medium text-xs mb-1">Value</div>
                      <div className="space-y-1">
                        {selectedRecord.value.split('\n').map((valLine, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(valLine);
                                toast.success('Copied to clipboard');
                              }}
                              className="p-1 text-[#0972D3] hover:bg-blue-50 rounded shrink-0"
                              title="Copy value line"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <span className="font-normal text-slate-900 text-xs break-all">{valLine}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-600 font-medium text-xs mb-0.5">Alias</div>
                      <div className="font-normal text-slate-900 text-xs">
                        {(selectedRecord as any).alias ? 'Yes' : 'No'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-600 font-medium text-xs mb-0.5">TTL (seconds)</div>
                      <div className="font-normal text-slate-900 text-xs">
                        {selectedRecord.ttl ? selectedRecord.ttl.toLocaleString('en-US') : '300'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-600 font-medium text-xs mb-0.5">Routing policy</div>
                      <div className="font-normal text-slate-900 text-xs">Simple</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Case 2: Multi-records selected (>1 selected) (Screenshot 2) */}
              {selectedRecordIds.length > 1 && (
                <div className="space-y-4 py-2">
                  <p className="text-xs text-slate-600">
                    {selectedRecordIds.length} records selected in this hosted zone.
                  </p>
                  <div className="border border-slate-200 rounded-lg p-3 max-h-[220px] overflow-y-auto space-y-2 bg-slate-50/50">
                    {rawRecords
                      .filter((r) => selectedRecordIds.includes(r.id))
                      .map((r) => (
                        <div key={r.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-200 last:border-0">
                          <span className="font-medium text-slate-800">{r.name}</span>
                          <span className="text-slate-500 font-mono text-[11px]">{r.type}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Case 3: 0 records selected */}
              {selectedRecordIds.length === 0 && (
                <div className="flex flex-col items-start py-2 text-left space-y-1">
                  <p className="text-xs text-slate-600">
                    Select a record to see its details
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Accelerated recovery (matching Screenshot 1) */}
      {activeTab === 'recovery' && (
        <div className="border border-slate-300 rounded-2xl bg-white p-6 space-y-4 shadow-2xs font-sans">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-[#16191F] tracking-tight">Accelerated recovery</h2>
              <button className="text-[#0972D3] hover:underline text-xs font-normal">Info</button>
            </div>
            <button
              onClick={() => toast.info('Accelerated recovery feature coming soon!')}
              className="px-5 py-1.5 rounded-full border border-[#0972D3] hover:bg-blue-50 text-[#0972D3] font-semibold text-xs transition-colors shadow-2xs"
            >
              Enable
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Enable the accelerated recovery option to ensure that you can continue to make changes to your public DNS records after an impairment to US East (N. Virginia).
          </p>

          <div className="pt-2">
            <div className="text-xs font-bold text-[#16191F]">Status</div>
            <div className="flex items-center space-x-1 text-xs text-slate-600 mt-1">
              <span className="text-slate-400 font-bold">⊝</span>
              <span>Disabled</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DNSSEC signing (matching Screenshot 2) */}
      {activeTab === 'dnssec' && (
        <div className="space-y-6 font-sans">
          {/* Card 1: Status & Banner */}
          <div className="border border-slate-300 rounded-2xl bg-white p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-[#16191F] tracking-tight">DNSSEC signing</h2>
                <button className="text-[#0972D3] hover:underline text-xs font-normal">Info</button>
              </div>
              <button
                onClick={() => toast.info('DNSSEC signing feature coming soon!')}
                className="px-5 py-1.5 rounded-full border border-[#0972D3] hover:bg-blue-50 text-[#0972D3] font-semibold text-xs transition-colors shadow-2xs"
              >
                Enable DNSSEC signing
              </button>
            </div>

            <div>
              <div className="text-xs font-bold text-[#16191F]">DNSSEC signing status</div>
              <div className="flex items-center space-x-1 text-xs text-slate-600 mt-1">
                <span className="text-slate-400 font-bold">⊝</span>
                <span>Not signing</span>
              </div>
            </div>

            {/* Blue Alert Banner */}
            <div className="border border-[#0972D3] bg-[#f2f8fd] rounded-xl p-4 flex items-start justify-between text-xs text-slate-800 space-x-3">
              <div className="flex items-start space-x-2.5">
                <span className="text-[#0972D3] font-bold text-base leading-none mt-0.5">ⓘ</span>
                <div className="space-y-1">
                  <div className="font-bold text-[#16191F]">
                    You have not enabled DNSSEC signing for this hosted zone
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    To enable DNSSEC signing and have Route 53 create a key-signing key (KSK) for you, choose Enable DNSSEC signing. Next, you must establish a DNSSEC chain of trust for your hosted zone. You'll complete this step after you enable DNSSEC signing.
                  </p>
                </div>
              </div>
              <button className="text-slate-500 hover:text-slate-800 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Card 2: KSK Table */}
          <div className="border border-slate-300 rounded-2xl bg-white p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-[#16191F] tracking-tight">Key-signing keys (KSKs)</h2>
                <button className="text-[#0972D3] hover:underline text-xs font-normal">Info</button>
              </div>

              <div className="flex items-center space-x-2">
                <button className="px-4 py-1.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 shadow-2xs">
                  View details
                </button>
                <button className="px-4 py-1.5 rounded-full border border-[#0972D3] text-[#0972D3] hover:bg-blue-50 text-xs font-semibold transition-colors shadow-2xs">
                  Switch to advanced view
                </button>
              </div>
            </div>

            <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-xs text-left text-slate-800">
                <thead className="bg-slate-50 border-b border-slate-300 text-xs font-semibold select-none text-slate-900">
                  <tr>
                    <th className="px-4 py-3">Name ▲</th>
                    <th className="px-4 py-3">Status ▼</th>
                    <th className="px-4 py-3">Creation date ▼</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500 italic">
                      No key-signing keys created.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Hosted zone tags (matching Screenshot 3) */}
      {activeTab === 'tags' && (
        <div className="border border-slate-300 rounded-2xl bg-white p-6 space-y-4 shadow-2xs font-sans">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-[#16191F] tracking-tight">Tags</h2>
            <button
              onClick={() => {
                setEditTags(userTags.length > 0 ? [...userTags] : [{ key: '', value: '' }]);
                setIsManageTagsOpen(true);
              }}
              className="px-5 py-1.5 rounded-full border border-[#0972D3] hover:bg-blue-50 text-[#0972D3] font-semibold text-xs transition-colors shadow-2xs"
            >
              Manage tags
            </button>
          </div>

          {/* Search Bar & Pagination */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search"
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#0972D3]"
              />
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <ChevronLeft className="h-4 w-4 text-slate-400 cursor-not-allowed" />
              <span className="font-semibold text-slate-900">1</span>
              <ChevronRight className="h-4 w-4 text-slate-400 cursor-not-allowed" />
            </div>
          </div>

          {/* Tags Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
            <table className="w-full text-xs text-left text-slate-800">
              <thead className="bg-slate-50 border-b border-slate-300 text-xs font-semibold text-slate-900 select-none">
                <tr>
                  <th className="px-4 py-3 w-1/2">Key ▲</th>
                  <th className="px-4 py-3 w-1/2">Value ▼</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUserTags.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-slate-500 italic">
                      No tags associated with this hosted zone.
                    </td>
                  </tr>
                ) : (
                  filteredUserTags.map((tag, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-normal text-slate-900">{tag.key}</td>
                      <td className="px-4 py-3 font-normal text-slate-900">{tag.value}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Manage Tags Modal */}
      <Modal
        isOpen={isManageTagsOpen}
        onClose={() => setIsManageTagsOpen(false)}
        title="Manage tags"
        onConfirm={handleSaveManagedTags}
        confirmText="Save changes"
        isConfirmLoading={updateTagsMutation.isPending}
      >
        <div className="space-y-4 text-xs font-sans">
          <p className="text-slate-600">
            Add or edit tags for {domainDisplayName}.
          </p>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {editTags.map((t, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Key"
                  value={t.key}
                  onChange={(e) =>
                    setEditTags(
                      editTags.map((item, i) => (i === idx ? { ...item, key: e.target.value } : item))
                    )
                  }
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={t.value}
                  onChange={(e) =>
                    setEditTags(
                      editTags.map((item, i) => (i === idx ? { ...item, value: e.target.value } : item))
                    )
                  }
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs"
                />
                <button
                  type="button"
                  onClick={() => setEditTags(editTags.filter((_, i) => i !== idx))}
                  className="p-1 text-slate-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setEditTags([...editTags, { key: '', value: '' }])}
            className="px-3 py-1 border border-slate-300 rounded text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            + Add tag
          </button>
        </div>
      </Modal>

      {/* Modal: Delete Zone Confirmation */}
      <Modal
        isOpen={isDeleteZoneModalOpen}
        onClose={() => setIsDeleteZoneModalOpen(false)}
        title="Delete hosted zone"
        onConfirm={() => deleteZoneMutation.mutate()}
        confirmText="Delete"
        confirmVariant="danger"
        isConfirmLoading={deleteZoneMutation.isPending}
      >
        <p className="text-xs text-slate-700">
          Are you sure you want to delete the hosted zone <strong className="text-slate-900">{domainDisplayName}</strong>?
        </p>
        <p className="text-xs text-red-600 font-medium mt-2">
          Warning: This action is permanent and will delete all associated DNS records.
        </p>
      </Modal>

      {/* Record Create / Edit Form Modal */}
      <RecordFormModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setRecordToEdit(null);
        }}
        onSubmit={handleRecordFormSubmit}
        recordToEdit={recordToEdit}
        zoneDomainName={domainDisplayName}
        isPending={createRecordMutation.isPending || updateRecordMutation.isPending}
        errorMsg={formErrorMsg}
      />

      {/* Delete Record Confirmation Modal */}
      <Modal
        isOpen={recordToDelete !== null}
        onClose={() => setRecordToDelete(null)}
        title="Delete record"
        onConfirm={() => recordToDelete && deleteRecordMutation.mutate(recordToDelete.id)}
        confirmText="Delete"
        confirmVariant="danger"
        isConfirmLoading={deleteRecordMutation.isPending}
      >
        <p className="text-xs text-slate-700">
          Are you sure you want to delete the <strong className="text-[#16191F]">{recordToDelete?.type}</strong> record for{' '}
          <strong className="text-[#16191F]">{recordToDelete?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}
