'use client';

import React, { useState, useEffect } from 'react';
import { DNSRecord, DNSRecordCreate, RecordType } from '../../lib/types';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DNSRecordCreate) => void;
  recordToEdit?: DNSRecord | null;
  zoneDomainName: string;
  isPending: boolean;
  errorMsg?: string | null;
}

const recordTypeOptions: { label: string; value: RecordType }[] = [
  { label: 'A – Routes traffic to an IPv4 address', value: 'A' },
  { label: 'AAAA – Routes traffic to an IPv6 address', value: 'AAAA' },
  { label: 'CNAME – Routes traffic to another domain name', value: 'CNAME' },
  { label: 'MX – Specifies mail servers', value: 'MX' },
  { label: 'NS – Specifies name servers for a zone', value: 'NS' },
  { label: 'PTR – Maps IP address to domain name', value: 'PTR' },
  { label: 'SOA – Start of authority record', value: 'SOA' },
  { label: 'SRV – Specifies services and ports', value: 'SRV' },
  { label: 'TXT – Arbitrary text record', value: 'TXT' },
  { label: 'CAA – Specifies authorized CAs', value: 'CAA' },
];

export default function RecordFormModal({
  isOpen,
  onClose,
  onSubmit,
  recordToEdit,
  zoneDomainName,
  isPending,
  errorMsg,
}: RecordFormModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<RecordType>('A');
  const [value, setValue] = useState('');
  const [ttl, setTtl] = useState<number>(300);
  const [priority, setPriority] = useState<number | undefined>(undefined);
  const [validationErr, setValidationErr] = useState<string | null>(null);

  useEffect(() => {
    if (recordToEdit) {
      setName(recordToEdit.name);
      setType(recordToEdit.type);
      setValue(recordToEdit.value);
      setTtl(recordToEdit.ttl);
      setPriority(recordToEdit.priority ?? undefined);
    } else {
      setName(zoneDomainName);
      setType('A');
      setValue('');
      setTtl(300);
      setPriority(undefined);
    }
    setValidationErr(null);
  }, [recordToEdit, zoneDomainName, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErr(null);

    const trimmedName = name.trim() || zoneDomainName;
    const trimmedVal = value.trim();

    if (!trimmedVal) {
      setValidationErr('Value is required');
      return;
    }

    onSubmit({
      name: trimmedName,
      type,
      value: trimmedVal,
      ttl: Number(ttl) || 300,
      priority: priority !== undefined ? Number(priority) : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recordToEdit ? 'Edit record' : 'Create record'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
        {(errorMsg || validationErr) && (
          <div className="p-3 bg-red-50 border-l-4 border-red-500 text-xs text-red-800 rounded">
            {validationErr || errorMsg}
          </div>
        )}

        {/* Record Name */}
        <div>
          <label className="block font-semibold text-slate-800 dark:text-slate-300 mb-1">
            Record name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={zoneDomainName}
            disabled={isPending}
            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-[#0972D3]"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Leave blank or enter subdomain relative to {zoneDomainName}
          </p>
        </div>

        {/* Record Type */}
        <div>
          <label className="block font-semibold text-slate-800 dark:text-slate-300 mb-1">
            Record type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as RecordType)}
            disabled={isPending}
            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-[#0972D3]"
          >
            {recordTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Value */}
        <div>
          <label className="block font-semibold text-slate-800 dark:text-slate-300 mb-1">
            Value / Route traffic to
          </label>
          <textarea
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === 'A' ? '192.0.2.1' : 'Enter record value'}
            disabled={isPending}
            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-[#0972D3]"
          />
        </div>

        {/* TTL */}
        <div>
          <label className="block font-semibold text-slate-800 dark:text-slate-300 mb-1">
            TTL (seconds)
          </label>
          <input
            type="number"
            value={ttl}
            onChange={(e) => setTtl(Number(e.target.value))}
            min={60}
            max={172800}
            disabled={isPending}
            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-[#0972D3]"
          />
        </div>

        {/* Priority (for MX / SRV) */}
        {(type === 'MX' || type === 'SRV') && (
          <div>
            <label className="block font-semibold text-slate-800 dark:text-slate-300 mb-1">
              Priority
            </label>
            <input
              type="number"
              value={priority ?? 10}
              onChange={(e) => setPriority(Number(e.target.value))}
              min={0}
              max={65535}
              disabled={isPending}
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-[#0972D3]"
            />
          </div>
        )}

        {/* Modal Buttons */}
        <div className="flex items-center justify-end space-x-2 border-t border-slate-200 pt-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isPending}>
            {recordToEdit ? 'Save changes' : 'Create record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
