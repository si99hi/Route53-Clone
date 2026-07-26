'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HostedZoneCreate, ZoneType } from '../../lib/types';
import { Info, Trash2, Loader2, AlertCircle } from 'lucide-react';

interface TagItem {
  id: string;
  key: string;
  value: string;
}

interface ZoneFormProps {
  onSubmit: (data: HostedZoneCreate) => void;
  isPending: boolean;
  errorMsg: string | null;
}

export default function ZoneForm({ onSubmit, isPending, errorMsg }: ZoneFormProps) {
  const router = useRouter();
  const domainInputRef = useRef<HTMLInputElement>(null);

  const [domainName, setDomainName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ZoneType>('public');
  const [tags, setTags] = useState<TagItem[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-focus Domain Name input on mount
  useEffect(() => {
    domainInputRef.current?.focus();
  }, []);

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Strip protocol if pasted
    val = val.replace(/^https?:\/\//i, '');
    // Lowercase automatically
    val = val.toLowerCase();
    setDomainName(val);
    if (validationError) setValidationError(null);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 256) {
      setDescription(val);
    }
  };

  const validate = (): string | null => {
    const trimmedDomain = domainName.trim();
    if (!trimmedDomain) {
      return 'Domain name is required.';
    }

    if (/^https?:\/\//i.test(domainName)) {
      return 'Domain name must not contain protocol (http:// or https://).';
    }

    // Domain regex validation
    const domainRegex = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;
    if (!domainRegex.test(trimmedDomain)) {
      return 'Enter a valid domain name, e.g. example.com';
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    const err = validate();
    if (err) {
      setValidationError(err);
      return;
    }

    setValidationError(null);
    const validTags = tags.filter((t) => t.key.trim().length > 0);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`hz_tags_${domainName.trim()}`, JSON.stringify(validTags));
    }
    onSubmit({
      domain_name: domainName.trim(),
      description: description.trim() || undefined,
      type,
      tags: validTags.length > 0 ? validTags.map((t) => ({ key: t.key.trim(), value: t.value.trim() })) : undefined,
    });
  };

  const handleAddTag = () => {
    if (tags.length < 50) {
      setTags([...tags, { id: String(Date.now()) + Math.random(), key: '', value: '' }]);
    }
  };

  const handleRemoveTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
  };

  const handleTagChange = (id: string, field: 'key' | 'value', val: string) => {
    setTags(
      tags.map((t) => (t.id === id ? { ...t, [field]: val } : t))
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {/* Backend or Top-level Error Banner */}
      {(errorMsg || validationError) && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-xs text-red-800 flex items-start space-x-2 rounded-r shadow-2xs">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <span className="font-medium">{validationError || errorMsg}</span>
        </div>
      )}

      {/* Main AWS Container Card */}
      <div className="border border-slate-300 rounded-xl p-6 bg-white space-y-6 shadow-2xs">
        {/* Section Header */}
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-lg font-bold text-[#16191F] tracking-tight">
            Hosted zone configuration
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            A hosted zone is a container that holds information about how you want to route traffic for a domain, such as example.com, and its subdomains.
          </p>
        </div>

        {/* 1. Domain Name */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5">
            <label htmlFor="domain_name" className="text-xs font-bold text-[#16191F]">
              Domain name
            </label>
            <button
              type="button"
              className="text-[#0972D3] hover:underline text-xs font-medium inline-flex items-center space-x-0.5"
              onClick={(e) => e.preventDefault()}
            >
              <span>Info</span>
            </button>
          </div>

          <p className="text-xs text-slate-600">
            This is the name of the domain that you want to route traffic for.
          </p>

          <input
            ref={domainInputRef}
            id="domain_name"
            type="text"
            value={domainName}
            onChange={handleDomainChange}
            placeholder="example.com"
            disabled={isPending}
            className={`w-full px-3 py-2 border ${
              validationError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-[#0972D3] focus:ring-[#0972D3]'
            } rounded-md text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors`}
          />

          {validationError && (
            <p className="text-xs text-red-600 font-medium mt-1">
              {validationError}
            </p>
          )}

          <p className="text-[11px] text-slate-500">
            Valid characters: a-z, 0-9, ! " # $ % & ' ( ) * + , - / : ; &lt; = &gt; ? @ [ \ ] ^ _ ` &#123; | &#125; . ~
          </p>
        </div>

        {/* 2. Description */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5">
            <label htmlFor="description" className="text-xs font-bold text-[#16191F]">
              Description - optional
            </label>
            <button
              type="button"
              className="text-[#0972D3] hover:underline text-xs font-medium inline-flex items-center space-x-0.5"
              onClick={(e) => e.preventDefault()}
            >
              <span>Info</span>
            </button>
          </div>

          <p className="text-xs text-slate-600">
            This value lets you distinguish hosted zones that have the same name.
          </p>

          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={handleDescriptionChange}
            placeholder="The hosted zone is used for..."
            disabled={isPending}
            maxLength={256}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3] transition-colors"
          />

          <p className="text-[11px] text-slate-500">
            The description can have up to 256 characters. <span className="font-semibold">{description.length}/256</span>
          </p>
        </div>

        {/* 3. Type */}
        <div className="space-y-2">
          <div className="flex items-center space-x-1.5">
            <label className="text-xs font-bold text-[#16191F]">
              Type
            </label>
            <button
              type="button"
              className="text-[#0972D3] hover:underline text-xs font-medium inline-flex items-center space-x-0.5"
              onClick={(e) => e.preventDefault()}
            >
              <span>Info</span>
            </button>
          </div>

          <p className="text-xs text-slate-600">
            The type indicates whether you want to route traffic on the internet or in an Amazon VPC.
          </p>

          {/* Type Selectable Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Public Hosted Zone Card */}
            <div
              onClick={() => !isPending && setType('public')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                type === 'public'
                  ? 'border-[#0972D3] bg-[#f2f8fd] shadow-2xs'
                  : 'border-slate-300 bg-white hover:border-slate-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="type_public"
                  name="zone_type"
                  checked={type === 'public'}
                  onChange={() => setType('public')}
                  disabled={isPending}
                  className="mt-0.5 text-[#0972D3] focus:ring-[#0972D3] h-4 w-4 border-slate-300"
                />
                <div>
                  <label htmlFor="type_public" className="text-xs font-bold text-[#16191F] cursor-pointer">
                    Public hosted zone
                  </label>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    A public hosted zone determines how traffic is routed on the internet.
                  </p>
                </div>
              </div>
            </div>

            {/* Private Hosted Zone Card */}
            <div
              onClick={() => !isPending && setType('private')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                type === 'private'
                  ? 'border-[#0972D3] bg-[#f2f8fd] shadow-2xs'
                  : 'border-slate-300 bg-white hover:border-slate-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="type_private"
                  name="zone_type"
                  checked={type === 'private'}
                  onChange={() => setType('private')}
                  disabled={isPending}
                  className="mt-0.5 text-[#0972D3] focus:ring-[#0972D3] h-4 w-4 border-slate-300"
                />
                <div>
                  <label htmlFor="type_private" className="text-xs font-bold text-[#16191F] cursor-pointer">
                    Private hosted zone
                  </label>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    A private hosted zone determines how traffic is routed within an Amazon VPC.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Tags Section */}
        <div className="border-t border-slate-200 pt-6 space-y-3">
          <div className="flex items-center space-x-1.5">
            <h3 className="text-xs font-bold text-[#16191F]">
              Tags
            </h3>
            <button
              type="button"
              className="text-[#0972D3] hover:underline text-xs font-medium inline-flex items-center space-x-0.5"
              onClick={(e) => e.preventDefault()}
            >
              <span>Info</span>
            </button>
          </div>

          <p className="text-xs text-slate-600">
            Apply tags to hosted zones to help organize and identify them.
          </p>

          {tags.length === 0 ? (
            <div className="space-y-3 py-2">
              <p className="text-xs text-slate-500 italic">
                No tags associated with the resource.
              </p>

              <div>
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-full border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
                >
                  Add tag
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                You can add up to 50 more tags.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-3 text-xs font-bold text-slate-700 pb-1">
                  <div className="col-span-5">Key</div>
                  <div className="col-span-6">Value</div>
                  <div className="col-span-1"></div>
                </div>

                {tags.map((tag) => (
                  <div key={tag.id} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Tag key"
                        value={tag.key}
                        onChange={(e) => handleTagChange(tag.id, 'key', e.target.value)}
                        disabled={isPending}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-[#0972D3]"
                      />
                    </div>
                    <div className="col-span-6">
                      <input
                        type="text"
                        placeholder="Tag value"
                        value={tag.value}
                        onChange={(e) => handleTagChange(tag.id, 'value', e.target.value)}
                        disabled={isPending}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-[#0972D3]"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag.id)}
                        disabled={isPending}
                        className="p-1.5 text-slate-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                        title="Remove tag"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={isPending || tags.length >= 50}
                  className="px-4 py-1.5 rounded-full border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 disabled:opacity-40 transition-colors shadow-2xs"
                >
                  + Add tag
                </button>
                <p className="text-[11px] text-slate-500">
                  {50 - tags.length} remaining
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.push('/hosted-zones')}
          disabled={isPending}
          className="px-5 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 disabled:opacity-40 transition-colors shadow-2xs"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 rounded-full bg-[#ec7211] hover:bg-[#d65f00] text-slate-950 font-bold text-xs disabled:opacity-50 flex items-center space-x-2 transition-colors shadow-2xs"
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-950" />}
          <span>Create hosted zone</span>
        </button>
      </div>
    </form>
  );
}
