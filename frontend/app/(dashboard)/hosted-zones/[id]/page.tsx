'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../lib/api';
import { DNSRecord, HostedZone, RecordType } from '../../../../lib/types';
import { useDebounce } from '../../../../hooks/useDebounce';
import { useToast } from '../../../../hooks/useToast';
import RecordFormModal from '../../../../components/dns-records/RecordFormModal';
import ZoneSearchBar from '../../../../components/hosted-zones/ZoneSearchBar';
import Modal from '../../../../components/ui/Modal';
import DeleteZoneModal from '../../../../components/hosted-zones/DeleteZoneModal';
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
  const isEdited = searchParams.get('edited') === 'true';
  const createdDomain = searchParams.get('domain') || '';
  const editedDomain = searchParams.get('domain') || '';

  const [showBanner, setShowBanner] = useState(isNewlyCreated || isEdited);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'records' | 'recovery' | 'dnssec' | 'tags'>('records');

  // Hosted Zone Delete Modal State
  const [isDeleteZoneModalOpen, setIsDeleteZoneModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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

  // Inline Edit State
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [editVersion, setEditVersion] = useState(0);
  const [localRecords, setLocalRecords] = useState<DNSRecord[]>([]);
  const [inlineEditForm, setInlineEditForm] = useState({
    name: '',
    type: 'A' as RecordType,
    value: '',
    ttl: 300,
    alias: false,
    routing_policy: 'Simple routing',
    region: '',
    failure_type: 'Primary',
    priority: undefined as number | undefined,
  });
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteSearch, setDeleteSearch] = useState('');
  const [deleteFilterTags, setDeleteFilterTags] = useState<string[]>([]);
  const [selectedDeleteRecordIds, setSelectedDeleteRecordIds] = useState<string[]>([]);
  const [deleteSearchProperty, setDeleteSearchProperty] = useState<'name' | 'type' | 'value'>('name');
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  // Fetch Hosted Zone Details
  const { data: zone } = useQuery({
    queryKey: ['hosted-zone', zoneId],
    queryFn: () => api.getHostedZone(zoneId),
  });

  const domainDisplayName = zone?.domain_name || createdDomain || editedDomain || 'Hosted zone';

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
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
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
      const recAliasStr = rec.alias ? 'Yes' : 'No';

      if (selectedType !== 'all' && rec.type !== selectedType) {
        return false;
      }
      if (selectedRoutingPolicy !== 'all') {
        const recRouting = (rec.routing_policy || 'Simple routing').toLowerCase();
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
            const recRouting = (rec.routing_policy || 'Simple routing').toLowerCase();
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
      console.log('=== BACKEND RESPONSE ===');
      console.log('Updated record from backend:', updatedRec);
      console.log('=======================');
      
      toast.success(`Record for ${updatedRec.name} updated successfully.`);
      setIsRecordModalOpen(false);
      setRecordToEdit(null);
      setIsInlineEditing(false);
      
      // Manually update cache with server response
      queryClient.setQueryData(['records', zoneId], (oldData: any) => {
        if (!oldData?.items) return oldData;
        console.log('Cache before:', oldData.items.find((r: DNSRecord) => r.id === updatedRec.id));
        const newData = {
          ...oldData,
          items: oldData.items.map((rec: DNSRecord) =>
            rec.id === updatedRec.id ? updatedRec : rec
          ),
        };
        console.log('Cache after:', newData.items.find((r: DNSRecord) => r.id === updatedRec.id));
        return newData;
      });
      
      queryClient.invalidateQueries({ queryKey: ['records', zoneId] });
    },
    onError: (err: any) => {
      console.error('=== BACKEND ERROR ===');
      console.error('Error details:', err);
      console.error('===================');
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

  // Delete Multiple Records Mutation
  const deleteMultipleRecordsMutation = useMutation({
    mutationFn: (recIds: string[]) => Promise.all(recIds.map(id => api.deleteRecord(zoneId, id))),
    onSuccess: () => {
      toast.success(`${selectedDeleteRecordIds.length} DNS record(s) deleted successfully.`);
      setIsDeleteModalOpen(false);
      setSelectedDeleteRecordIds([]);
      setDeleteSearch('');
      setDeleteFilterTags([]);
      queryClient.invalidateQueries({ queryKey: ['records', zoneId] });
      queryClient.invalidateQueries({ queryKey: ['hosted-zone', zoneId] });
    },
    onError: (err: any) => {
      toast.error(err.detail || 'Failed to delete records.');
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
    console.log('=== FORM SUBMIT ===');
    console.log('Is edit:', !!recordToEdit);
    console.log('Record to edit:', recordToEdit);
    console.log('Form data:', data);
    
    if (recordToEdit) {
      // Only include priority in payload if it's defined or if the record type requires it
      const payload = { ...data };
      if (payload.priority === undefined && data.type !== 'MX' && data.type !== 'SRV') {
        delete payload.priority;
      }
      updateRecordMutation.mutate({ id: recordToEdit.id, payload });
    } else {
      createRecordMutation.mutate(data);
    }
  };

  const handleStartInlineEdit = () => {
    if (selectedRecord) {
      setInlineEditForm({
        name: selectedRecord.name,
        type: selectedRecord.type,
        value: selectedRecord.value,
        ttl: selectedRecord.ttl,
        alias: selectedRecord.alias,
        routing_policy: selectedRecord.routing_policy || 'Simple routing',
        region: '',
        failure_type: 'Primary',
        priority: selectedRecord.priority ?? undefined,
      });
      setIsInlineEditing(true);
    }
  };

  const handleInlineSave = () => {
    if (selectedRecord) {
      console.log('=== INLINE EDIT SUBMIT ===');
      console.log('Form values:', inlineEditForm);
      console.log('Current record:', selectedRecord);
      
      const payload: any = {
        name: inlineEditForm.name,
        type: inlineEditForm.type,
        value: inlineEditForm.value,
        ttl: inlineEditForm.ttl,
        alias: inlineEditForm.alias,
        routing_policy: inlineEditForm.routing_policy,
      };
      
      // Only include priority if it's defined or if the record type requires it
      if (inlineEditForm.priority !== undefined || inlineEditForm.type === 'MX' || inlineEditForm.type === 'SRV') {
        payload.priority = inlineEditForm.priority;
      }
      
      updateRecordMutation.mutate({
        id: selectedRecord.id,
        payload,
      });
    }
  };

  const handleInlineCancel = () => {
    setIsInlineEditing(false);
  };

  const zoneTypeLabel = zone?.type ? zone.type.toLowerCase() : 'public';

  return (
    <div className="flex flex-col space-y-8 font-sans max-w-[1650px] w-full text-[#16191F] dark:text-white pb-8">
      {/* 1. Full-width Green Success Banner */}
      {showBanner && (
        <div className="bg-[#037f0c] text-white p-4 rounded-xl flex items-start justify-between shadow-2xs transition-all animate-fadeIn w-full">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 shrink-0">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-snug">
                {isEdited ? `${domainDisplayName} was successfully updated.` : `${domainDisplayName} was successfully created.`}
              </h2>
              <p className="text-xs text-white/90 mt-0.5">
                {isEdited ? 'Hosted zone details were successfully updated.' : 'Now you can create records in the hosted zone to specify how you want Route 53 to route traffic for your domain.'}
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
          <h1 className="text-lg sm:text-xl font-bold text-[#16191F] dark:text-white tracking-tight">
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
      <div className="border border-[#d5dbdb] rounded-lg bg-white p-4 font-sans">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
        >
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-[#16191F] dark:text-white font-bold">
              {isDetailsExpanded ? '▼' : '►'}
            </span>
            <h2 className="text-base font-bold text-[#16191F] dark:text-white">Hosted zone details</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 mt-3 border-t border-[#d5dbdb] text-xs">
            {/* Column 1: Zone Name, ID, Description */}
            <div className="space-y-2.5">
              <div>
                <div className="font-bold text-[#16191F] dark:text-white text-[11px]">Hosted zone name</div>
                <div className="text-[#16191F] dark:text-white text-[11px] mt-0.5">{domainDisplayName}</div>
              </div>

              <div>
                <div className="font-bold text-[#16191F] dark:text-white text-[11px]">Hosted zone ID</div>
                <div className="text-[#16191F] dark:text-white text-[11px] mt-0.5">{zone?.id || zoneId}</div>
              </div>

              <div>
                <div className="font-bold text-[#16191F] dark:text-white text-[11px]">Description</div>
                <div className="text-[#16191F] dark:text-white text-[11px] mt-0.5">{zone?.description || '-'}</div>
              </div>
            </div>

            {/* Column 2: Query Log, Type, Record Count */}
            <div className="space-y-2.5 md:border-l md:border-slate-200 md:pl-5">
              <div>
                <div className="font-bold text-[#16191F] dark:text-white text-[11px]">Query log</div>
                <div className="text-[#16191F] dark:text-white text-[11px] mt-0.5">-</div>
              </div>

              <div>
                <div className="font-bold text-[#16191F] dark:text-white text-[11px]">Type</div>
                <div className="text-[#16191F] dark:text-white text-[11px] mt-0.5">
                  {zoneTypeLabel === 'public' ? 'Public hosted zone' : 'Private hosted zone'}
                </div>
              </div>

              <div>
                <div className="font-bold text-[#16191F] dark:text-white text-[11px]">Record count</div>
                <div className="text-[#16191F] dark:text-white text-[11px] mt-0.5">{rawRecords.length}</div>
              </div>
            </div>

            {/* Column 3: Name Servers */}
            <div className="space-y-2.5 md:border-l md:border-slate-200 md:pl-5">
              <div>
                <div className="font-bold text-[#16191F] dark:text-white text-[11px]">Name servers</div>
                <div className="text-[#16191F] dark:text-white text-[11px] mt-0.5 space-y-0.5">
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
      <div className="border-b border-[#d5dbdb] font-sans select-none flex items-center space-x-6 text-xs pt-1">
        <button
          type="button"
          className="pb-2.5 text-[#5f6b7a] hover:text-[#16191F] transition-colors"
          title="Previous tabs"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`pb-2.5 border-b-2 transition-colors ${
            activeTab === 'records'
              ? 'border-[#0972D3] text-[#0972D3] font-semibold'
              : 'border-transparent text-[#5f6b7a] hover:text-[#0972D3]'
          }`}
        >
          Records ({rawRecords.length})
        </button>

        <button
          onClick={() => setActiveTab('recovery')}
          className={`pb-2.5 border-b-2 transition-colors ${
            activeTab === 'recovery'
              ? 'border-[#0972D3] text-[#0972D3] font-semibold'
              : 'border-transparent text-[#5f6b7a] hover:text-[#0972D3]'
          }`}
        >
          Accelerated recovery
        </button>

        <button
          onClick={() => setActiveTab('dnssec')}
          className={`pb-2.5 border-b-2 transition-colors ${
            activeTab === 'dnssec'
              ? 'border-[#0972D3] text-[#0972D3] font-semibold'
              : 'border-transparent text-[#5f6b7a] hover:text-[#0972D3]'
          }`}
        >
          DNSSEC signing
        </button>

        <button
          onClick={() => setActiveTab('tags')}
          className={`pb-2.5 border-b-2 transition-colors ${
            activeTab === 'tags'
              ? 'border-[#0972D3] text-[#0972D3] font-semibold'
              : 'border-transparent text-[#5f6b7a] hover:text-[#0972D3]'
          }`}
        >
          Hosted zone tags ({userTags.length})
        </button>

        <button
          type="button"
          className="pb-2.5 text-[#5f6b7a] hover:text-[#16191F] transition-colors"
          title="Next tabs"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* TAB 1: Records View */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {/* Records Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d5dbdb] pb-4">
            <div className="flex items-center space-x-3">
              <h2 className="text-base font-bold text-[#16191F] dark:text-white tracking-tight">
                Records{' '}
                {selectedRecordIds.length > 0
                  ? `(${selectedRecordIds.length}/${totalRecords})`
                  : `(${totalRecords})`}
              </h2>
              {selectedRecordIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedRecordIds([])}
                  className="px-2.5 py-1 rounded border border-[#0972D3] bg-blue-50/50 text-[#0972D3] hover:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer"
                  title="Clear selected records"
                >
                  Clear selection
                </button>
              )}
              <button
                type="button"
                className="text-[#0972D3] hover:underline text-xs font-normal"
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
                  className="px-3 py-1.5 rounded-full border border-[#d5dbdb] bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center space-x-1.5 transition-colors"
                  title="Expand details panel"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-[#0972D3]" strokeWidth={2} />
                  <span>Record details</span>
                </button>
              )}

              <button
                onClick={() => refetchRecords()}
                className="h-8 w-8 rounded-full border border-[#d5dbdb] bg-white hover:bg-slate-50 flex items-center justify-center text-[#5f6b7a] hover:text-[#16191F] transition-colors"
                title="Refresh"
              >
                <RotateCw className="h-3.5 w-3.5" strokeWidth={2} />
              </button>

              <button
                onClick={() => {
                  setIsDeleteModalOpen(true);
                  setSelectedDeleteRecordIds(selectedRecordIds);
                }}
                disabled={selectedRecordIds.length === 0}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  selectedRecordIds.length === 0
                    ? 'border border-[#d5dbdb] bg-white text-[#879596] cursor-not-allowed'
                    : 'border border-[#0972D3] text-[#0972D3] hover:bg-blue-50'
                }`}
              >
                {selectedRecordIds.length > 1 ? 'Delete records' : 'Delete record'}
              </button>

              <button
                onClick={() => toast.info('Import zone file feature coming soon!')}
                className="px-3.5 py-1.5 rounded-full border border-[#0972D3] hover:bg-blue-50 text-[#0972D3] text-xs font-bold transition-colors"
              >
                Import zone file
              </button>

              <button
                onClick={() => {
                  router.push(`/hosted-zones/${zoneId}/create-record`);
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#ec7211] hover:bg-[#d65f00] text-white font-bold text-xs transition-colors"
              >
                Create record
              </button>
            </div>
          </div>

          {/* Records Workspace: Filter + Table + Details Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Filter + Table */}
            <div className={`${isInspectorCollapsed ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-4`}>
              {/* Subtitle / Helper notice */}
              <p className="text-xs text-[#5f6b7a] font-normal leading-relaxed">
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
            <div className="border border-[#d5dbdb] rounded-lg overflow-x-auto bg-white">
              <table className="w-full text-xs text-left text-slate-800 dark:text-slate-300 font-sans">
                <thead className="bg-slate-50 border-b border-[#d5dbdb] text-xs font-normal select-none text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="w-10 px-3 py-2 text-center border-r border-[#d5dbdb]">
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
                    <th className="px-4 py-2 font-normal min-w-[150px] border-r border-[#d5dbdb]">
                      <div className="flex items-center justify-between space-x-1">
                        <span>Record name</span>
                        <span className="text-slate-400 text-[9px]">▼</span>
                      </div>
                    </th>
                    <th className="px-3 py-2 font-normal w-[70px] border-r border-[#d5dbdb]">
                      <div className="flex items-center justify-between space-x-1">
                        <span>Type</span>
                        <span className="text-slate-400 text-[9px]">▼</span>
                      </div>
                    </th>
                    <th className="px-3 py-2 font-normal w-[100px] border-r border-[#d5dbdb]">
                      <div className="flex items-center justify-between space-x-1">
                        <span>Routing policy</span>
                        <span className="text-slate-400 text-[9px]">▼</span>
                      </div>
                    </th>
                    <th className="px-3 py-2 font-normal w-[80px] border-r border-[#d5dbdb]">
                      <div className="flex items-center justify-between space-x-1">
                        <span>Differentiator</span>
                        <span className="text-slate-400 text-[9px]">▼</span>
                      </div>
                    </th>
                    <th className="px-3 py-2 font-normal w-[70px] border-r border-[#d5dbdb]">
                      <div className="flex items-center justify-between space-x-1">
                        <span>Alias</span>
                        <span className="text-slate-400 text-[9px]">▼</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 font-normal min-w-[280px] border-r border-[#d5dbdb]">
                      <div className="flex items-center justify-between space-x-1">
                        <span>Value/Route traffic to</span>
                        <span className="text-slate-400 text-[9px]">▼</span>
                      </div>
                    </th>
                    <th className="px-3 py-2 font-normal w-[90px] border-r border-[#d5dbdb]">
                      <div className="flex items-center justify-between space-x-1">
                        <span>TTL (seconds)</span>
                        <span className="text-slate-400 text-[9px]">▼</span>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#d5dbdb] bg-white">
                  {isRecordsLoading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="animate-pulse h-[44px]">
                        <td className="px-3 py-2.5 text-center">
                          <div className="h-3.5 w-3.5 bg-slate-200 rounded mx-auto"></div>
                        </td>
                        <td className="px-4 py-2.5"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                        <td className="px-3 py-2.5"><div className="h-4 bg-slate-200 rounded w-10"></div></td>
                        <td className="px-3 py-2.5"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                        <td className="px-3 py-2.5"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                        <td className="px-3 py-2.5"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                        <td className="px-4 py-2.5"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                        <td className="px-3 py-2.5"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
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
                          className={`cursor-pointer transition-colors min-h-[44px] ${
                            isSelected ? 'bg-[#e8f0fe] font-medium' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-3 py-2.5 text-center align-top border-r border-[#d5dbdb]">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={toggleRow}
                              className="rounded border-slate-400 text-[#0972D3] focus:ring-[#0972D3] mt-0.5"
                            />
                          </td>
                          <td className="px-4 py-2.5 font-normal text-slate-900 dark:text-slate-300 align-top leading-snug border-r border-[#d5dbdb] dark:border-[#384252]">
                            {rec.name}
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-300 align-top leading-snug border-r border-[#d5dbdb] dark:border-[#384252]">
                            {rec.type}
                          </td>
                          <td className="px-3 py-2.5 font-normal text-slate-700 dark:text-slate-300 align-top leading-snug border-r border-[#d5dbdb] dark:border-[#384252]">
                            {rec.routing_policy || 'Simple routing'}
                          </td>
                          <td className="px-3 py-2.5 font-normal text-slate-500 align-top leading-snug border-r border-[#d5dbdb]">
                            -
                          </td>
                          <td className="px-3 py-2.5 font-normal text-slate-700 dark:text-slate-300 align-top leading-snug border-r border-[#d5dbdb] dark:border-[#384252]">
                            {rec.alias ? 'Yes' : 'No'}
                          </td>
                          <td className="px-4 py-2.5 font-normal text-slate-800 dark:text-slate-300 align-top leading-snug whitespace-pre-wrap break-words border-r border-[#d5dbdb] dark:border-[#384252]">
                            {valueLines.map((line, lIdx) => (
                              <div key={lIdx} className="leading-snug py-0.2">
                                {line}
                              </div>
                            ))}
                          </td>
                          <td className="px-3 py-2.5 font-normal text-slate-700 dark:text-slate-300 align-top leading-snug">
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
            <div className="lg:col-span-4 border border-[#d5dbdb] dark:border-slate-700 rounded-lg bg-white dark:bg-[#16191F] p-5 space-y-5 min-h-[400px] font-sans">
              {/* Header matching user screenshots: "Record details" vs "2 records selected" vs "0 records selected" */}
              <div className="flex items-center justify-between border-b border-[#d5dbdb] pb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-[#16191F] dark:text-white">
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
                    className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    title="Preferences"
                  >
                    <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" strokeWidth={1.5} />
                  </button>
                  <div className="h-4 w-[1px] bg-slate-300 mx-0.5"></div>
                  <button
                    type="button"
                    onClick={() => setIsInspectorCollapsed(true)}
                    className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    title="Collapse details panel"
                  >
                    <ChevronRight className="h-5 w-5 text-slate-700 dark:text-slate-400" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Case 1: Exactly 1 record selected (Screenshot 1) */}
              {selectedRecordIds.length === 1 && selectedRecord && (
                <div className="space-y-5 text-xs font-sans">
                  <div>
                    {!isInlineEditing ? (
                      <button
                        onClick={handleStartInlineEdit}
                        className="px-5 py-1.5 rounded-full border border-[#0972D3] hover:bg-blue-50/50 text-[#0972D3] text-xs font-semibold transition-colors"
                      >
                        Edit record
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleInlineSave}
                          disabled={updateRecordMutation.isPending}
                          className="px-4 py-1.5 rounded-full bg-[#ec7211] hover:bg-[#d65f00] text-white font-bold text-xs transition-colors disabled:opacity-50"
                        >
                          {updateRecordMutation.isPending ? 'Saving...' : 'Save changes'}
                        </button>
                        <button
                          onClick={handleInlineCancel}
                          disabled={updateRecordMutation.isPending}
                          className="px-4 py-1.5 rounded-full border border-[#d5dbdb] hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-5">
                    {isInlineEditing ? (
                      // Edit Mode
                      <>
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <label className="text-[#5f6b7a] dark:text-slate-400 font-semibold text-xs">Record name</label>
                            <span className="text-[#0972D3] text-xs font-medium cursor-pointer hover:underline">Info</span>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={inlineEditForm.name}
                              onChange={(e) => setInlineEditForm({ ...inlineEditForm, name: e.target.value })}
                              className="flex-1 px-2.5 py-2 border border-[#d5dbdb] dark:border-slate-700 rounded-l text-xs text-[#16191F] dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
                            />
                            <span className="inline-flex items-center px-3 py-2 rounded-r border border-l-0 border-[#d5dbdb] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-[#5f6b7a] dark:text-slate-400">
                              .{domainDisplayName}
                            </span>
                          </div>
                          <p className="text-xs text-[#5f6b7a] dark:text-slate-400 mt-1.5">
                            Keep blank to create a record for the root domain.
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <label className="text-[#5f6b7a] dark:text-slate-400 font-semibold text-xs">Record type</label>
                            <span className="text-[#0972D3] text-xs font-medium cursor-pointer hover:underline">Info</span>
                          </div>
                          <select
                            value={inlineEditForm.type}
                            onChange={(e) => setInlineEditForm({ ...inlineEditForm, type: e.target.value as RecordType })}
                            className="w-full px-2.5 py-2 border border-[#d5dbdb] dark:border-slate-700 rounded text-xs text-[#16191F] dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
                          >
                            <option value="A">A – Routes traffic to an IPv4 address and some AWS resources</option>
                            <option value="AAAA">AAAA – Routes traffic to an IPv6 address</option>
                            <option value="CNAME">CNAME – Routes traffic to another domain name</option>
                            <option value="MX">MX – Specifies mail servers</option>
                            <option value="NS">NS – Specifies name servers for a zone</option>
                            <option value="PTR">PTR – Maps IP address to domain name</option>
                            <option value="SOA">SOA – Start of authority record</option>
                            <option value="SRV">SRV – Specifies services and ports</option>
                            <option value="TXT">TXT – Arbitrary text record</option>
                            <option value="CAA">CAA – Specifies authorized CAs</option>
                          </select>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <label className="text-[#5f6b7a] dark:text-slate-400 font-semibold text-xs">Alias</label>
                            <span className="text-[#0972D3] text-xs font-medium cursor-pointer hover:underline">Info</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => setInlineEditForm({ ...inlineEditForm, alias: !inlineEditForm.alias })}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                inlineEditForm.alias ? 'bg-[#0972D3]' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  inlineEditForm.alias ? 'translate-x-5' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                            <span className="text-xs text-slate-700 dark:text-slate-300">{inlineEditForm.alias ? 'Yes' : 'No'}</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <label className="text-[#5f6b7a] dark:text-slate-400 font-semibold text-xs">Value</label>
                            <span className="text-[#0972D3] text-xs font-medium cursor-pointer hover:underline">Info</span>
                          </div>
                          <textarea
                            value={inlineEditForm.value}
                            onChange={(e) => setInlineEditForm({ ...inlineEditForm, value: e.target.value })}
                            rows={4}
                            className="w-full px-2.5 py-2 border border-[#d5dbdb] dark:border-slate-700 rounded text-xs text-[#16191F] dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
                          />
                          <p className="text-xs text-[#5f6b7a] dark:text-slate-400 mt-1.5">
                            Enter multiple values on separate lines.
                          </p>
                        </div>

                        {/* Priority (for MX / SRV) */}
                        {(inlineEditForm.type === 'MX' || inlineEditForm.type === 'SRV') && (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <label className="text-[#5f6b7a] dark:text-slate-400 font-semibold text-xs">Priority</label>
                              <span className="text-[#0972D3] text-xs font-medium cursor-pointer hover:underline">Info</span>
                            </div>
                            <input
                              type="number"
                              value={inlineEditForm.priority ?? 10}
                              onChange={(e) => setInlineEditForm({ ...inlineEditForm, priority: Number(e.target.value) })}
                              min={0}
                              max={65535}
                              className="w-24 px-2.5 py-2 border border-[#d5dbdb] dark:border-slate-700 rounded text-xs text-[#16191F] dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
                            />
                          </div>
                        )}

                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <label className="text-[#5f6b7a] dark:text-slate-400 font-semibold text-xs">TTL (seconds)</label>
                            <span className="text-[#0972D3] text-xs font-medium cursor-pointer hover:underline">Info</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={inlineEditForm.ttl}
                              onChange={(e) => setInlineEditForm({ ...inlineEditForm, ttl: parseInt(e.target.value) || 300 })}
                              className="w-24 px-2.5 py-2 border border-[#d5dbdb] dark:border-slate-700 rounded text-xs text-[#16191F] dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
                            />
                            <button
                              onClick={() => setInlineEditForm({ ...inlineEditForm, ttl: 60 })}
                              className={`px-2.5 py-1.5 border rounded text-xs ${
                                inlineEditForm.ttl === 60
                                  ? 'border-[#0972D3] bg-blue-50 dark:bg-blue-900/30 text-[#0972D3] dark:text-blue-400'
                                  : 'border-[#d5dbdb] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              1m
                            </button>
                            <button
                              onClick={() => setInlineEditForm({ ...inlineEditForm, ttl: 3600 })}
                              className={`px-2.5 py-1.5 border rounded text-xs ${
                                inlineEditForm.ttl === 3600
                                  ? 'border-[#0972D3] bg-blue-50 dark:bg-blue-900/30 text-[#0972D3] dark:text-blue-400'
                                  : 'border-[#d5dbdb] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              1h
                            </button>
                            <button
                              onClick={() => setInlineEditForm({ ...inlineEditForm, ttl: 86400 })}
                              className={`px-2.5 py-1.5 border rounded text-xs ${
                                inlineEditForm.ttl === 86400
                                  ? 'border-[#0972D3] bg-blue-50 dark:bg-blue-900/30 text-[#0972D3] dark:text-blue-400'
                                  : 'border-[#d5dbdb] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              1d
                            </button>
                          </div>
                          <p className="text-xs text-[#5f6b7a] dark:text-slate-400 mt-1.5">
                            Recommended values: 60 to 172800 (two days)
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <label className="text-[#5f6b7a] dark:text-slate-400 font-semibold text-xs">Routing policy</label>
                            <span className="text-[#0972D3] text-xs font-medium cursor-pointer hover:underline">Info</span>
                          </div>
                          <select
                            value={inlineEditForm.routing_policy}
                            onChange={(e) => setInlineEditForm({ ...inlineEditForm, routing_policy: e.target.value })}
                            className="w-full px-2.5 py-2 border border-[#d5dbdb] dark:border-slate-700 rounded text-xs text-[#16191F] dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
                          >
                            <option value="Simple routing">Simple routing</option>
                            <option value="Weighted routing">Weighted routing</option>
                            <option value="Latency routing">Latency routing</option>
                            <option value="Failover routing">Failover routing</option>
                          </select>
                        </div>

                        {/* Conditional field for Latency routing - Region */}
                        {inlineEditForm.routing_policy === 'Latency routing' && (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <label className="text-[#5f6b7a] dark:text-slate-400 font-semibold text-xs">Location</label>
                              <span className="text-[#0972D3] text-xs font-medium cursor-pointer hover:underline">Info</span>
                            </div>
                            <select
                              value={inlineEditForm.region}
                              onChange={(e) => setInlineEditForm({ ...inlineEditForm, region: e.target.value })}
                              className="w-full px-2.5 py-2 border border-[#d5dbdb] dark:border-slate-700 rounded text-xs text-[#16191F] dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
                            >
                              <option value="">Select a region</option>
                              <option value="us-east-1">us-east-1 (N. Virginia)</option>
                              <option value="us-west-1">us-west-1 (N. California)</option>
                              <option value="us-west-2">us-west-2 (Oregon)</option>
                              <option value="eu-west-1">eu-west-1 (Ireland)</option>
                              <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
                              <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
                              <option value="ap-northeast-1">ap-northeast-1 (Tokyo)</option>
                            </select>
                          </div>
                        )}

                        {/* Conditional field for Failover routing - Failure type */}
                        {inlineEditForm.routing_policy === 'Failover routing' && (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <label className="text-[#5f6b7a] dark:text-slate-400 font-semibold text-xs">Failure type</label>
                              <span className="text-[#0972D3] text-xs font-medium cursor-pointer hover:underline">Info</span>
                            </div>
                            <select
                              value={inlineEditForm.failure_type}
                              onChange={(e) => setInlineEditForm({ ...inlineEditForm, failure_type: e.target.value })}
                              className="w-full px-2.5 py-2 border border-[#d5dbdb] dark:border-slate-700 rounded text-xs text-[#16191F] dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
                            >
                              <option value="Primary">Primary</option>
                              <option value="Secondary">Secondary</option>
                            </select>
                          </div>
                        )}
                      </>
                    ) : (
                      // View Mode
                      <>
                        <div>
                          <div className="text-[#5f6b7a] dark:text-slate-400 font-semibold text-xs mb-2">Record name</div>
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
                            <span className="font-normal text-slate-900 dark:text-slate-200 text-xs">{selectedRecord.name}</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-[#5f6b7a] dark:text-slate-400 font-semibold text-xs mb-2">Record type</div>
                          <div className="font-normal text-slate-900 dark:text-slate-200 text-xs">{selectedRecord.type}</div>
                        </div>

                        <div>
                          <div className="text-[#5f6b7a] dark:text-slate-400 font-semibold text-xs mb-2">Value</div>
                          <div className="space-y-1.5">
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
                                <span className="font-normal text-slate-900 dark:text-slate-200 text-xs break-all">{valLine}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-[#5f6b7a] dark:text-slate-400 font-semibold text-xs mb-2">Alias</div>
                          <div className="font-normal text-slate-900 dark:text-slate-200 text-xs">
                            {selectedRecord.alias ? 'Yes' : 'No'}
                          </div>
                        </div>

                        <div>
                          <div className="text-[#5f6b7a] dark:text-slate-400 font-semibold text-xs mb-2">TTL (seconds)</div>
                          <div className="font-normal text-slate-900 dark:text-slate-200 text-xs">
                            {selectedRecord.ttl ? selectedRecord.ttl.toLocaleString('en-US') : '300'}
                          </div>
                        </div>

                        <div>
                          <div className="text-[#5f6b7a] dark:text-slate-400 font-semibold text-xs mb-2">Routing policy</div>
                          <div className="font-normal text-slate-900 dark:text-slate-200 text-xs">
                            {selectedRecord.routing_policy || 'Simple routing'}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Case 2: Multi-records selected (>1 selected) (Screenshot 2) */}
              {selectedRecordIds.length > 1 && (
                <div className="space-y-4 py-2">
                  <p className="text-xs text-[#5f6b7a] dark:text-slate-400">
                    {selectedRecordIds.length} records selected in this hosted zone.
                  </p>
                  <div className="border border-[#d5dbdb] dark:border-slate-700 rounded-lg p-3 max-h-[220px] overflow-y-auto space-y-2 bg-slate-50/50 dark:bg-slate-800/50">
                    {rawRecords
                      .filter((r) => selectedRecordIds.includes(r.id))
                      .map((r) => (
                        <div key={r.id} className="flex items-center justify-between text-xs py-1.5 border-b border-[#d5dbdb] dark:border-slate-700 last:border-0">
                          <span className="font-medium text-slate-800 dark:text-slate-200">{r.name}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{r.type}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Case 3: 0 records selected */}
              {selectedRecordIds.length === 0 && (
                <div className="flex flex-col items-start py-2 text-left space-y-1">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Select a record to see its details
                  </p>
                </div>
              )}
            </div>
          )}
          </div>
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
      <DeleteZoneModal
        isOpen={isDeleteZoneModalOpen}
        onClose={() => {
          setIsDeleteZoneModalOpen(false);
          setDeleteConfirmText('');
        }}
        onConfirm={() => deleteZoneMutation.mutate()}
        zoneName={domainDisplayName}
        isDeleting={deleteZoneMutation.isPending}
        confirmText={deleteConfirmText}
        onConfirmTextChange={setDeleteConfirmText}
      />

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

      {/* Delete Record Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete selected record?"
        showConfirmButton={false}
      >
        <div className="space-y-3 font-sans">
          <p className="text-sm text-[#16191F] dark:text-white leading-relaxed">
            Delete the record permanently? This action cannot be undone. Your domain might become unavailable on the internet.
          </p>

          {/* Single Record View - AWS-style simple table */}
          {selectedDeleteRecordIds.length === 1 && (() => {
            const record = rawRecords.find(r => r.id === selectedDeleteRecordIds[0]);
            if (!record) return null;
            return (
              <>
                {/* Search Bar */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-2 h-3 w-3 text-slate-400" />
                    <input
                      type="text"
                      value={deleteSearch}
                      onChange={(e) => setDeleteSearch(e.target.value)}
                      placeholder="Search"
                      className="w-full bg-white border border-slate-400 rounded px-3 py-1 pl-9 text-xs text-slate-900 focus:outline-none focus:border-[#0972D3]"
                    />
                  </div>
                  
                  {/* Properties Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsPropertyDropdownOpen(!isPropertyDropdownOpen)}
                      className="flex items-center space-x-1 px-3 py-1 border border-slate-400 rounded text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <span>Properties</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    
                    {isPropertyDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-slate-300 rounded shadow-lg z-10 min-w-[150px]">
                        <button
                          onClick={() => {
                            setDeleteSearchProperty('name');
                            setIsPropertyDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 ${
                            deleteSearchProperty === 'name' ? 'bg-blue-50 text-[#0972D3]' : 'text-slate-700'
                          }`}
                        >
                          Record name
                        </button>
                        <button
                          onClick={() => {
                            setDeleteSearchProperty('type');
                            setIsPropertyDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 ${
                            deleteSearchProperty === 'type' ? 'bg-blue-50 text-[#0972D3]' : 'text-slate-700'
                          }`}
                        >
                          Type
                        </button>
                        <button
                          onClick={() => {
                            setDeleteSearchProperty('value');
                            setIsPropertyDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 ${
                            deleteSearchProperty === 'value' ? 'bg-blue-50 text-[#0972D3]' : 'text-slate-700'
                          }`}
                        >
                          Value/Route traffic to
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <span>&lt; 1 &gt;</span>
                  </div>
                </div>

                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#f8f9fb] border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-3 py-1.5">Record name</th>
                        <th className="px-3 py-1.5">Type</th>
                        <th className="px-3 py-1.5">Value/Route traffic to</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr className="hover:bg-slate-50">
                        <td className="px-3 py-1.5">
                          <span className="text-slate-600 hover:underline cursor-pointer">
                            {record.name}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 font-semibold text-slate-600">
                          {record.type}
                        </td>
                        <td className="px-3 py-1.5 text-slate-500 truncate max-w-xs">
                          {record.value}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}

          {/* Multiple Records View - With Search/Filter */}
          {selectedDeleteRecordIds.length > 1 && (
            <>
              {/* Search and Filter Bar */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-2 h-3 w-3 text-slate-400" />
                  <input
                    type="text"
                    value={deleteSearch}
                    onChange={(e) => setDeleteSearch(e.target.value)}
                    placeholder="Search"
                    className="w-full bg-white border border-slate-400 rounded px-3 py-1 pl-9 text-xs text-slate-900 focus:outline-none focus:border-[#0972D3]"
                  />
                </div>
                
                {/* Properties Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsPropertyDropdownOpen(!isPropertyDropdownOpen)}
                    className="flex items-center space-x-1 px-3 py-1 border border-slate-400 rounded text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <span>Properties</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  
                  {isPropertyDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-300 rounded shadow-lg z-10 min-w-[150px]">
                      <button
                        onClick={() => {
                          setDeleteSearchProperty('name');
                          setIsPropertyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 ${
                          deleteSearchProperty === 'name' ? 'bg-blue-50 text-[#0972D3]' : 'text-slate-700'
                        }`}
                      >
                        Record name
                      </button>
                      <button
                        onClick={() => {
                          setDeleteSearchProperty('type');
                          setIsPropertyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 ${
                          deleteSearchProperty === 'type' ? 'bg-blue-50 text-[#0972D3]' : 'text-slate-700'
                        }`}
                      >
                        Type
                      </button>
                      <button
                        onClick={() => {
                          setDeleteSearchProperty('value');
                          setIsPropertyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 ${
                          deleteSearchProperty === 'value' ? 'bg-blue-50 text-[#0972D3]' : 'text-slate-700'
                        }`}
                      >
                        Value/Route traffic to
                      </button>
                    </div>
                  )}
                </div>

                {/* Filter Tags */}
                {deleteFilterTags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => setDeleteFilterTags(deleteFilterTags.filter((_, i) => i !== index))}
                    className="flex items-center space-x-1 px-2 py-1 rounded-full bg-blue-50 border border-[#0972D3] text-[#0972D3] text-xs font-medium"
                  >
                    <span>{tag}</span>
                    <X className="h-3 w-3" />
                  </button>
                ))}

                {deleteFilterTags.length > 0 && (
                  <button
                    onClick={() => setDeleteFilterTags([])}
                    className="text-xs font-semibold text-[#0972D3] hover:underline"
                  >
                    Clear filters
                  </button>
                )}

                <div className="flex items-center space-x-2 text-xs text-slate-500 ml-auto">
                  <span>&lt; 1 &gt;</span>
                  <span className="text-slate-700 font-medium">
                    {rawRecords.filter(r => 
                      r.name.toLowerCase().includes(deleteSearch.toLowerCase()) ||
                      r.value.toLowerCase().includes(deleteSearch.toLowerCase())
                    ).length} match{rawRecords.filter(r => 
                      r.name.toLowerCase().includes(deleteSearch.toLowerCase()) ||
                      r.value.toLowerCase().includes(deleteSearch.toLowerCase())
                    ).length !== 1 ? 'es' : ''}
                  </span>
                </div>
              </div>

              {/* Records Table */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8f9fb] border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-3 py-1.5 w-8">
                        <input
                          type="checkbox"
                          checked={selectedDeleteRecordIds.length > 0 && selectedDeleteRecordIds.length === rawRecords.length}
                          onChange={() => {
                            if (selectedDeleteRecordIds.length === rawRecords.length) {
                              setSelectedDeleteRecordIds([]);
                            } else {
                              setSelectedDeleteRecordIds(rawRecords.map(r => r.id));
                            }
                          }}
                          className="rounded border-slate-300"
                        />
                      </th>
                      <th className="px-3 py-1.5">Record name</th>
                      <th className="px-3 py-1.5">Type</th>
                      <th className="px-3 py-1.5">Value/Route traffic to</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rawRecords
                      .filter(r => 
                        r.name.toLowerCase().includes(deleteSearch.toLowerCase()) ||
                        r.value.toLowerCase().includes(deleteSearch.toLowerCase())
                      )
                      .map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="px-3 py-1.5">
                            <input
                              type="checkbox"
                              checked={selectedDeleteRecordIds.includes(rec.id)}
                              onChange={() => {
                                if (selectedDeleteRecordIds.includes(rec.id)) {
                                  setSelectedDeleteRecordIds(selectedDeleteRecordIds.filter(id => id !== rec.id));
                                } else {
                                  setSelectedDeleteRecordIds([...selectedDeleteRecordIds, rec.id]);
                                }
                              }}
                              className="rounded border-slate-300"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <span className="text-slate-600 hover:underline cursor-pointer">
                              {rec.name}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 font-semibold text-slate-600">
                            {rec.type}
                          </td>
                          <td className="px-3 py-1.5 text-slate-500 truncate max-w-xs">
                            {rec.value}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-[#0972D3] hover:bg-slate-50 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteMultipleRecordsMutation.mutate(selectedDeleteRecordIds)}
              disabled={selectedDeleteRecordIds.length === 0 || deleteMultipleRecordsMutation.isPending}
              className="px-3 py-1.5 rounded-full bg-[#ec7211] hover:bg-[#d65f00] text-[#16191F] dark:text-white font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteMultipleRecordsMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
