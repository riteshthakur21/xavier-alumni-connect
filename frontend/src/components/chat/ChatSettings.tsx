'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Monitor,
  Check,
  ChevronRight,
} from 'lucide-react';

export type AppearancePref = 'light' | 'dark' | 'system';

interface Props {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  appearance: AppearancePref;
  onSelectAppearance: (pref: AppearancePref) => void;
}

export default function ChatSettings({
  isFullscreen,
  onToggleFullscreen,
  appearance,
  onSelectAppearance,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAppearanceSubmenu, setShowAppearanceSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAppearanceSubmenu(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showAppearanceSubmenu) {
          setShowAppearanceSubmenu(false);
        } else {
          setIsOpen(false);
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, showAppearanceSubmenu]);

  const appearanceLabels: Record<AppearancePref, { label: string; icon: React.ReactNode }> = {
    light: {
      label: 'Light',
      icon: <Sun className="w-4 h-4 text-[#e8a93c]" />,
    },
    dark: {
      label: 'Dark',
      icon: <Moon className="w-4 h-4 text-[#e8a93c]" />,
    },
    system: {
      label: 'System',
      icon: <Monitor className="w-4 h-4 text-[#e8a93c]" />,
    },
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Three-dot Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setShowAppearanceSubmenu(false);
        }}
        aria-label="Chat settings"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`p-2 rounded-xl text-[#f4efe6]/80 hover:text-[#f4efe6] hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer ${
          isOpen ? 'bg-white/15 text-[#e8a93c]' : ''
        }`}
      >
        <MoreVertical className="w-5 h-5 text-[#e8a93c]" />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-2 w-56 bg-[#261f15] border border-[#3d3222] shadow-2xl rounded-2xl py-1.5 z-50 text-[#f4efe6] animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          {/* Fullscreen Option */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onToggleFullscreen();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left hover:bg-[#3d3222] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-[#e8a93c] group-hover:scale-110 transition-transform" />
              ) : (
                <Maximize2 className="w-4 h-4 text-[#e8a93c] group-hover:scale-110 transition-transform" />
              )}
              <span className="font-medium text-[#f4efe6]">
                {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              </span>
            </div>
          </button>

          {/* Divider */}
          <div className="my-1 border-t border-[#3d3222]/60" />

          {/* Appearance Parent Option */}
          <button
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={showAppearanceSubmenu}
            onClick={() => setShowAppearanceSubmenu((prev) => !prev)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left hover:bg-[#3d3222] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              {appearanceLabels[appearance].icon}
              <span className="font-medium text-[#f4efe6]">Appearance</span>
            </div>
            <div className="flex items-center gap-1 text-[#7d6a4f] text-[11px] font-mono">
              <span className="capitalize">{appearance}</span>
              <ChevronRight
                className={`w-3.5 h-3.5 text-[#e8a93c] transition-transform ${
                  showAppearanceSubmenu ? 'rotate-90' : ''
                }`}
              />
            </div>
          </button>

          {/* Appearance Submenu */}
          {showAppearanceSubmenu && (
            <div className="mt-1 mb-0.5 mx-1.5 bg-[#1a1410] border border-[#3d3222] rounded-xl p-1 space-y-0.5 shadow-inner">
              {(['light', 'dark', 'system'] as AppearancePref[]).map((pref) => {
                const isSelected = appearance === pref;
                return (
                  <button
                    key={pref}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isSelected}
                    onClick={() => {
                      onSelectAppearance(pref);
                      setIsOpen(false);
                      setShowAppearanceSubmenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#3d3222] text-[#e8a93c] font-semibold'
                        : 'text-[#f4efe6]/80 hover:bg-[#261f15] hover:text-[#f4efe6]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {appearanceLabels[pref].icon}
                      <span className="capitalize">{pref}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#e8a93c] stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
