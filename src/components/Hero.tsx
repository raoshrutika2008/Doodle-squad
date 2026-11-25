import React, { useState } from 'react';
import { Sparkles, ArrowRight, Brain, Users, Pencil, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onQuickSolve: (problem: string) => void;
  onOpenCanvas: () => void;
  onExploreSquads: () => void;
  onOpenTour?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  onQuickSolve, 
  onOpenCanvas, 
  onExploreSquads,
  onOpenTour 
}) => {
  const [quickInput, setQuickInput] = useState('');

  const samplePrompts = [
    '2x + 5 = 17',
    'How do plants make food?',
    'Pythagorean theorem in plain english',
    'Newton 3rd law mnemonic rhyme',
    'Why did Rome fall?'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickSolve(quickInput.trim());
  };

  return (
    <section className="notebook-pattern notebook-margin-line relative py-12 md:py-20 border-b-3 border-neutral-900 overflow-hidden">
      {/* Decorative notebook doodle stickers floating */}
      <div className="absolute top-8 right-8 hidden lg:block rotate-12 bg-yellow-200 border-2 border-neutral-900 px-4 py-2 rounded-xl brutal-shadow-sm select-none">
        <span className="font-hand text-lg font-bold text-neutral-800">
          💡 Tip: Doodling boosts memory by 29%!
        </span>
      </div>

      <div className="absolute bottom-6 right-20 hidden lg:block -rotate-6 bg-emerald-200 border-2 border-neutral-900 px-3 py-1.5 rounded-xl brutal-shadow-sm select-none">
        <span className="font-doodle text-sm font-bold text-emerald-950">
          ⚡ 420+ squads active now
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Purple Pill from User's Shared Screenshot */}
        <div className="inline-block mb-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#DDD6FE] border-2.5 border-neutral-900 rounded-2xl brutal-shadow-sm">
            <span className="text-base">✨</span>
            <span className="font-hand text-lg md:text-xl font-bold text-neutral-900 tracking-wide">
              Homework is way better together!
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-neutral-900 tracking-tight font-doodle max-w-4xl mx-auto leading-tight mb-6">
          Turn Boring Homework into <br className="hidden sm:inline" />
          <span className="relative inline-block px-3 py-1 bg-amber-300 border-2 border-neutral-900 rounded-2xl brutal-shadow-sm mx-1 -rotate-1">
            Brilliant Brainstorms!
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-lg sm:text-xl text-neutral-700 max-w-2xl mx-auto font-medium mb-6 leading-relaxed">
          Stuck on algebra or biology? Scribble on the live sketchpad, summon step-by-step chalkboard breakdowns from our Superpower AI, and crack study challenges with your squad.
        </p>

        {/* Video Tour Feature CTA */}
        {onOpenTour && (
          <div className="mb-8">
            <button
              onClick={onOpenTour}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-300 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-black text-sm sm:text-base rounded-2xl border-2.5 border-neutral-900 brutal-shadow brutal-btn group"
            >
              <span className="text-xl group-hover:scale-125 transition-transform">🎬</span>
              <span>Watch Video Walkthrough (With AI Voice Dubbing)</span>
              <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider">
                Interactive Tour
              </span>
            </button>
          </div>
        )}

        {/* Interactive Quick Solver Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row items-stretch gap-2 bg-white p-2 border-3 border-neutral-900 rounded-2xl brutal-shadow">
            <div className="flex-1 flex items-center px-3 gap-2">
              <span className="text-xl">✏️</span>
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Type or paste any homework problem (e.g., 2x + 5 = 17)..."
                className="w-full py-2.5 text-base sm:text-lg font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-neutral-900 font-extrabold text-base rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-5 h-5 text-indigo-700" />
              <span>Hatch Solution 🐣</span>
            </button>
          </form>

          {/* Quick sample pills */}
          <div className="flex items-center justify-center flex-wrap gap-2 mt-4 text-xs font-bold text-neutral-600">
            <span className="text-neutral-500 font-hand text-sm">Try asking:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onQuickSolve(p)}
                className="px-3 py-1 bg-[#FFFDF5] hover:bg-amber-100 text-neutral-800 rounded-lg border border-neutral-400 hover:border-neutral-900 transition-colors shadow-2xs"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Fast-Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-6 text-left">
          
          <div 
            onClick={onOpenCanvas}
            className="p-5 bg-rose-50 hover:bg-rose-100/90 border-2.5 border-neutral-900 rounded-2xl brutal-shadow-sm cursor-pointer brutal-btn transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-200 border-2 border-neutral-900 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
              🖌️
            </div>
            <h3 className="font-doodle font-bold text-lg text-neutral-900 mb-1 flex items-center justify-between">
              Live Sandbox
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              Doodle with chalk, crayons, neon highlighters, and sticky notes on an infinite digital pad.
            </p>
          </div>

          <div 
            onClick={() => onQuickSolve('Quadratic Formula')}
            className="p-5 bg-indigo-50 hover:bg-indigo-100/90 border-2.5 border-neutral-900 rounded-2xl brutal-shadow-sm cursor-pointer brutal-btn transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-200 border-2 border-neutral-900 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="font-doodle font-bold text-lg text-neutral-900 mb-1 flex items-center justify-between">
              AI Superpowers
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              Step-by-step visual chalkboard proofs, memory rhymes, and interactive mini-quizzes.
            </p>
          </div>

          <div 
            onClick={onExploreSquads}
            className="p-5 bg-emerald-50 hover:bg-emerald-100/90 border-2.5 border-neutral-900 rounded-2xl brutal-shadow-sm cursor-pointer brutal-btn transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-200 border-2 border-neutral-900 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
              👥
            </div>
            <h3 className="font-doodle font-bold text-lg text-neutral-900 mb-1 flex items-center justify-between">
              Study Squads
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              Synchronized 25-min Pomodoro timer, shared problem checklist, and live squad chat.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
