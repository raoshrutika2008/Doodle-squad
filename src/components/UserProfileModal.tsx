import React from 'react';
import { Flame, Star, Award, Sparkles, Smile } from 'lucide-react';
import { UserProfile } from '../types/index.js';

interface UserProfileModalProps {
  user: UserProfile;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="notebook-pattern bg-white border-3 border-neutral-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full brutal-shadow-lg">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-300 border-2.5 border-neutral-900 flex items-center justify-center text-3xl brutal-shadow-sm">
              {user.avatar}
            </div>
            <div>
              <h3 className="font-doodle text-2xl font-black text-neutral-900 leading-tight">
                {user.name}
              </h3>
              <span className="text-xs font-bold text-neutral-500 font-hand">
                DoodleSquad Scholar • Level {Math.floor(user.xp / 300) + 1}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-neutral-900 flex items-center justify-center font-bold hover:bg-neutral-100"
          >
            ✕
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-amber-100 border-2 border-neutral-900 rounded-2xl p-4 flex items-center gap-3 brutal-shadow-sm">
            <Flame className="w-8 h-8 text-orange-600 fill-orange-500 animate-pulse" />
            <div>
              <div className="text-xs font-bold text-neutral-600">Streak</div>
              <div className="font-doodle text-xl font-black text-neutral-900">{user.streakDays} Days 🔥</div>
            </div>
          </div>

          <div className="bg-indigo-100 border-2 border-neutral-900 rounded-2xl p-4 flex items-center gap-3 brutal-shadow-sm">
            <Star className="w-8 h-8 text-indigo-600 fill-indigo-400" />
            <div>
              <div className="text-xs font-bold text-neutral-600">Total XP</div>
              <div className="font-doodle text-xl font-black text-neutral-900">{user.xp} XP ⭐</div>
            </div>
          </div>
        </div>

        {/* Unlocked Badges */}
        <div className="mb-6">
          <h4 className="font-doodle text-sm font-bold text-neutral-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Unlocked Badges</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {user.badges.map(b => (
              <span key={b} className="px-3 py-1 bg-neutral-100 border-2 border-neutral-900 rounded-xl text-xs font-extrabold text-neutral-900 brutal-shadow-sm">
                🏅 {b}
              </span>
            ))}
          </div>
        </div>

        {/* Sticker Collection */}
        <div className="mb-6">
          <h4 className="font-doodle text-sm font-bold text-neutral-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-rose-500" />
            <span>Canvas Sticker Stamps</span>
          </h4>
          <div className="bg-[#FFFDF5] border-2 border-neutral-900 rounded-2xl p-3 grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-2xl">
            {user.stickers.map((s, idx) => (
              <div key={idx} className="p-2 bg-white rounded-xl border border-neutral-300 hover:scale-125 transition-transform cursor-pointer" title="Available in live canvas">
                {s}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-neutral-900 text-white font-extrabold text-sm rounded-xl hover:bg-neutral-800 transition-colors"
        >
          Close
        </button>

      </div>
    </div>
  );
};
