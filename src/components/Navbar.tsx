import React from 'react';
import { Sparkles, Trophy, Flame, User, Palette } from 'lucide-react';
import { UserProfile } from '../types/index.js';

interface NavbarProps {
  activeTab: 'home' | 'superpowers' | 'canvas' | 'squads' | 'wall' | 'challenges' | 'tour';
  setActiveTab: (tab: 'home' | 'superpowers' | 'canvas' | 'squads' | 'wall' | 'challenges' | 'tour') => void;
  user: UserProfile;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, user, onOpenProfile }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF5]/95 backdrop-blur-md border-b-3 border-neutral-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-12 h-12 rounded-full bg-amber-300 border-2.5 border-neutral-900 flex items-center justify-center brutal-shadow-sm group-hover:rotate-6 transition-transform">
            <span className="text-2xl">✏️</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight font-doodle text-neutral-900">
                Doodle<span className="text-indigo-600">Squad</span>
              </span>
              <span className="text-xl">🐣</span>
            </div>
            <span className="text-xs font-hand text-neutral-700 font-bold tracking-wide -mt-1">
              Where Brainstorms Hatch!
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3 text-sm font-bold">
          <button
            onClick={() => setActiveTab('tour')}
            className={`px-3 py-1.5 rounded-xl transition-all border-2 flex items-center gap-1.5 relative ${
              activeTab === 'tour'
                ? 'bg-amber-300 border-neutral-900 text-neutral-950 brutal-shadow-sm font-black'
                : 'border-neutral-900 bg-amber-100 hover:bg-amber-200 text-neutral-900 brutal-shadow-sm'
            }`}
          >
            <span>🎬</span>
            <span>Video Tour</span>
            <span className="px-1.5 py-0.2 text-[9px] font-black bg-indigo-600 text-white rounded-full uppercase tracking-tighter">
              AI Dubbed
            </span>
          </button>

          <button
            onClick={() => setActiveTab('superpowers')}
            className={`px-3.5 py-2 rounded-xl transition-all border-2 flex items-center gap-1.5 ${
              activeTab === 'superpowers'
                ? 'bg-indigo-100 border-neutral-900 text-indigo-900 brutal-shadow-sm font-extrabold'
                : 'border-transparent text-neutral-700 hover:border-neutral-900 hover:bg-neutral-100/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Superpowers</span>
          </button>

          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-3.5 py-2 rounded-xl transition-all border-2 flex items-center gap-1.5 ${
              activeTab === 'canvas'
                ? 'bg-rose-100 border-neutral-900 text-rose-900 brutal-shadow-sm font-extrabold'
                : 'border-transparent text-neutral-700 hover:border-neutral-900 hover:bg-neutral-100/60'
            }`}
          >
            <Palette className="w-4 h-4 text-rose-600" />
            <span>Live Canvas</span>
          </button>

          <button
            onClick={() => setActiveTab('squads')}
            className={`px-3.5 py-2 rounded-xl transition-all border-2 flex items-center gap-1.5 ${
              activeTab === 'squads'
                ? 'bg-emerald-100 border-neutral-900 text-emerald-900 brutal-shadow-sm font-extrabold'
                : 'border-transparent text-neutral-700 hover:border-neutral-900 hover:bg-neutral-100/60'
            }`}
          >
            <span className="text-base">👥</span>
            <span>Study Squads</span>
          </button>

          <button
            onClick={() => setActiveTab('wall')}
            className={`px-3.5 py-2 rounded-xl transition-all border-2 flex items-center gap-1.5 ${
              activeTab === 'wall'
                ? 'bg-amber-100 border-neutral-900 text-amber-900 brutal-shadow-sm font-extrabold'
                : 'border-transparent text-neutral-700 hover:border-neutral-900 hover:bg-neutral-100/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Wall of Fame</span>
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Try Sandbox Button (Matches original screenshot) */}
          <button
            onClick={() => setActiveTab('canvas')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-900 font-bold text-sm rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn"
          >
            <span className="text-base">🖌️</span>
            <span>Try Sandbox</span>
          </button>

          {/* User Streak & Level Pill */}
          <div 
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-neutral-900 rounded-xl cursor-pointer brutal-shadow-sm select-none"
            title="Click to view stickers and achievements"
          >
            <div className="flex items-center gap-1 text-xs font-black text-orange-600">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-600 animate-pulse" />
              <span>{user.streakDays}d</span>
            </div>
            <div className="h-4 w-px bg-neutral-300" />
            <div className="flex items-center gap-1 text-xs font-black text-amber-700">
              <span>⭐</span>
              <span>{user.xp}</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-indigo-200 border border-neutral-900 flex items-center justify-center text-xs ml-0.5">
              {user.avatar}
            </div>
          </div>
        </div>

      </div>

      {/* Mobile nav bar row */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-neutral-200 bg-[#FFFDF5] text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('tour')}
          className={`px-2 py-1 rounded-lg ${activeTab === 'tour' ? 'bg-amber-300 text-neutral-950 font-black' : 'text-neutral-700'}`}
        >
          🎬 Video
        </button>
        <button
          onClick={() => setActiveTab('superpowers')}
          className={`px-2 py-1.5 rounded-lg ${activeTab === 'superpowers' ? 'bg-indigo-100 text-indigo-900 font-black' : 'text-neutral-600'}`}
        >
          Superpowers
        </button>
        <button
          onClick={() => setActiveTab('canvas')}
          className={`px-2 py-1.5 rounded-lg ${activeTab === 'canvas' ? 'bg-rose-100 text-rose-900 font-black' : 'text-neutral-600'}`}
        >
          Canvas
        </button>
        <button
          onClick={() => setActiveTab('squads')}
          className={`px-2 py-1.5 rounded-lg ${activeTab === 'squads' ? 'bg-emerald-100 text-emerald-900 font-black' : 'text-neutral-600'}`}
        >
          Squads
        </button>
        <button
          onClick={() => setActiveTab('wall')}
          className={`px-2 py-1.5 rounded-lg ${activeTab === 'wall' ? 'bg-amber-100 text-amber-900 font-black' : 'text-neutral-600'}`}
        >
          Wall
        </button>
      </div>
    </header>
  );
};
