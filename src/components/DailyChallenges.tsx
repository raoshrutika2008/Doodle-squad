import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, ArrowRight, Award, Zap } from 'lucide-react';
import { DailyChallenge, UserProfile } from '../types/index.js';
import confetti from 'canvas-confetti';

interface DailyChallengesProps {
  user: UserProfile;
  onSolveOnCanvas: (challengePrompt: string) => void;
  onAwardXp: (xp: number) => void;
}

export const DailyChallenges: React.FC<DailyChallengesProps> = ({ 
  user, 
  onSolveOnCanvas,
  onAwardXp 
}) => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);

  const fetchChallenges = async () => {
    try {
      const res = await fetch('/api/challenges');
      if (res.ok) {
        const data = await res.json();
        setChallenges(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleComplete = async (id: string, rewardXp: number) => {
    try {
      const res = await fetch(`/api/challenges/${id}/complete`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setChallenges(prev => prev.map(c => c.id === id ? data.challenge : c));
        onAwardXp(rewardXp);
        confetti({ particleCount: 50, spread: 70 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const difficultyColors = {
    'Easy': 'bg-emerald-100 text-emerald-900 border-emerald-400',
    'Medium': 'bg-amber-100 text-amber-900 border-amber-400',
    'Brain Melter': 'bg-rose-100 text-rose-900 border-rose-400'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-200 border-2 border-neutral-900 rounded-full text-xs font-bold text-amber-950 mb-2 brutal-shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-900" />
            <span>Daily Brain Warm-ups</span>
          </div>
          <h2 className="text-3xl font-black text-neutral-900 font-doodle">
            Daily Homework Challenges 🎯
          </h2>
          <p className="text-sm text-neutral-600 font-medium mt-1">
            Solve these creative sketch prompts to keep your streak alive and unlock rare stickers!
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white border-2.5 border-neutral-900 rounded-2xl brutal-shadow-sm">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-500">Active Streak</div>
            <div className="font-doodle text-lg font-black text-orange-600">{user.streakDays} Days on Fire!</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`notebook-pattern bg-white border-3 border-neutral-900 rounded-3xl p-6 brutal-shadow flex flex-col justify-between ${
              challenge.completed ? 'opacity-90 ring-2 ring-emerald-400' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${difficultyColors[challenge.difficulty]}`}>
                  {challenge.difficulty}
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  {challenge.subject}
                </span>
              </div>

              <h3 className="font-doodle text-xl font-bold text-neutral-900 mb-2">
                {challenge.title}
              </h3>

              <p className="text-xs sm:text-sm text-neutral-700 font-medium leading-relaxed mb-4">
                {challenge.prompt}
              </p>

              <div className="bg-[#FFFDF5] border-2 border-dashed border-neutral-300 rounded-xl p-3 mb-4 flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-600">Reward:</span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-amber-700">+{challenge.rewardXp} XP</span>
                  <span className="font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                    {challenge.badgeReward}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t-2 border-neutral-200">
              <button
                onClick={() => onSolveOnCanvas(challenge.prompt)}
                className="w-full py-2 bg-amber-300 hover:bg-amber-200 text-neutral-900 font-bold text-xs rounded-xl border-2 border-neutral-900 brutal-shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Draw on Canvas 🖌️</span>
              </button>

              {challenge.completed ? (
                <div className="py-2 text-center text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-400 rounded-xl flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Challenge Completed!</span>
                </div>
              ) : (
                <button
                  onClick={() => handleComplete(challenge.id, challenge.rewardXp)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn"
                >
                  Mark as Solved! (+{challenge.rewardXp} XP)
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
