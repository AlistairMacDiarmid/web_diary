/**
 * @file ClassDiary.tsx
 * @description Classic notebook-themed diary layout featuring interactive tearable pages,
 * spiral binding graphics, and a handwritten aesthetic.
 */

import React, { useRef, useState } from 'react';
import type { DiaryEntry } from './types';
import './App.css';

/**
 * Properties for the ClassicDiary component.
 */
interface ClassicDiaryProps {
  entries: DiaryEntry[];
  title: string;
  content: string;
  setTitle: (v: string) => void;
  setContent: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (id: number) => void;
}

/**
 * Generates a deterministic, subtle handwritten rotation class for each entry based on its ID.
 */
const tiltFor = (id: number) => {
  const tilts = ['-rotate-[0.6deg]', 'rotate-[0.4deg]', '-rotate-[0.3deg]', 'rotate-[0.7deg]'];
  return tilts[id % tilts.length];
};

/** Distance threshold (in pixels) required to trigger the "tear" deletion effect */
const TEAR_THRESHOLD = 90;

/** Maximum drag limit for the corner peel interaction */
const MAX_DRAG = 220;

/**
 * Properties for the TearableEntry component.
 */
interface TearableEntryProps {
  entry: DiaryEntry;
  tiltClass: string;
  onDelete: (id: number) => void;
}

/**
 * A single diary entry card that allows users to drag its top-right corner 
 * to "tear" the page out and delete it.
 */
function TearableEntry({ entry, tiltClass, onDelete }: TearableEntryProps) {
  // State for tracking the drag offset and whether the entry is currently being dragged
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });

  // Calculate the distance dragged and clamp it to the maximum drag distance
  const distance = Math.sqrt(drag.x * drag.x + drag.y * drag.y);
  const clampedDistance = Math.min(distance, MAX_DRAG);
  const progress = clampedDistance / MAX_DRAG;

  /** Pointer down handler to initiate the corner drag interaction */
  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  };

  /** Pointer move handler to update the drag coordinates */
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    // Only track the "pull away" direction: down and/or left, away from the corner
    setDrag({ x: Math.min(dx, 0), y: Math.max(dy, 0) });
  };

  /** Completes the drag interaction and deletes the entry if the threshold is met */
  const finishDrag = () => {
    setDragging(false);
    if (distance > TEAR_THRESHOLD) {
      onDelete(entry.id);
    }
    setDrag({ x: 0, y: 0 });
  };

  const handlePointerUp = () => finishDrag();
  const handlePointerCancel = () => finishDrag();

  /** Keyboard handler for accessibility: pressing Enter or Space triggers entry deletion */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDelete(entry.id);
    }
  };

  return (
    <div
      className={`relative ${tiltClass} bg-[#F6F1E4] rounded-sm border border-[#1F2A44]/10 shadow-sm px-6 py-5 hover:rotate-0`}
      style={{
        transform: `rotate(${drag.x * 0.06}deg) translate(${drag.x * 0.4}px, ${drag.y * 0.4}px)`,
        opacity: 1 - progress * 0.85,
        transition: dragging ? 'none' : 'transform 0.25s ease-out, opacity 0.25s ease-out',
      }}
    >
      {/* Torn-paper backing, revealed as the corner peels away */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-6 h-6 bg-[#DCD3BC]"
        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
      />

      {/* Draggable dog-ear handle: pull to tear the page out */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Tear out entry "${entry.title}" to delete it`}
        title="Drag to tear off"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
        className="absolute top-0 right-0 w-6 h-6 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-[#A6403F] rounded-tr-sm"
        style={{
          touchAction: 'none',
          transform: `rotate(${8 + progress * 55}deg) translate(${progress * 14}px, ${progress * -6}px)`,
          transformOrigin: 'top right',
          transition: dragging ? 'none' : 'transform 0.25s ease-out',
        }}
      >
        <div
          className="w-full h-full bg-[#EDE6D6] border-b border-l border-[#1F2A44]/10"
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)', filter: 'drop-shadow(-1px 1px 1px rgba(31,42,68,0.15))' }}
        />
      </div>

      {/* Entry header content containing title and creation date */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-display text-xl font-medium leading-snug">
          {entry.title}
        </h3>
        <span className="font-hand text-lg text-[#A6403F] whitespace-nowrap pt-1">
          {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      <p className="font-body text-[15px] leading-relaxed text-[#1F2A44]/85 whitespace-pre-wrap mb-4">
        {entry.content}
      </p>

      {/* Footer containing timestamp and fallback delete button */}
      <div className="flex items-center justify-between">
        <span className="font-body text-xs text-[#1F2A44]/40">
          {new Date(entry.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </span>
        <button
          onClick={() => onDelete(entry.id)}
          className="font-body text-xs font-medium text-[#A6403F]/70 hover:text-[#A6403F] hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-[#A6403F] focus:ring-offset-2 focus:ring-offset-[#F6F1E4] rounded-sm px-1"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/**
 * The main ClassicDiary component that renders the classic notebook layout with spiral binding,
 * a form for creating new entries, and a list of previous entries.
 */
function ClassicDiary({ entries, title, content, setTitle, setContent, onSubmit, onDelete }: ClassicDiaryProps) {
  return (
    <div className="min-h-screen bg-[#EDE6D6] text-[#1F2A44]">
      <div className="flex">
        {/* Decorative left-hand spiral notebook binding graphics */}
        <div aria-hidden="true" className="hidden sm:flex flex-col items-center w-12 shrink-0 py-10 gap-[18px]">
          {Array.from({ length: 22 }).map((_, i) => (
            <span
              key={i}
              className="w-4 h-4 rounded-full border-2 border-[#1F2A44]/25 bg-[#EDE6D6] shadow-[inset_0_0_0_2px_#EDE6D6]"
            />
          ))}
        </div>
        
        {/* Main content area containing the diary interface */}
        <div className="flex-1 max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          {/* Header text and decorative divider */}
          <header className="mb-10">
            <p className="font-hand text-xl text-[#A6403F] -mb-1">a place to keep your thoughts</p>
            <h1 className="font-display font-semibold text-4xl sm:text-5xl tracking-tight">
              My Diary
            </h1>
            <div className="mt-3 h-px w-24 bg-[#C89B4A]" />
          </header>

          {/* New entry submission form container */}
          <form
            onSubmit={onSubmit}
            className="relative dog-ear bg-[#F6F1E4] rounded-sm border border-[#1F2A44]/10 shadow-sm px-6 py-6 mb-14"
          >
            <p className="font-hand text-lg text-[#6E7860] mb-3">today's page</p>

            {/* Input fields for the new diary entry: title and content */}
            <input
              type="text"
              placeholder="Go, give it a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-display w-full text-xl font-medium bg-transparent border-0 border-b border-[#1F2A44]/15 pb-2 mb-4 focus:outline-none focus:border-[#A6403F] placeholder:text-[#1F2A44]/30 transition-colors"
            />
            <textarea
              placeholder="write it down..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="ruled-textarea font-body w-full text-[15px] bg-transparent border-0 resize-none focus:outline-none placeholder:text-[#1F2A44]/30"
            />

            {/* Submit button for saving the new diary entry */}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="font-body font-medium text-sm bg-[#1F2A44] text-[#EDE6D6] px-5 py-2.5 rounded-sm hover:bg-[#A6403F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#A6403F] focus:ring-offset-2 focus:ring-offset-[#F6F1E4]"
              >
                Save entry
              </button>
            </div>
          </form>

          {/* Previous entries section heading and count counter */}
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display text-lg font-medium text-[#1F2A44]/80">
              Previous entries
            </h2>
            {entries.length > 0 && (
              <span className="font-body text-xs text-[#1F2A44]/40">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </div>

          {/* Conditionally render the list of previous entries or a blank slate message */}
          {entries.length === 0 ? (
            <div className="border border-dashed border-[#1F2A44]/20 rounded-sm px-6 py-10 text-center">
              <p className="font-hand text-2xl text-[#6E7860]">The page is blank.</p>
              <p className="font-body text-sm text-[#1F2A44]/50 mt-1">Start writing above.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => (
                <TearableEntry
                  key={entry.id}
                  entry={entry}
                  tiltClass={tiltFor(entry.id)}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClassicDiary;