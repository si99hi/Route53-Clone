'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../lib/api';
import { HostedZoneCreate } from '../../../../lib/types';
import { useToast } from '../../../../hooks/useToast';
import ZoneForm from '../../../../components/hosted-zones/ZoneForm';

export default function CreateHostedZonePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: HostedZoneCreate) => api.createHostedZone(data),
    onSuccess: (newZone) => {
      queryClient.invalidateQueries({ queryKey: ['hosted-zones'] });
      toast.success(`${newZone.domain_name} was successfully created.`);
      router.push(`/hosted-zones/${newZone.id}?created=true&domain=${encodeURIComponent(newZone.domain_name)}`);
    },
    onError: (err: any) => {
      const msg =
        typeof err.detail === 'string' && err.detail.trim()
          ? err.detail
          : err.message || 'Failed to create hosted zone. The domain might already exist.';
      setErrorMsg(msg);
      toast.error(msg);
    },
  });

  const handleSubmit = (data: HostedZoneCreate) => {
    setErrorMsg(null);
    createMutation.mutate(data);
  };

  return (
    <div className="flex flex-col space-y-4 max-w-[1200px] font-sans">
      {/* Page Title Row */}
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-bold text-[#16191F] tracking-tight">
          Create hosted zone
        </h1>
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="text-[#0972D3] hover:underline text-xs font-medium"
        >
          Info
        </button>
      </div>

      {/* Main Form Component */}
      <ZoneForm
        onSubmit={handleSubmit}
        isPending={createMutation.isPending}
        errorMsg={errorMsg}
      />
    </div>
  );
}
