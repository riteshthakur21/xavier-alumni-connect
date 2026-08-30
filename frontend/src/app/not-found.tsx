import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowLeft,
  Users,
  Briefcase,
  Calendar,
  Home,
  ArrowRight,
} from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f4efe6] text-[#1a1410] px-4 sm:px-6 py-12 selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      <div className="max-w-2xl w-full text-center">
        {/* Editorial Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded border border-[#c4821a]/40 bg-[#fdf3e3] text-[#c4821a] font-mono text-[11px] uppercase tracking-widest mb-6">
          <Compass className="w-3.5 h-3.5 text-[#c4821a]" />
          <span>Error 404 · Uncharted Route</span>
        </div>

        {/* Large Editorial 404 Display */}
        <div className="relative mb-3">
          <div className="font-serif text-7xl sm:text-9xl font-normal text-[#1a1410] tracking-tight select-none">
            404
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-normal font-serif text-[#1a1410] tracking-tight mb-3">
          Page not found
        </h1>
        <p className="text-sm sm:text-base text-[#5c4d37] max-w-md mx-auto leading-relaxed mb-8">
          The page or record you are searching for might have been relocated, graduated, or does not exist in the directory.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1410] hover:bg-[#3d3222] text-[#f4efe6] font-semibold text-sm rounded-xl border border-[#3d3222]/50 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#fcfbf9] text-[#1a1410] hover:text-[#c4821a] font-medium text-sm rounded-xl border border-[#1a1410]/15 shadow-sm hover:border-[#1a1410]/30 transition-all"
          >
            <span>Explore Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Directory Anchors */}
        <div className="pt-8 border-t border-[#1a1410]/10">
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#7d6a4f] mb-4 font-medium">
            Suggested Campus Portals
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <Link
              href="/directory"
              className="p-4 bg-white rounded-xl border border-[#1a1410]/12 hover:border-[#c4821a]/50 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#261f15] text-[#e8a93c] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#1a1410] group-hover:text-[#c4821a] transition-colors">
                    Alumni Directory
                  </h2>
                  <p className="text-[11px] text-[#7d6a4f] mt-0.5">Find peers & mentors</p>
                </div>
              </div>
            </Link>

            <Link
              href="/jobs"
              className="p-4 bg-white rounded-xl border border-[#1a1410]/12 hover:border-[#c4821a]/50 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#261f15] text-[#e8a93c] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#1a1410] group-hover:text-[#c4821a] transition-colors">
                    Career Board
                  </h2>
                  <p className="text-[11px] text-[#7d6a4f] mt-0.5">Explore job openings</p>
                </div>
              </div>
            </Link>

            <Link
              href="/events"
              className="p-4 bg-white rounded-xl border border-[#1a1410]/12 hover:border-[#c4821a]/50 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#261f15] text-[#e8a93c] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#1a1410] group-hover:text-[#c4821a] transition-colors">
                    Campus Events
                  </h2>
                  <p className="text-[11px] text-[#7d6a4f] mt-0.5">Reunions & chapters</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
