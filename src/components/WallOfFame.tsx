import React, { useState, useEffect } from 'react';
import { Trophy, Star, Sparkles, Filter, ArrowUpRight, Palette, Eye } from 'lucide-react';
import { WallOfFameItem, UserProfile } from '../types/index.js';
import confetti from 'canvas-confetti';

interface WallOfFameProps {
  user: UserProfile;
  onCloneToCanvas: (item: WallOfFameItem) => void;
  onAwardXp: (xp: number) => void;
}

export const WallOfFame: React.FC<WallOfFameProps> = ({ 
  user, 
  onCloneToCanvas,
  onAwardXp 
}) => {
  const [items, setItems] = useState<WallOfFameItem[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortBy, setSortBy] = useState<'trending' | 'stars'>('trending');
  const [activeItem, setActiveItem] = useState<WallOfFameItem | null>(null);

  const fetchWallItems = async () => {
    try {
      const url = `/api/wall-of-fame?subject=${selectedSubject}&sort=${sortBy}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWallItems();
  }, [selectedSubject, sortBy]);

  const handleStar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/wall-of-fame/${id}/star`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setItems(prev => prev.map(item => item.id === id ? data.item : item));
        if (data.item.hasStarred) {
          onAwardXp(10);
          confetti({ particleCount: 25, spread: 50 });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const subjectBadges: Record<string, string> = {
    Math: 'bg-amber-100 text-amber-900 border-amber-400',
    Science: 'bg-emerald-100 text-emerald-900 border-emerald-400',
    Physics: 'bg-sky-100 text-sky-900 border-sky-400',
    Coding: 'bg-indigo-100 text-indigo-900 border-indigo-400',
    History: 'bg-rose-100 text-rose-900 border-rose-400',
    Literature: 'bg-purple-100 text-purple-900 border-purple-400'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Wall Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-200 border-2 border-neutral-900 rounded-full mb-3 brutal-shadow-sm">
          <Trophy className="w-4 h-4 text-amber-900" />
          <span className="font-doodle text-sm font-bold text-amber-950">Peer Hall of Fame</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 font-doodle mb-3">
          Community Wall of Fame 🌟
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 font-medium">
          Check out how fellow students visualize tough homework. Star your favorites or clone any sketchnote to your sandbox!
        </p>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border-3 border-neutral-900 brutal-shadow mb-8">
        
        {/* Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
          {['All', 'Math', 'Science', 'Coding', 'History'].map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border-2 transition-all whitespace-nowrap ${
                selectedSubject === sub
                  ? 'bg-amber-300 border-neutral-900 brutal-shadow-sm font-extrabold'
                  : 'border-transparent text-neutral-600 hover:border-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <span className="text-xs font-bold text-neutral-500">Sort:</span>
          <button
            onClick={() => setSortBy('trending')}
            className={`px-3 py-1 text-xs font-bold rounded-lg border ${
              sortBy === 'trending' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-100 text-neutral-700 border-neutral-300'
            }`}
          >
            Trending 🔥
          </button>
          <button
            onClick={() => setSortBy('stars')}
            className={`px-3 py-1 text-xs font-bold rounded-lg border ${
              sortBy === 'stars' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-100 text-neutral-700 border-neutral-300'
            }`}
          >
            Most Stars ⭐
          </button>
        </div>

      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="notebook-pattern bg-white border-3 border-neutral-900 rounded-3xl p-5 brutal-shadow hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-md border ${subjectBadges[item.subject] || 'bg-neutral-100 text-neutral-800 border-neutral-300'}`}>
                  {item.subject}
                </span>
                
                {/* Star Button */}
                <button
                  onClick={(e) => handleStar(item.id, e)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 transition-all text-xs font-black ${
                    item.hasStarred
                      ? 'bg-amber-300 border-neutral-900 text-neutral-950 brutal-shadow-sm'
                      : 'bg-[#FFFDF5] border-neutral-400 hover:border-neutral-900 text-neutral-700'
                  }`}
                  title="Star this explanation"
                >
                  <Star className={`w-3.5 h-3.5 ${item.hasStarred ? 'fill-neutral-900 text-neutral-900' : 'text-neutral-500'}`} />
                  <span>{item.stars}</span>
                </button>
              </div>

              {/* Title */}
              <h3 className="font-doodle text-xl font-bold text-neutral-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-neutral-700 font-medium leading-relaxed mb-4 line-clamp-3">
                {item.description}
              </p>

              {/* Sketchnote Mini Preview Box */}
              <div className="bg-[#FFFDF5] border-2 border-dashed border-neutral-400 rounded-xl p-3 mb-4 font-mono text-[11px] text-neutral-600 line-clamp-2">
                ✏️ "{item.explanationSnippet}"
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {item.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded border border-neutral-200">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author Footer */}
            <div className="flex items-center justify-between pt-3 border-t-2 border-neutral-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.authorAvatar}</span>
                <span className="font-bold text-neutral-900">{item.author}</span>
              </div>
              <span className="text-[10px] font-bold text-neutral-400">{item.createdAt}</span>
            </div>

          </div>
        ))}
      </div>

      {/* Sketchnote Full Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-3 border-neutral-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full brutal-shadow-lg max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-2.5 py-1 rounded-md border ${subjectBadges[activeItem.subject] || 'bg-neutral-100'}`}>
                  {activeItem.subject}
                </span>
                <span className="text-xs text-neutral-500 font-bold">by {activeItem.author} ({activeItem.authorAvatar})</span>
              </div>
              <button 
                onClick={() => setActiveItem(null)}
                className="w-8 h-8 rounded-full border-2 border-neutral-900 flex items-center justify-center font-bold hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <h3 className="font-doodle text-2xl sm:text-3xl font-black text-neutral-900 mb-3">
              {activeItem.title}
            </h3>

            <p className="text-sm sm:text-base text-neutral-700 font-medium leading-relaxed mb-6">
              {activeItem.description}
            </p>

            {/* Deep Explanation */}
            <div className="bg-[#FFFDF5] border-2 border-neutral-900 rounded-2xl p-5 mb-6 brutal-shadow-sm">
              <h4 className="font-doodle text-sm font-bold text-neutral-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>💡 Intuitive Chalkboard Breakdown</span>
              </h4>
              <p className="font-hand text-lg text-neutral-900 leading-relaxed font-bold">
                {activeItem.explanationSnippet}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {activeItem.tags.map(t => (
                <span key={t} className="text-xs font-bold bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-md border border-neutral-300">
                  #{t}
                </span>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t-2 border-neutral-200">
              <button
                onClick={(e) => handleStar(activeItem.id, e)}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl border-2 font-black text-sm flex items-center justify-center gap-2 ${
                  activeItem.hasStarred
                    ? 'bg-amber-300 border-neutral-900 text-neutral-900 brutal-shadow-sm'
                    : 'bg-neutral-100 border-neutral-900 text-neutral-800'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>{activeItem.hasStarred ? 'Starred!' : 'Give a Star'} ({activeItem.stars})</span>
              </button>

              <button
                onClick={() => {
                  onCloneToCanvas(activeItem);
                  setActiveItem(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn flex items-center justify-center gap-2"
              >
                <Palette className="w-4 h-4 text-amber-300" />
                <span>Clone into My Canvas 🎨</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
