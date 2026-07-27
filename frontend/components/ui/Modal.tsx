'use client';

import React from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'danger';
  isConfirmLoading?: boolean;
  showConfirmButton?: boolean;
  isConfirmDisabled?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  isConfirmLoading = false,
  showConfirmButton = true,
  isConfirmDisabled = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog container - Smaller compact modal */}
      <div className="relative w-full max-w-md bg-white border border-slate-300 rounded-lg shadow-lg overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-black">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 text-sm text-black leading-relaxed">{children}</div>

        {/* Action Footer */}
        {showConfirmButton && onConfirm && (
          <div className="flex items-center justify-end space-x-3 px-4 py-3 border-t border-slate-200">
            <Button variant="secondary" onClick={onClose} disabled={isConfirmLoading}>
              Cancel
            </Button>
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              isLoading={isConfirmLoading}
              disabled={isConfirmDisabled || isConfirmLoading}
            >
              {confirmText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
