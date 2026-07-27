'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../../lib/api';
import { TagItem } from '../../../../../lib/types';
import { useToast } from '../../../../../hooks/useToast';
import { Loader2 } from 'lucide-react';

export default function EditHostedZonePage({ params }: { params: { id: string } }) {
  const zoneId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<TagItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch current zone details
  const { data: zone, isLoading, isError } = useQuery({
    queryKey: ['hosted-zone', zoneId],
    queryFn: () => api.getHostedZone(zoneId),
  });

  useEffect(() => {
    if (zone && !isInitialized) {
      setDescription(zone.description || '');
      setTags(zone.tags && zone.tags.length > 0 ? zone.tags : []);
      setIsInitialized(true);
    }
  }, [zone, isInitialized]);

  // Update hosted zone mutation
  const updateMutation = useMutation({
    mutationFn: (payload: { description?: string; tags?: TagItem[] }) =>
      api.updateHostedZone(zoneId, payload),
    onSuccess: (updatedZone) => {
      queryClient.invalidateQueries({ queryKey: ['hosted-zone', zoneId] });
      queryClient.invalidateQueries({ queryKey: ['hosted-zones'] });
      router.push(`/hosted-zones/${zoneId}?edited=true&domain=${updatedZone.domain_name}`);
    },
    onError: (err: any) => {
      toast.error(err.detail || 'Failed to update hosted zone');
    },
  });

  const handleAddTag = () => {
    if (tags.length < 50) {
      setTags([...tags, { key: '', value: '' }]);
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleTagChange = (index: number, field: 'key' | 'value', val: string) => {
    const updated = tags.map((tag, i) => {
      if (i === index) {
        return { ...tag, [field]: val };
      }
      return tag;
    });
    setTags(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty key tags
    const validTags = tags
      .filter((t) => t.key.trim().length > 0)
      .map((t) => ({ key: t.key.trim(), value: t.value.trim() }));

    updateMutation.mutate({
      description: description.trim(),
      tags: validTags,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 font-sans">
        <Loader2 className="h-8 w-8 text-[#0972D3] animate-spin" />
        <p className="text-sm text-slate-600">Loading hosted zone details...</p>
      </div>
    );
  }

  if (isError || !zone) {
    return (
      <div className="border border-red-200 bg-red-50 text-red-700 p-6 rounded-xl space-y-3 font-sans">
        <h2 className="text-lg font-bold">Hosted Zone Not Found</h2>
        <p className="text-sm">
          The requested hosted zone could not be found or you do not have permission to edit it.
        </p>
        <button
          onClick={() => router.push('/hosted-zones')}
          className="px-4 py-2 bg-white border border-slate-300 rounded-full text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50"
        >
          Back to Hosted Zones
        </button>
      </div>
    );
  }

  const domainName = zone.domain_name;
  const remainingTagsCount = Math.max(0, 50 - tags.length);
  const displayType =
    zone.type === 'public' || zone.type?.toLowerCase().includes('public')
      ? 'Public hosted zone'
      : 'Private hosted zone';

  return (
    <div className="flex flex-col space-y-6 font-sans text-[#16191F] max-w-[1200px] w-full pb-12">
      {/* Title */}
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-bold text-[#16191F] tracking-tight">
          Edit {domainName}
        </h1>
        <button
          type="button"
          className="text-[#0972D3] hover:underline text-xs font-normal align-middle"
        >
          Info
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-slate-300 rounded-xl bg-white p-6 shadow-2xs space-y-6">
          {/* Card Header */}
          <div className="space-y-1 border-b border-slate-200 pb-5">
            <h2 className="text-xl font-bold text-[#16191F] tracking-tight">
              Edit hosted zone
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              A hosted zone is a container that holds information about how you want to route traffic for a domain, such as example.com, and its subdomains.
            </p>
          </div>

          {/* Read-Only Fields Stacked Vertically */}
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-[#16191F]">Domain name</div>
              <div className="text-xs text-[#16191F] mt-0.5">{domainName}</div>
            </div>

            <div>
              <div className="text-xs font-bold text-[#16191F]">Hosted zone ID</div>
              <div className="text-xs text-[#16191F] mt-0.5">{zone.id}</div>
            </div>

            <div>
              <div className="text-xs font-bold text-[#16191F]">Record count</div>
              <div className="text-xs text-[#16191F] mt-0.5">{zone.record_count}</div>
            </div>

            <div>
              <div className="text-xs font-bold text-[#16191F]">Type</div>
              <div className="text-xs text-[#16191F] mt-0.5">{displayType}</div>
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center space-x-1">
              <label htmlFor="description" className="text-xs font-bold text-[#16191F]">
                Description - optional
              </label>
              <button
                type="button"
                className="text-[#0972D3] hover:underline text-xs font-normal"
              >
                Info
              </button>
            </div>

            <p className="text-xs text-slate-600">
              This value lets you distinguish hosted zones that have the same name.
            </p>

            <textarea
              id="description"
              rows={3}
              maxLength={256}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="The hosted zone is used for..."
              className="w-full max-w-[650px] border border-slate-300 rounded-md p-3 text-xs text-[#16191F] focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
            />

            <div className="text-xs text-slate-500">
              The description can have up to 256 characters. {description.length}/256
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-[#16191F]">Tags</span>
              <button
                type="button"
                className="text-[#0972D3] hover:underline text-xs font-normal"
              >
                Info
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Apply tags to hosted zones to help organize and identify them.
            </p>

            {/* Tag rows list */}
            {tags.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-slate-700 px-1">
                  <div className="col-span-5">Key</div>
                  <div className="col-span-5">Value - optional</div>
                  <div className="col-span-2"></div>
                </div>

                {tags.map((tag, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="key"
                        value={tag.key}
                        onChange={(e) => handleTagChange(idx, 'key', e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-xs text-[#16191F] focus:outline-none focus:border-[#0972D3]"
                      />
                    </div>

                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="value"
                        value={tag.value}
                        onChange={(e) => handleTagChange(idx, 'value', e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-xs text-[#16191F] focus:outline-none focus:border-[#0972D3]"
                      />
                    </div>

                    <div className="col-span-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="px-3 py-1.5 border border-slate-300 rounded-full bg-white hover:bg-slate-50 text-xs font-semibold text-[#16191F] transition-colors shadow-2xs"
                      >
                        Remove tag
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add tag button and remaining counter */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleAddTag}
                disabled={tags.length >= 50}
                className="px-4 py-1.5 border border-slate-300 rounded-full bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs font-semibold text-[#16191F] transition-colors shadow-2xs"
              >
                Add tag
              </button>

              <p className="text-xs text-slate-500">
                You can add up to {remainingTagsCount} more tags.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push(`/hosted-zones/${zoneId}`)}
            className="px-5 py-2 border border-slate-300 rounded-full bg-white hover:bg-slate-50 text-xs font-semibold text-[#16191F] transition-colors shadow-2xs"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2 bg-[#ec7211] hover:bg-[#d65f00] text-slate-950 font-bold rounded-full text-xs transition-colors shadow-2xs disabled:opacity-50 flex items-center space-x-2"
          >
            {updateMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Save changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
