'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import StoriesFeed from '@/components/stories/StoriesFeed';
import SeeMoreButton from '@/components/stories/SeeMoreButton';
import {
  GraduationCap,
  BookOpen,
  CalendarDays,
  Building2,
  Handshake,
  Rocket,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Briefcase,
  Search,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

// ─── Interactive Constellation Network Canvas ─────────────────────────────────
function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes configuration
    const nodeCount = Math.floor(Math.min(width, 1200) / 32);
    const nodes: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseAlpha: number;
    }[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.8 + 1.2,
        baseAlpha: Math.random() * 0.35 + 0.15,
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 130, 26, ${node.baseAlpha})`;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 110;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.16;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(196, 130, 26, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Mouse attraction lines
        const mdx = mouseX - node.x;
        const mdy = mouseY - node.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 140) {
          const mAlpha = (1 - mDist / 140) * 0.35;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(196, 130, 26, ${mAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto opacity-70"
      aria-hidden="true"
    />
  );
}

// ─── Featured Spotlight Alumni Data ──────────────────────────────────────────
const SPOTLIGHT_ALUMNI = [
  {
    name: 'Ananya Sharma',
    batch: 'Batch of 2019',
    degree: 'B.Tech Computer Science',
    role: 'Senior AI Engineer',
    company: 'Google',
    location: 'Bengaluru / Mountain View',
    mentoring: 'Machine Learning & Tech Careers',
    avatarBg: 'bg-[#3d3222]',
    avatarColor: 'text-[#e8a93c]',
    initials: 'AS',
    quote: 'Connecting with juniors through AlumniConnect led to 3 direct job referrals last quarter.',
  },
  {
    name: 'Rohan Deshmukh',
    batch: 'Batch of 2017',
    degree: 'B.Com & Economics',
    role: 'Product Strategy Lead',
    company: 'Microsoft',
    location: 'Hyderabad / Seattle',
    mentoring: 'Product Management & Startups',
    avatarBg: 'bg-[#261f15]',
    avatarColor: 'text-[#c4821a]',
    initials: 'RD',
    quote: 'The mentorship program bridges academic foundation with real-world leadership.',
  },
  {
    name: 'Priya Mukherjee',
    batch: 'Batch of 2021',
    degree: 'B.Sc Statistics & Data',
    role: 'Management Consultant',
    company: 'Deloitte',
    location: 'Mumbai / London',
    mentoring: 'Strategy Consulting & Case Interviews',
    avatarBg: 'bg-[#3a5c3e]',
    avatarColor: 'text-[#7aab7e]',
    initials: 'PM',
    quote: 'Xavier alumni network opened doors for international consulting opportunities.',
  },
];

// ─── Live Activity Opportunities ──────────────────────────────────────────────
const LIVE_OPPORTUNITIES = [
  {
    title: 'Software Development Engineer II',
    company: 'Amazon Web Services',
    type: 'Alumni Referral',
    batchPref: '2019-2023',
    time: '2h ago',
  },
  {
    title: 'Associate Product Manager',
    company: 'FinTech Innovations',
    type: 'Direct Opening',
    batchPref: '2022-2024',
    time: '5h ago',
  },
  {
    title: '1:1 Career Guidance Workshop',
    company: 'Xavier Mentorship Cell',
    type: 'Masterclass',
    batchPref: 'All Batches',
    time: 'Upcoming Saturday',
  },
];

// ─── Stat Counter Item ────────────────────────────────────────────────────────
interface StatItemProps {
  number: string;
  label: string;
  sub: string;
  Icon: React.ComponentType<{ className?: string }>;
}

function StatItem({ number, label, sub, Icon }: StatItemProps) {
  return (
    <div className="flex flex-col px-5 py-4 group hover:bg-[#f4efe6]/50 rounded-xl transition-colors">
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className="w-8 h-8 rounded-lg bg-[#1a1410]/5 text-[#c4821a] flex items-center justify-center group-hover:bg-[#c4821a]/15 group-hover:text-[#c4821a] transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-2xl sm:text-3xl font-mono font-bold text-[#1a1410] tracking-tight">
          {number}
        </span>
      </div>
      <span className="text-xs font-semibold text-[#1a1410] tracking-tight">
        {label}
      </span>
      <span className="text-[11px] font-mono text-[#7d6a4f] mt-0.5">
        {sub}
      </span>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
interface FeatureCardProps {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  tag: string;
  href: string;
}

function FeatureCard({ Icon, title, desc, tag, href }: FeatureCardProps) {
  return (
    <div className="group flex flex-col justify-between p-7 rounded-2xl bg-white border border-[#1a1410]/12 shadow-sm hover:border-[#c4821a]/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="w-12 h-12 rounded-xl bg-[#1a1410] text-[#e8a93c] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#7d6a4f] bg-[#f4efe6] px-2.5 py-1 rounded-md border border-[#1a1410]/10">
            {tag}
          </span>
        </div>
        <h3 className="text-lg font-semibold font-serif text-[#1a1410] mb-2.5 group-hover:text-[#c4821a] transition-colors">
          {title}
        </h3>
        <p className="text-[#5c4d37] text-sm leading-relaxed">
          {desc}
        </p>
      </div>
      <div className="mt-6 pt-4 border-t border-[#1a1410]/10">
        <Link
          href={href}
          className="inline-flex items-center text-xs font-medium text-[#c4821a] hover:text-[#e8a93c] transition-colors focus:outline-none focus:underline"
        >
          <span>Verified member benefit</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

// ─── Social Link Card ─────────────────────────────────────────────────────────
interface SocialCardProps {
  href: string;
  icon: string;
  label: string;
  sub: string;
}

function SocialCard({ href, icon, label, sub }: SocialCardProps) {
  const isMail = href.startsWith('mailto');
  return (
    <a
      href={href}
      target={isMail ? undefined : '_blank'}
      rel={isMail ? undefined : 'noopener noreferrer'}
      className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-[#1a1410]/12 shadow-sm hover:border-[#c4821a]/60 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="w-14 h-14 bg-[#f4efe6] rounded-2xl border border-[#1a1410]/10 flex items-center justify-center mb-3.5 p-3 group-hover:scale-105 transition-transform duration-300">
        <img src={icon} alt={label} className="w-full h-full object-contain" />
      </div>
      <span className="font-semibold text-sm text-[#1a1410] group-hover:text-[#c4821a] transition-colors">
        {label}
      </span>
      <span className="text-xs text-[#7d6a4f] font-mono mt-0.5">{sub}</span>
    </a>
  );
}

// ─── Main Hero / Home Page ───────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'spotlight' | 'opportunities'>('spotlight');
  const [spotlightIdx, setSpotlightIdx] = useState(0);

  // Auto rotate spotlight
  useEffect(() => {
    if (activeTab !== 'spotlight') return;
    const interval = setInterval(() => {
      setSpotlightIdx((prev) => (prev + 1) % SPOTLIGHT_ALUMNI.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [activeTab]);

  const currentAlumni = SPOTLIGHT_ALUMNI[spotlightIdx];

  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20 selection:text-[#1a1410]">

      {/* ══════════════════════════════════════════════
          ULTRA-LEVEL HERO STAGE (INTERACTIVE SPLIT)
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-5 pb-16 sm:pt-7 sm:pb-20 lg:pt-8 lg:pb-24 border-b border-[#1a1410]/10">
        
        {/* Living Constellation Canvas Background */}
        <ConstellationCanvas />

        {/* Subtle Architectural Grid Texture */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(26,20,16,0.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(26,20,16,0.05) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">

            {/* ── Left Column: High-Impact Editorial Presentation ── */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Status Stamp / Insignia */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#3a5c3e]/30 bg-[#3a5c3e]/10 text-[#3a5c3e] font-mono text-xs uppercase tracking-wider mb-6 shadow-2xs backdrop-blur-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3a5c3e] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3a5c3e]" />
                </span>
                <span className="font-medium">500+ Verified Alumni Network · Est. 2013</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl xl:text-[4.25rem] font-normal font-serif text-[#1a1410] tracking-tight leading-[1.06] mb-6">
                Where Xaverians <br />
                <span className="italic text-[#c4821a]">stay connected</span> <br />
                <span className="text-[#3d3222] font-serif">&amp; build the future.</span>
              </h1>

              {/* Editorial Subtext */}
              <p className="text-base sm:text-lg text-[#5c4d37] mb-8 max-w-xl leading-relaxed font-normal">
                Bridge the gap between campus and lifelong career distinction. Access exclusive job referrals, high-trust 1:1 mentorship, and worldwide regional alumni chapters.
              </p>

              {/* Primary Dual Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#1a1410] text-[#f4efe6] px-7 py-3.5 font-semibold text-sm sm:text-base border border-[#3d3222]/50 shadow-sm hover:bg-[#3d3222] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#e8a93c]" />
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#1a1410] text-[#f4efe6] px-7 py-3.5 font-semibold text-sm sm:text-base border border-[#3d3222]/50 shadow-sm hover:bg-[#3d3222] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <span>Join the Network</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#e8a93c]" />
                  </Link>
                )}
                
                <Link
                  href="/directory"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl border border-[#1a1410]/15 bg-white/90 backdrop-blur-sm px-6 py-3.5 font-semibold text-[#1a1410] text-sm sm:text-base hover:bg-white hover:border-[#1a1410]/30 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <Search className="w-4 h-4 text-[#7d6a4f] group-hover:text-[#1a1410] transition-colors" />
                  <span>Search Alumni Directory</span>
                </Link>
              </div>

              {/* Social Proof Badges */}
              <div className="pt-6 border-t border-[#1a1410]/10 flex flex-col sm:flex-row sm:items-center gap-3.5 text-xs text-[#5c4d37]">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#f4efe6] bg-[#3d3222] text-[#e8a93c] flex items-center justify-center font-bold text-[11px]">
                    AS
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#f4efe6] bg-[#261f15] text-[#c4821a] flex items-center justify-center font-bold text-[11px]">
                    RD
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#f4efe6] bg-[#3a5c3e] text-[#7aab7e] flex items-center justify-center font-bold text-[11px]">
                    PM
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#f4efe6] bg-[#1a1410] text-[#f4efe6] flex items-center justify-center font-bold text-[11px]">
                    +500
                  </div>
                </div>
                <div className="leading-snug">
                  <span className="font-semibold text-[#1a1410]">Leading innovators worldwide</span>
                  <p className="text-[#7d6a4f] font-mono text-[11px]">Google · Microsoft · Amazon · Deloitte · Tata</p>
                </div>
              </div>

            </div>

            {/* ── Right Column: Interactive Alumni Spotlight Stage ── */}
            <div className="lg:col-span-5 relative">

              {/* Stage Frame Container */}
              <div className="relative bg-white/95 backdrop-blur-md rounded-2xl border border-[#1a1410]/15 shadow-xl p-6 sm:p-7 overflow-hidden transition-all">
                
                {/* Gold Seal Watermark */}
                <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-5 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#c4821a] to-transparent" />

                {/* Stage Header & Tab Switcher */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#1a1410]/10">
                  <div className="flex items-center gap-1.5 p-1 bg-[#f4efe6] rounded-xl border border-[#1a1410]/10">
                    <button
                      onClick={() => setActiveTab('spotlight')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                        activeTab === 'spotlight'
                          ? 'bg-[#1a1410] text-[#f4efe6] shadow-xs'
                          : 'text-[#5c4d37] hover:text-[#1a1410]'
                      }`}
                    >
                      Spotlight
                    </button>
                    <button
                      onClick={() => setActiveTab('opportunities')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1 ${
                        activeTab === 'opportunities'
                          ? 'bg-[#1a1410] text-[#f4efe6] shadow-xs'
                          : 'text-[#5c4d37] hover:text-[#1a1410]'
                      }`}
                    >
                      <span>Referrals</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c4821a]" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#7d6a4f] font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#3a5c3e]" />
                    <span className="hidden sm:inline">100% Verified</span>
                  </div>
                </div>

                {/* Tab 1: Alumni Spotlight Carousel */}
                {activeTab === 'spotlight' && (
                  <div className="space-y-4">
                    {/* Alumni Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-xl ${currentAlumni.avatarBg} ${currentAlumni.avatarColor} flex items-center justify-center font-serif text-lg font-bold shadow-sm ring-1 ring-[#1a1410]/10`}>
                          {currentAlumni.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif font-semibold text-base sm:text-lg text-[#1a1410]">
                              {currentAlumni.name}
                            </h3>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#3a5c3e]" />
                          </div>
                          <p className="text-xs text-[#7d6a4f] font-mono">
                            {currentAlumni.batch} · {currentAlumni.degree}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Current Position Card */}
                    <div className="p-3.5 rounded-xl bg-[#f4efe6]/80 border border-[#1a1410]/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#1a1410] flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-[#c4821a]" />
                          {currentAlumni.role}
                        </span>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#1a1410] text-[#f4efe6]">
                          {currentAlumni.company}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7d6a4f] font-mono pl-5">
                        📍 {currentAlumni.location}
                      </p>
                    </div>

                    {/* Mentoring Pill & Quote */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#1a1410]/10 shadow-2xs">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#3a5c3e] mb-1.5">
                        <Sparkles className="w-3 h-3 text-[#c4821a]" />
                        <span>Mentoring Focus: {currentAlumni.mentoring}</span>
                      </div>
                      <p className="text-xs italic text-[#5c4d37] leading-relaxed">
                        &ldquo;{currentAlumni.quote}&rdquo;
                      </p>
                    </div>

                    {/* Bottom Spotlight Controls */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-1.5">
                        {SPOTLIGHT_ALUMNI.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSpotlightIdx(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              idx === spotlightIdx
                                ? 'w-6 bg-[#c4821a]'
                                : 'w-2 bg-[#1a1410]/20 hover:bg-[#1a1410]/40'
                            }`}
                            aria-label={`Go to alumni ${idx + 1}`}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSpotlightIdx((prev) => (prev - 1 + SPOTLIGHT_ALUMNI.length) % SPOTLIGHT_ALUMNI.length)}
                          className="w-7 h-7 rounded-lg border border-[#1a1410]/15 flex items-center justify-center hover:bg-[#f4efe6] text-[#1a1410] transition-colors"
                          aria-label="Previous alumni"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSpotlightIdx((prev) => (prev + 1) % SPOTLIGHT_ALUMNI.length)}
                          className="w-7 h-7 rounded-lg border border-[#1a1410]/15 flex items-center justify-center hover:bg-[#f4efe6] text-[#1a1410] transition-colors"
                          aria-label="Next alumni"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <Link
                          href="/directory"
                          className="text-xs font-semibold text-[#1a1410] hover:text-[#c4821a] flex items-center gap-1 ml-1 transition-colors"
                        >
                          <span>Connect</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#c4821a]" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Live Referral & Opportunity Board */}
                {activeTab === 'opportunities' && (
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono text-[#7d6a4f] uppercase tracking-wider mb-2">
                      Recent Alumni Postings &amp; Events
                    </div>
                    {LIVE_OPPORTUNITIES.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#f4efe6]/80 border border-[#1a1410]/10 hover:border-[#c4821a]/50 hover:bg-white transition-all flex items-start justify-between gap-2"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-[#1a1410] leading-tight">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-[#5c4d37] font-mono mt-0.5">
                            {item.company} · {item.batchPref}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#c4821a]/15 text-[#c4821a] border border-[#c4821a]/20">
                            {item.type}
                          </span>
                          <p className="text-[10px] text-[#7d6a4f] font-mono mt-1">{item.time}</p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 text-center">
                      <Link
                        href="/jobs"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a1410] hover:text-[#c4821a] transition-colors"
                      >
                        <span>View all career opportunities</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#c4821a]" />
                      </Link>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* ── High-Craft Metrics Anchor Panel ── */}
          <div className="mt-14 sm:mt-16 bg-white/95 backdrop-blur-md rounded-2xl border border-[#1a1410]/12 p-3 sm:p-5 shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 divide-y sm:divide-y-0 sm:divide-x divide-[#1a1410]/10">
              <StatItem
                number="500+"
                label="Connected Alumni"
                sub="18+ Global Chapters"
                Icon={GraduationCap}
              />
              <div className="pt-3 sm:pt-0">
                <StatItem
                  number="200+"
                  label="Active Students"
                  sub="Campus Mentorships"
                  Icon={BookOpen}
                />
              </div>
              <div className="pt-3 sm:pt-0">
                <StatItem
                  number="20+"
                  label="Events Hosted"
                  sub="Reunions & Workshops"
                  Icon={CalendarDays}
                />
              </div>
              <div className="pt-3 sm:pt-0">
                <StatItem
                  number="5+"
                  label="Academic Depts"
                  sub="Cross-Disciplinary"
                  Icon={Building2}
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY ALUMNICONNECT (FEATURES) SECTION
      ══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-[#e8dfd0]/40 border-b border-[#1a1410]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#c4821a] mb-2 font-medium">
              Why AlumniConnect
            </div>
            <h2 className="text-3xl sm:text-4xl font-normal font-serif text-[#1a1410] tracking-tight mb-3">
              Everything you need to grow
            </h2>
            <p className="text-sm sm:text-base text-[#5c4d37] leading-relaxed">
              Purpose-built tools to keep your collegiate network active, accessible, and mutually supportive throughout your career.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <FeatureCard
              Icon={Handshake}
              tag="Networking"
              title="Strong Networking"
              desc="Connect with seniors and batchmates working in top companies globally. Build relationships that last a lifetime."
              href="/directory"
            />
            <FeatureCard
              Icon={CalendarDays}
              tag="Gatherings"
              title="Exclusive Events"
              desc="Get invited to reunions, tech talks, and career guidance workshops curated specifically for Xaverians."
              href="/events"
            />
            <FeatureCard
              Icon={Rocket}
              tag="Mentorship"
              title="Career Growth"
              desc="Find job referrals, mentorship opportunities, and internships — all through your trusted alumni network."
              href="/jobs"
            />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ALUMNI STORIES SECTION
      ══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-[#f4efe6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col items-center text-center gap-3.5 mb-12">
            <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#c4821a] font-medium">
              Community Voices
            </div>
            <h2 className="text-3xl sm:text-4xl font-normal font-serif text-[#1a1410] tracking-tight">
              Alumni Stories
            </h2>
            <p className="text-sm text-[#5c4d37] max-w-md">
              Real journeys, career insights, and authentic inspiration from across batches.
            </p>

            <div className="flex gap-2 flex-wrap justify-center mt-2">
              {['Career', 'Growth', 'Mentorship', 'Success'].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-white text-[#5c4d37] border border-[#1a1410]/12 shadow-2xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stories Feed Container */}
          <div className="max-w-4xl mx-auto">
            <StoriesFeed previewMode={true} currentUser={user} />
          </div>

          <div className="mt-12 flex justify-center">
            <SeeMoreButton />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CONNECT WITH US SECTION
      ══════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-[#e8dfd0]/40 border-t border-[#1a1410]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#c4821a] mb-2 font-medium">
            Stay Updated
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal font-serif text-[#1a1410] tracking-tight mb-2">
            Connect With Us
          </h2>
          <p className="text-sm text-[#5c4d37] mb-10 max-w-lg mx-auto">
            Follow our official communication channels for university updates and alumni initiatives.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 max-w-3xl mx-auto">
            <SocialCard
              href="https://xup.ac.in/"
              icon="/icons/school.png"
              label="Official Website"
              sub="xup.ac.in"
            />
            <SocialCard
              href="https://www.linkedin.com/in/xavier-alumni-association-541846322/"
              icon="/icons/linkedin.png"
              label="LinkedIn"
              sub="Professional Network"
            />
            <SocialCard
              href="https://www.instagram.com/xavieralumniassociation/"
              icon="/icons/instagram.png"
              label="Instagram"
              sub="@xavieralumni"
            />
            <SocialCard
              href="mailto:sxcmt.alumniassociation@gmail.com"
              icon="/icons/email.png"
              label="Contact Us"
              sub="Get in touch"
            />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER RECONNECT CTA (EDITORIAL WALNUT PANEL)
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 sm:py-24 bg-[#1a1410] text-[#f4efe6] text-center border-t border-[#3d3222]">
        <div
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e8a93c] to-transparent"
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">

          {/* Status Stamp */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded border border-[#3a5c3e] bg-[#3a5c3e]/20 text-[#7aab7e] font-mono text-[11px] uppercase tracking-wider mb-6">
            <ShieldCheck className="w-4 h-4 text-[#7aab7e]" />
            <span>Verified Alumni Network</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-serif text-[#f4efe6] tracking-tight mb-4 leading-tight">
            Ready to reconnect with <br />
            <span className="italic text-[#e8a93c]">fellow alumni?</span>
          </h2>

          <p className="text-sm sm:text-base text-[#bfb09a] mb-8 leading-relaxed max-w-xl mx-auto">
            Join hundreds of alumni who are actively mentoring, referring, and collaborating across the globe.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!user ? (
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#c4821a] hover:bg-[#e8a93c] text-[#1a1410] font-semibold text-sm sm:text-base px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Get Started — It&apos;s Free</span>
                <ArrowRight className="w-4 h-4 text-[#1a1410]" />
              </Link>
            ) : (
              <Link
                href="/directory"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#c4821a] hover:bg-[#e8a93c] text-[#1a1410] font-semibold text-sm sm:text-base px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore Alumni Directory</span>
                <ArrowRight className="w-4 h-4 text-[#1a1410]" />
              </Link>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}