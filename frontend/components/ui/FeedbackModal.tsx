'use client';

import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [type, setType] = useState('General feedback');
  const [message, setMessage] = useState('');
  const [satisfaction, setSatisfaction] = useState<'yes' | 'no' | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setMessage('');
        setSatisfaction(null);
        setEmail('');
        onClose();
      }, 1800);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-[560px] bg-white dark:bg-[#16191F] border border-slate-300 dark:border-slate-700 rounded-lg shadow-2xl overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200 font-sans text-xs text-slate-800 dark:text-slate-200">
        
        {/* Success Overlay state */}
        {isSubmitted ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-3 my-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-bounce" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Thank you for your feedback!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Your response has been successfully received. We appreciate your help in improving Route 53.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Feedback for Route 53
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto sidebar-scrollbar">
              <p className="text-slate-700 dark:text-slate-300">
                Thank you for taking time to provide feedback.
              </p>

              {/* Field 1: Type */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-900 dark:text-white">
                  Type
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Choose the type of feedback you are submitting.
                </p>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-white dark:bg-[#0f1419] border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3] cursor-pointer"
                >
                  <option value="General feedback">General feedback</option>
                  <option value="Bug report">Bug report</option>
                  <option value="Feature request">Feature request</option>
                  <option value="Performance issue">Performance issue</option>
                  <option value="Documentation feedback">Documentation feedback</option>
                </select>
              </div>

              {/* Field 2: Message */}
              <div className="space-y-1 pt-1">
                <label className="block font-bold text-slate-900 dark:text-white">
                  Enter your message below
                </label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder=""
                  required
                  className="w-full bg-white dark:bg-[#0f1419] border border-slate-300 dark:border-slate-600 rounded p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3] resize-y"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {1000 - message.length} characters available. Do not disclose any personal, commercially sensitive, or confidential information.
                </p>
              </div>

              {/* Field 3: Satisfaction */}
              <div className="space-y-2 pt-1">
                <label className="block font-bold text-slate-900 dark:text-white">
                  Are you satisfied with your experience?
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center space-x-2.5 cursor-pointer text-slate-800 dark:text-slate-200">
                    <input
                      type="radio"
                      name="satisfaction"
                      checked={satisfaction === 'yes'}
                      onChange={() => setSatisfaction('yes')}
                      className="h-3.5 w-3.5 text-[#0972D3] focus:ring-[#0972D3] cursor-pointer"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center space-x-2.5 cursor-pointer text-slate-800 dark:text-slate-200">
                    <input
                      type="radio"
                      name="satisfaction"
                      checked={satisfaction === 'no'}
                      onChange={() => setSatisfaction('no')}
                      className="h-3.5 w-3.5 text-[#0972D3] focus:ring-[#0972D3] cursor-pointer"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Field 4: Contact email */}
              <div className="space-y-1 pt-1">
                <label className="block font-bold text-slate-900 dark:text-white">
                  We may want to contact you about your feedback. If you agree, provide your email address. - <span className="italic font-normal">optional</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className="w-full bg-white dark:bg-[#0f1419] border border-slate-300 dark:border-slate-600 rounded p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0972D3] focus:ring-1 focus:ring-[#0972D3]"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug pt-0.5">
                  Personal information you provide to us will be handled in accordance with the{' '}
                  <a
                    href="https://aws.amazon.com/privacy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0972D3] dark:text-[#539fe5] hover:underline"
                  >
                    AWS Privacy Notice
                  </a>.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-4 px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#16191F]">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-[#0972D3] dark:text-[#539fe5] font-semibold hover:underline cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="px-6 py-1.5 bg-[#ec7211] hover:bg-[#d65f00] text-slate-900 font-bold text-xs rounded-full shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
