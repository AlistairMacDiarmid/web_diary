/**
 * @file ModernDiary.tsx
 * @description Clean, minimalist modern layout for the diary app featuring card views,
 * subtle left-accent line styling, and a sleek neutral color palette.
 */

import React from 'react';
import type { DiaryEntry } from './types';
import './App.modern.css';

/**
 * Properties for the ModernDiary component.
 */
interface ModernDiaryProps {
  entries: DiaryEntry[];
  title: string;
  content: string;
  setTitle: (v: string) => void;
  setContent: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (id: number) => void;
}

/**
 * ModernDiary component renders a clean, minimalist interface with a modern card layout
 * and indigo design accents.
 */
function ModernDiary({ entries, title, content, setTitle, setContent, onSubmit, onDelete }: ModernDiaryProps) {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#111827]">
      <div className="max-w-xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
        
        {/* Header section with an accent dot indicator and title */}
        <header className="mb-10 flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5B5BD6]" />
          <h1 className="font-modern-display font-semibold text-2xl tracking-tight">
            My Entries
          </h1>
        </header>

        {/* New entry submission form container */}
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm px-5 py-5 mb-10"
        >
          {/* Input field for the diary entry title */}
          <input
            type="text"
            placeholder="Entry title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-modern-body w-full text-[15px] font-medium bg-transparent border-0 pb-3 mb-3 border-b border-[#E5E7EB] focus:outline-none focus:border-[#5B5BD6] placeholder:text-[#9CA3AF] transition-colors"
          />

          {/* Textarea for the diary entry content */}
          <textarea
            placeholder="Write your thoughts here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="font-modern-body w-full text-[14px] leading-relaxed bg-transparent border-0 resize-none focus:outline-none placeholder:text-[#9CA3AF]"
          />

          {/* Form Submit button wrapper */}
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              className="font-modern-body flex items-center gap-1.5 text-sm font-medium bg-[#5B5BD6] text-white px-4 py-2 rounded-lg hover:bg-[#4A4AC4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B5BD6] focus:ring-offset-2 focus:ring-offset-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Save entry
            </button>
          </div>
        </form>

        {/* Entries section header and count tracker */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-modern-body text-xs font-medium uppercase tracking-wide text-[#6B7280]">
            Entries
          </h2>
          {entries.length > 0 && (
            <span className="font-modern-mono text-xs text-[#9CA3AF]">
              {entries.length}
            </span>
          )}
        </div>
        
        {/* Conditionally render the list of entries or a blank slate message */}
        {entries.length === 0 ? (
          <div className="border border-[#E5E7EB] rounded-2xl px-6 py-10 text-center bg-white/50">
            <p className="font-modern-body text-sm font-medium text-[#111827]">No entries yet</p>
            <p className="font-modern-body text-sm text-[#9CA3AF] mt-1">Write your first one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="modern-card modern-fade-in bg-white rounded-2xl border border-[#E5E7EB] shadow-sm pl-7 pr-4 py-4"
              >
                {/* Entry card header containing title and formatted date */}
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h3 className="font-modern-display font-medium text-[16px] leading-snug">
                    {entry.title}
                  </h3>
                  <span className="font-modern-mono text-[11px] text-[#6B7280] bg-[#F3F4F6] rounded-md px-2 py-1 whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Entry content displayed in a paragraph with preserved whitespace */}
                <p className="font-modern-body text-[14px] leading-relaxed text-[#374151] whitespace-pre-wrap mb-3">
                  {entry.content}
                </p>

                {/* Entry card footer with timestamp and delete button icon */}
                <div className="flex items-center justify-between">
                  <span className="font-modern-mono text-[11px] text-[#9CA3AF]">
                    {new Date(entry.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => onDelete(entry.id)}
                    aria-label="Delete entry"
                    title="Delete entry"
                    className="text-[#9CA3AF] hover:text-[#DC2626] transition-colors focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:ring-offset-2 focus:ring-offset-white rounded-md p-1"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ModernDiary;