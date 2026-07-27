'use client';

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';

interface DeleteZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  zoneName: string;
  isDeleting: boolean;
  confirmText?: string;
  onConfirmTextChange?: (text: string) => void;
}

export default function DeleteZoneModal({
  isOpen,
  onClose,
  onConfirm,
  zoneName,
  isDeleting,
  confirmText: propConfirmText,
  onConfirmTextChange,
}: DeleteZoneModalProps) {
  const [internalConfirmText, setInternalConfirmText] = useState('');
  const isControlled = propConfirmText !== undefined && onConfirmTextChange !== undefined;
  const confirmText = isControlled ? propConfirmText : internalConfirmText;
  const setConfirmText = isControlled ? onConfirmTextChange : setInternalConfirmText;
  const canDelete = confirmText === 'delete';

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  const handleConfirm = () => {
    if (canDelete) {
      onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Delete hosted zone ${zoneName}?`}
      onConfirm={handleConfirm}
      confirmText="Delete"
      confirmVariant="danger"
      isConfirmLoading={isDeleting}
      showConfirmButton={true}
      isConfirmDisabled={!canDelete}
    >
      <div className="space-y-3">
        {/* Warning Message */}
        <div className="text-xs text-[#16191F]">
          <p className="font-semibold mb-1">Delete the hosted zone permanently? This action cannot be undone. Your domain might become unavailable on the internet.</p>
        </div>

        {/* Yellow Warning Section with Brown Border */}
        <div className="bg-[#FFFEF0] border border-[#A0522D] rounded p-3">
          <div className="flex items-start space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-[#A0522D] shrink-0 mt-0.5" />
            <h4 className="font-bold text-xs text-[#16191F]">Take these actions to delete hosted zone {zoneName}</h4>
          </div>
          <p className="text-xs text-[#16191F] mb-2">
            Complete the following steps to successfully delete this hosted zone. If you don't complete the steps, the deletion might be blocked by Route 53 service validation.
          </p>
          <ul className="space-y-1 text-xs text-[#16191F] mb-2">
            <li className="flex items-start">
              <span className="text-[#A0522D] mr-2">•</span>
              <span>Delete all records in this hosted zone, except the default NS and SOA records.</span>
            </li>
          </ul>
          <button
            onClick={() => {
              handleClose();
              window.location.href = window.location.href;
            }}
            className="text-[#0972D3] hover:underline text-xs font-semibold"
          >
            Go to hosted zone details
          </button>
        </div>

        {/* Confirmation Input */}
        <div className="space-y-1">
          <label className="block text-xs text-[#16191F]">
            To confirm that you want to delete the hosted zone, enter delete in the field.
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete"
            className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3] italic placeholder:italic"
          />
        </div>
      </div>
    </Modal>
  );
}
