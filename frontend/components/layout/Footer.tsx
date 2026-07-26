'use client';

import React, { useState } from 'react';
import { Terminal, MessageSquare, Smartphone, Wrench } from 'lucide-react';
import FeedbackModal from '../ui/FeedbackModal';

export default function Footer() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      <footer className="h-8 bg-[#16191F] text-slate-300 border-t border-slate-800 flex items-center justify-between px-4 fixed bottom-0 left-0 right-0 z-40 select-none text-[11px] font-sans">
        {/* Left side: Console tools */}
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1.5 hover:text-white transition-colors">
            <Terminal className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
            <span>CloudShell</span>
          </button>

          <button className="flex items-center space-x-1.5 hover:text-white transition-colors">
            <Wrench className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
            <span>Agent Toolkit for AWS</span>
          </button>

          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center space-x-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
            <span>Feedback</span>
          </button>

          <button className="flex items-center space-x-1.5 hover:text-white transition-colors">
            <Smartphone className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
            <span>Console Mobile App</span>
          </button>
        </div>

        {/* Right side: Copyright & Legal */}
        <div className="flex items-center space-x-3 text-slate-400">
          <span>© 2026, Amazon Web Services, Inc. or its affiliates.</span>
          <a href="https://aws.amazon.com/privacy/" target="_blank" rel="noreferrer" className="hover:underline hover:text-slate-200">
            Privacy
          </a>
          <a href="https://aws.amazon.com/terms/" target="_blank" rel="noreferrer" className="hover:underline hover:text-slate-200">
            Terms
          </a>
          <a href="https://aws.amazon.com/legal/cookies/" target="_blank" rel="noreferrer" className="hover:underline hover:text-slate-200">
            Cookie preferences
          </a>
        </div>
      </footer>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}

