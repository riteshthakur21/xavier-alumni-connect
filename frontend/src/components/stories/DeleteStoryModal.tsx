'use client';

import React, { useEffect } from 'react';
import { Trash2, X } from 'lucide-react';

interface DeleteStoryModalProps {
  isOpen: boolean;
  storyTitle?: string;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteStoryModal({
  isOpen,
  storyTitle,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteStoryModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-story-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1a1410]/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={() => {
          if (!isDeleting) onClose();
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-2xl border border-[#1a1410]/15 shadow-2xl max-w-md w-full p-6 sm:p-7 overflow-hidden z-10 animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 w-8 h-8 rounded-lg flex items-center justify-center text-[#7d6a4f] hover:text-[#1a1410] hover:bg-[#f4efe6] transition-colors disabled:opacity-40"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Trash2 className="w-6 h-6" />
        </div>

        {/* Header */}
        <h3
          id="delete-story-title"
          className="text-xl font-serif font-semibold text-[#1a1410] text-center mb-2"
        >
          Delete Story?
        </h3>

        {/* Story Title Preview (if provided) */}
        {storyTitle && (
          <div className="my-3 px-3 py-2 rounded-xl bg-[#f4efe6] border border-[#1a1410]/10 text-center">
            <p className="text-xs font-serif font-medium text-[#1a1410] line-clamp-1 italic">
              &ldquo;{storyTitle}&rdquo;
            </p>
          </div>
        )}

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#5c4d37] text-center mb-6 leading-relaxed">
          Are you sure you want to delete this story? This action cannot be undone and will permanently remove it from the alumni community.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#1a1410]/15 text-[#1a1410] font-semibold text-xs sm:text-sm hover:bg-[#f4efe6] active:bg-[#e8dfd0] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
