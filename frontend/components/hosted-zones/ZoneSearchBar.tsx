'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Settings, X, ChevronDown } from 'lucide-react';

interface ZoneSearchBarProps {
  mode?: 'records' | 'hosted-zones';
  value: string;
  onChange: (value: string) => void;
  tags?: string[];
  operator?: 'and' | 'or';
  onOperatorChange?: (op: 'and' | 'or') => void;
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
  onClearFilters?: () => void;
  placeholder?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  matchCount?: number;
  // Optional property filter props
  showPropertyDropdowns?: boolean;
  selectedType?: string;
  onTypeChange?: (type: string) => void;
  selectedRoutingPolicy?: string;
  onRoutingPolicyChange?: (policy: string) => void;
  selectedAlias?: string;
  onAliasChange?: (alias: string) => void;
  // Ref for focusing the search input
  searchRef?: React.RefObject<HTMLInputElement>;
}

const RECORD_PROPERTIES = [
  'Type',
  'Routing policy',
  'Differentiator',
  'Alias',
  'Value/Route traffic to',
  'TTL (seconds)',
  'Health check ID',
  'Evaluate target health',
  'Record ID',
];

const HOSTED_ZONE_PROPERTIES = [
  'Hosted zone name',
  'Type',
  'Accelerated recovery',
  'Created by',
  'Record count',
  'Description',
  'Hosted zone ID',
];

const RECORD_PROPERTY_VALUE_OPTIONS: Record<string, string[]> = {
  Alias: ['Alias : Yes', 'Alias : No'],
  Type: [
    'Type : A',
    'Type : AAAA',
    'Type : CNAME',
    'Type : MX',
    'Type : NS',
    'Type : SOA',
    'Type : TXT',
  ],
  'Routing policy': [
    'Routing policy : Simple',
    'Routing policy : Weighted',
    'Routing policy : Latency',
    'Routing policy : Failover',
  ],
};

const HOSTED_ZONE_PROPERTY_VALUE_OPTIONS: Record<string, string[]> = {
  Type: ['Type : Public', 'Type : Private'],
  'Accelerated recovery': ['Accelerated recovery : Enabled', 'Accelerated recovery : Disabled'],
};

export default function ZoneSearchBar({
  mode = 'records',
  value,
  onChange,
  tags = [],
  operator = 'and',
  onOperatorChange,
  onAddTag,
  onRemoveTag,
  onClearFilters,
  placeholder,
  page = 1,
  totalPages = 1,
  onPageChange,
  matchCount,
  showPropertyDropdowns,
  selectedType = 'all',
  onTypeChange,
  selectedRoutingPolicy = 'all',
  onRoutingPolicyChange,
  selectedAlias = 'all',
  onAliasChange,
  searchRef,
}: ZoneSearchBarProps) {
  const isHostedZones = mode === 'hosted-zones';
  const shouldShowDropdowns = showPropertyDropdowns !== undefined ? showPropertyDropdowns : !isHostedZones;
  const defaultPlaceholder = placeholder || (isHostedZones ? 'Filter hosted zones by property or value' : 'Filter records by property or value');
  const propertiesList = isHostedZones ? HOSTED_ZONE_PROPERTIES : RECORD_PROPERTIES;
  const propertyValueOptions = isHostedZones ? HOSTED_ZONE_PROPERTY_VALUE_OPTIONS : RECORD_PROPERTY_VALUE_OPTIONS;

  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);
  const [selectedPropertyKey, setSelectedPropertyKey] = useState<string | null>(null);
  const [openFilterMenu, setOpenFilterMenu] = useState<'type' | 'routing' | 'alias' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const internalSearchRef = useRef<HTMLInputElement>(null);
  const inputRef = searchRef || internalSearchRef;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsPropertyDropdownOpen(false);
        setOpenFilterMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine active property key from typed string or state
  const getActivePropertyKey = (): string | null => {
    if (selectedPropertyKey) return selectedPropertyKey;
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return null;
    for (const key of Object.keys(propertyValueOptions)) {
      if (trimmed.startsWith(key.toLowerCase()) || trimmed.includes(key.toLowerCase())) {
        return key;
      }
    }
    return null;
  };

  const activePropertyKey = getActivePropertyKey();
  const currentPropOptions = activePropertyKey ? propertyValueOptions[activePropertyKey] : null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed) {
        if (onAddTag) {
          onAddTag(trimmed);
        }
        // If typing alias:yes or alias:no, sync alias change
        if (trimmed.toLowerCase().includes('alias = yes') || trimmed.toLowerCase() === 'alias:yes' || trimmed.toLowerCase() === 'alias: yes') {
          if (onAliasChange) onAliasChange('Yes');
        } else if (trimmed.toLowerCase().includes('alias = no') || trimmed.toLowerCase() === 'alias:no' || trimmed.toLowerCase() === 'alias: no') {
          if (onAliasChange) onAliasChange('No');
        }
        onChange('');
        setSelectedPropertyKey(null);
        setIsPropertyDropdownOpen(false);
      }
    }
  };

  const handlePropertySelect = (propName: string) => {
    setSelectedPropertyKey(propName);
    onChange(`${propName} : `);
    setIsPropertyDropdownOpen(true);
  };

  const handleValueSelect = (valOption: string) => {
    if (onAddTag) {
      onAddTag(valOption);
    }
    // Update active filters if applicable
    if (valOption.startsWith('Alias : Yes')) {
      if (onAliasChange) onAliasChange('Yes');
    } else if (valOption.startsWith('Alias : No')) {
      if (onAliasChange) onAliasChange('No');
    } else if (valOption.startsWith('Type : ')) {
      const typeVal = valOption.replace('Type : ', '').trim();
      if (onTypeChange) onTypeChange(typeVal);
    } else if (valOption.startsWith('Routing policy : ')) {
      const routeVal = valOption.replace('Routing policy : ', '').trim();
      if (onRoutingPolicyChange) onRoutingPolicyChange(routeVal);
    }
    onChange('');
    setSelectedPropertyKey(null);
    setIsPropertyDropdownOpen(false);
  };

  const handleUseCurrentQuery = () => {
    const trimmed = value.trim();
    if (trimmed) {
      if (onAddTag) onAddTag(trimmed);
      onChange('');
      setSelectedPropertyKey(null);
      setIsPropertyDropdownOpen(false);
    }
  };

  const handleClearInput = () => {
    onChange('');
    setSelectedPropertyKey(null);
  };

  const hasFilters = tags.length > 0 || value.trim().length > 0 || selectedType !== 'all' || selectedRoutingPolicy !== 'all' || selectedAlias !== 'all';

  const toggleOperator = () => {
    if (onOperatorChange) {
      onOperatorChange(operator === 'and' ? 'or' : 'and');
    }
  };

  return (
    <div className="space-y-3 my-3 font-sans select-none" ref={containerRef}>
      {/* Search Input, Quick Property Filters & Far-Right Pagination Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Search Input + Property Pills */}
        <div className="flex flex-wrap items-center gap-2 flex-1 w-full">
          {/* Main Search Bar with Focus Popover */}
          <div className="relative flex-1 min-w-[280px]">
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.5} />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={value}
                onFocus={() => setIsPropertyDropdownOpen(true)}
                onChange={(e) => {
                  onChange(e.target.value);
                  if (!isPropertyDropdownOpen) setIsPropertyDropdownOpen(true);
                }}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-8 py-1.5 border border-slate-300 rounded text-[11px] text-[#16191F] bg-white placeholder-slate-500 placeholder:italic font-normal focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3] transition-colors"
                placeholder={defaultPlaceholder}
              />
              {value.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearInput}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                  title="Clear search"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Match count display next to search bar */}
            {matchCount !== undefined && hasFilters && (
              <span className="ml-2 text-[11px] text-slate-600 font-medium">
                {matchCount} match{matchCount !== 1 ? 'es' : ''}
              </span>
            )}

            {/* AWS Property Suggestions & Values Dropdown Popover (Matches AWS Console Exact UI) */}
            {isPropertyDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto sidebar-scrollbar text-[11px] text-[#16191F]">
                {/* Header "Use: <query>" when typing or selecting a property */}
                {value.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={handleUseCurrentQuery}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 transition-colors border-b border-slate-200 flex items-center font-normal text-slate-800"
                  >
                    <span className="text-slate-500 mr-1.5">Use:</span>
                    <span className="font-semibold text-slate-900">{value.trim()}</span>
                  </button>
                )}

                {/* Values section if active property key has predefined options */}
                {currentPropOptions ? (
                  <div>
                    <div className="px-2.5 py-1 font-bold text-[11px] text-[#16191F] border-b border-slate-200 bg-slate-50/60">
                      Values
                    </div>
                    <div className="divide-y divide-slate-200">
                      {currentPropOptions.map((opt) => (
                        <div key={opt} className="p-0.5">
                          <button
                            type="button"
                            onClick={() => handleValueSelect(opt)}
                            className="w-full text-left pl-4 pr-2 py-1 text-[11px] text-[#16191F] font-medium hover:bg-[#f2f3f5] hover:border hover:border-slate-400 rounded transition-all border border-transparent flex items-center"
                          >
                            <span>{opt}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Standard property suggestion list */
                  <div>
                    <div className="px-2.5 py-1 font-bold text-[11px] text-[#16191F] border-b border-slate-200">
                      Properties
                    </div>
                    <div className="divide-y divide-slate-200">
                      {propertiesList.map((prop) => (
                        <div key={prop} className="p-0.5">
                          <button
                            type="button"
                            onClick={() => handlePropertySelect(prop)}
                            className="w-full text-left pl-4 pr-2 py-1 text-[11px] text-[#16191F] font-normal hover:bg-[#f2f3f5] hover:border hover:border-slate-400 rounded transition-all border border-transparent flex items-center justify-between"
                          >
                            <span>{prop}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Property Dropdown Buttons: Type ▼, Routing p... ▼, Alias ▼ */}
          {shouldShowDropdowns && (
            <div className="flex items-center space-x-1.5 shrink-0">
              {/* Type Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenFilterMenu(openFilterMenu === 'type' ? null : 'type')
                  }
                  className="px-2 py-0.5 border border-slate-300 rounded bg-white hover:bg-slate-50 text-[11px] font-normal text-[#16191F] flex items-center space-x-0.5 transition-colors shadow-2xs"
                >
                  <span>
                    {selectedType === 'all'
                      ? 'Type'
                      : `Type: ${selectedType}`}
                  </span>
                  <ChevronDown className="h-3 w-3 text-[#0972D3]" strokeWidth={2} />
                </button>

                {openFilterMenu === 'type' && (
                  <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-slate-300 rounded-md shadow-lg z-50 py-1 text-xs text-slate-800">
                    {['all', 'A', 'AAAA', 'CNAME', 'MX', 'NS', 'SOA', 'TXT'].map(
                      (t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            if (onTypeChange) onTypeChange(t);
                            setOpenFilterMenu(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 transition-colors ${
                            selectedType === t ? 'font-bold text-[#0972D3]' : ''
                          }`}
                        >
                          {t === 'all' ? 'All Types' : t}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Routing policy Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenFilterMenu(openFilterMenu === 'routing' ? null : 'routing')
                  }
                  className="px-2 py-0.5 border border-slate-300 rounded bg-white hover:bg-slate-50 text-[11px] font-normal text-[#16191F] flex items-center space-x-0.5 transition-colors shadow-2xs"
                >
                  <span>
                    {selectedRoutingPolicy === 'all'
                      ? 'Routing p...'
                      : `Routing: ${selectedRoutingPolicy}`}
                  </span>
                  <ChevronDown className="h-3 w-3 text-[#0972D3]" strokeWidth={2} />
                </button>

                {openFilterMenu === 'routing' && (
                  <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-300 rounded-md shadow-lg z-50 py-1 text-xs text-slate-800">
                    {['all', 'Simple', 'Weighted', 'Latency', 'Failover'].map(
                      (r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            if (onRoutingPolicyChange) onRoutingPolicyChange(r);
                            setOpenFilterMenu(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 transition-colors ${
                            selectedRoutingPolicy === r ? 'font-bold text-[#0972D3]' : ''
                          }`}
                        >
                          {r === 'all' ? 'All Routing Policies' : r}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Alias Dropdown Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenFilterMenu(openFilterMenu === 'alias' ? null : 'alias')
                  }
                  className="px-2 py-0.5 border border-slate-300 rounded bg-white hover:bg-slate-50 text-[11px] font-normal text-[#16191F] flex items-center space-x-0.5 transition-colors shadow-2xs"
                >
                  <span>
                    {selectedAlias === 'all'
                      ? 'Alias'
                      : `Alias = ${selectedAlias}`}
                  </span>
                  <ChevronDown className="h-3 w-3 text-[#0972D3]" strokeWidth={2} />
                </button>

                {openFilterMenu === 'alias' && (
                  <div className="absolute left-0 top-full mt-1 w-36 bg-white border border-slate-300 rounded-md shadow-lg z-50 py-1 text-xs text-slate-800">
                    {['all', 'Yes', 'No'].map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => {
                          if (onAliasChange) onAliasChange(a);
                          setOpenFilterMenu(null);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 transition-colors ${
                          selectedAlias === a ? 'font-bold text-[#0972D3]' : ''
                        }`}
                      >
                        {a === 'all' ? 'All Aliases' : `Alias = ${a}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Far-Right Pagination Controls: < 1 > ⚙ */}
        <div className="flex items-center space-x-2 text-[#16191F] text-xs shrink-0 self-end md:self-center">
          <button
            onClick={() => onPageChange && page > 1 && onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>

          <span className="font-semibold text-[#16191F] px-1 min-w-[16px] text-center">
            {page}
          </span>

          <button
            onClick={() => onPageChange && page < totalPages && onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 transition-colors"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>

          <button
            className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors ml-0.5"
            title="Table preferences"
          >
            <Settings className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Filter Tag Chips Row */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {tags.map((tag, idx) => (
            <React.Fragment key={`${tag}-${idx}`}>
              <div className="inline-flex items-center rounded border-2 border-[#0972D3] bg-[#E3F2FD] overflow-hidden text-[11px] text-[#16191F]">
                <span className="px-2 py-0.5 border-r-2 border-[#0972D3]">
                  {tag}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveTag && onRemoveTag(tag)}
                  className="px-1.5 py-0.5 hover:bg-[#A7D8FF] text-[#0972D3] transition-colors"
                  title="Remove filter tag"
                >
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </div>

              {idx < tags.length - 1 && (
                <button
                  type="button"
                  onClick={toggleOperator}
                  className="inline-flex items-center space-x-0.5 rounded border-2 border-[#0972D3] bg-[#E3F2FD] px-1.5 py-0.5 text-[11px] text-[#16191F] hover:bg-[#A7D8FF] transition-colors"
                  title="Toggle filter condition (AND / OR)"
                >
                  <span>{operator}</span>
                  <ChevronDown className="h-2.5 w-2.5" strokeWidth={2} />
                </button>
              )}
            </React.Fragment>
          ))}

          {tags.length > 0 && <span className="h-5 w-[1px] bg-slate-300 mx-1"></span>}

          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="px-3 py-0.5 rounded-full border-2 border-[#0972D3] hover:bg-blue-50 text-[#0972D3] font-semibold text-[11px] transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
