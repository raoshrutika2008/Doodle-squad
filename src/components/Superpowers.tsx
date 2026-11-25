import React, { useState } from 'react';
import { Sparkles, BookOpen, Music, HelpCircle, ArrowRight, Copy, Check, Palette } from 'lucide-react';
import { AiHomeworkResponse, UserProfile } from '../types/index.js';
import confetti from 'canvas-confetti';

interface SuperpowersProps {
  user: UserProfile;
  initialQuery?: string;
  onSendToCanvas: (problem: string) => void;
  onAwardXp: (xp: number) => void;
}

export const Superpowers: React.FC<SuperpowersProps> = ({ 
  user, 
  initialQuery = '', 
  onSendToCanvas,
  onAwardXp 
}) => {
  const [query, setQuery] = useState(initialQuery || 'How does photosynthesis convert sunlight to sugar?');
  const [subject, setSubject] = useState('Science');
  const [mode, setMode] = useState<'solve' | 'explain' | 'mnemonic' | 'quiz'>('solve');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AiHomeworkResponse | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [copied, setCopied] = useState(false);

  const curatedExamples = [
    { text: 'Solve: 2x² - 8 = 0', mode: 'solve' as const, sub: 'Math' },
    { text: 'Why is the sky blue during the day and red at sunset?', mode: 'explain' as const, sub: 'Science' },
    { text: 'Order of planets from the sun mnemonic', mode: 'mnemonic' as const, sub: 'Science' },
    { text: 'How does Big O notation work in algorithms?', mode: 'explain' as const, sub: 'Coding' },
    { text: 'World War 1 cause: MAIN acronym', mode: 'mnemonic' as const, sub: 'History' },
    { text: 'Quick quiz on fractions and ratios', mode: 'quiz' as const, sub: 'Math' }
  ];

  const handleGenerate = async (targetQuery = query, targetMode = mode, targetSubject = subject) => {
    if (!targetQuery.trim()) return;
    setIsLoading(true);
    setResponse(null);
    setQuizAnswers({});

    try {
      const res = await fetch('/api/ai/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: targetQuery,
          mode: targetMode,
          subject: targetSubject
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data.result);
        onAwardXp(20);
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      } else {
        // Fallback gracefully
        console.error('API failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySolution = () => {
    if (!response) return;
    const text = `${response.title}\n${response.summary}\n\n` + 
      response.steps.map(s => `Step ${s.stepNumber}: ${s.title}\n${s.explanation}`).join('\n\n') +
      `\n\nKey Takeaway: ${response.keyTakeaway}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Superpowers Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 border-2 border-neutral-900 rounded-full mb-3 brutal-shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-700" />
          <span className="font-doodle text-sm font-bold text-indigo-950">AI Homework Engine</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 font-doodle mb-3">
          Superpowers for Every Subject
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 font-medium">
          Whether you need a step-by-step chalk solution, a sketch diagram, or a catchy memory rhyme, DoodleSquad hatches the clearest explanation!
        </p>
      </div>

      {/* Mode Selector Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => { setMode('solve'); }}
          className={`p-4 rounded-2xl border-2.5 text-left transition-all ${
            mode === 'solve'
              ? 'bg-amber-300 border-neutral-900 brutal-shadow font-extrabold translate-y-[-2px]'
              : 'bg-white border-neutral-300 hover:border-neutral-900 text-neutral-700'
          }`}
        >
          <div className="text-2xl mb-1">📐</div>
          <div className="font-doodle text-base font-bold text-neutral-900">Step-by-Step</div>
          <div className="text-xs text-neutral-600 mt-0.5">Chalkboard proofs & formulas</div>
        </button>

        <button
          onClick={() => { setMode('explain'); }}
          className={`p-4 rounded-2xl border-2.5 text-left transition-all ${
            mode === 'explain'
              ? 'bg-rose-200 border-neutral-900 brutal-shadow font-extrabold translate-y-[-2px]'
              : 'bg-white border-neutral-300 hover:border-neutral-900 text-neutral-700'
          }`}
        >
          <div className="text-2xl mb-1">🎨</div>
          <div className="font-doodle text-base font-bold text-neutral-900">Visual Explainer</div>
          <div className="text-xs text-neutral-600 mt-0.5">Sketchnotes & analogies</div>
        </button>

        <button
          onClick={() => { setMode('mnemonic'); }}
          className={`p-4 rounded-2xl border-2.5 text-left transition-all ${
            mode === 'mnemonic'
              ? 'bg-emerald-200 border-neutral-900 brutal-shadow font-extrabold translate-y-[-2px]'
              : 'bg-white border-neutral-300 hover:border-neutral-900 text-neutral-700'
          }`}
        >
          <div className="text-2xl mb-1">🎵</div>
          <div className="font-doodle text-base font-bold text-neutral-900">Memory Rhymes</div>
          <div className="text-xs text-neutral-600 mt-0.5">Catchy songs & mnemonics</div>
        </button>

        <button
          onClick={() => { setMode('quiz'); }}
          className={`p-4 rounded-2xl border-2.5 text-left transition-all ${
            mode === 'quiz'
              ? 'bg-indigo-200 border-neutral-900 brutal-shadow font-extrabold translate-y-[-2px]'
              : 'bg-white border-neutral-300 hover:border-neutral-900 text-neutral-700'
          }`}
        >
          <div className="text-2xl mb-1">⚡</div>
          <div className="font-doodle text-base font-bold text-neutral-900">Game Quiz</div>
          <div className="text-xs text-neutral-600 mt-0.5">Instant practice & XP</div>
        </button>
      </div>

      {/* Input Form Box */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border-3 border-neutral-900 brutal-shadow mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500">Subject:</span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-xs font-bold bg-neutral-100 border-2 border-neutral-900 rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="Math">Math 📐</option>
              <option value="Science">Science 🔬</option>
              <option value="Coding">Coding 💻</option>
              <option value="History">History 🏛️</option>
              <option value="Literature">Literature 📖</option>
            </select>
          </div>

          {/* Quick example pills */}
          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-xs font-hand text-neutral-500 font-bold shrink-0">Try:</span>
            {curatedExamples.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(ex.text);
                  setMode(ex.mode);
                  setSubject(ex.sub);
                  handleGenerate(ex.text, ex.mode, ex.sub);
                }}
                className="px-2.5 py-1 text-xs font-bold bg-[#FFFDF5] hover:bg-amber-100 border border-neutral-300 hover:border-neutral-900 rounded-lg whitespace-nowrap transition-colors"
              >
                {ex.text}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            placeholder="Type your homework problem, equation, or concept here..."
            className="w-full p-4 text-base font-medium text-neutral-900 border-2.5 border-neutral-900 rounded-2xl bg-[#FFFDF5] focus:outline-none resize-none leading-relaxed placeholder:text-neutral-400"
          />

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs font-hand text-neutral-500 font-bold">
              🐣 Powered by Gemini AI with pedagogic chalkboard reasoning
            </span>
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || !query.trim()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">🌀</span>
                  <span>Hatching Brainstorm...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Hatch Answer! (+20 XP)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-[#FFFDF5] border-3 border-neutral-900 rounded-3xl p-8 brutal-shadow text-center">
          <div className="inline-block p-4 rounded-full bg-amber-200 border-2 border-neutral-900 mb-4 animate-bounce">
            <span className="text-4xl">🐣</span>
          </div>
          <h3 className="font-doodle text-2xl font-bold text-neutral-900 mb-2">
            Superpower Brainstorm in Progress!
          </h3>
          <p className="text-sm text-neutral-600 font-medium max-w-md mx-auto">
            Drawing the chalkboard diagrams, calculating step-by-step logic, and testing the explanation...
          </p>
        </div>
      )}

      {/* Render AI Superpower Response */}
      {response && !isLoading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Solution Banner */}
          <div className="bg-white border-3 border-neutral-900 rounded-3xl p-6 brutal-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-200 border border-neutral-900 rounded-lg text-xs font-bold text-neutral-900 mb-2">
                <span>✨ Superpower Result</span>
              </div>
              <h3 className="font-doodle text-2xl sm:text-3xl font-black text-neutral-900">
                {response.title}
              </h3>
              <p className="text-sm sm:text-base text-neutral-700 font-medium mt-1">
                {response.summary}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onSendToCanvas(query)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-300 hover:bg-rose-200 text-neutral-900 font-bold text-xs sm:text-sm rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn"
              >
                <Palette className="w-4 h-4" />
                <span>Draw on Canvas</span>
              </button>

              <button
                onClick={handleCopySolution}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs sm:text-sm rounded-xl border-2 border-neutral-900 brutal-shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Chalkboard Steps Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {response.steps.map((step) => (
              <div
                key={step.stepNumber}
                className="bg-[#FFFDF8] border-2.5 border-neutral-900 rounded-2xl p-5 brutal-shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-full bg-amber-300 border-2 border-neutral-900 flex items-center justify-center font-black text-xs">
                      {step.stepNumber}
                    </span>
                    <h4 className="font-doodle text-lg font-bold text-neutral-900">
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed font-medium mb-3">
                    {step.explanation}
                  </p>
                </div>

                {step.visualHint && (
                  <div className="bg-neutral-900 text-emerald-300 font-mono text-xs p-3.5 rounded-xl border-2 border-neutral-900 overflow-x-auto whitespace-pre leading-snug">
                    {step.visualHint}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mnemonic / Rhyme Section if provided */}
          {response.mnemonic && (
            <div className="bg-emerald-50 border-3 border-neutral-900 rounded-3xl p-6 brutal-shadow">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎵</span>
                <h4 className="font-doodle text-xl font-bold text-emerald-950">
                  Catchy Memory Rhyme (Never Forget This!)
                </h4>
              </div>
              <div className="bg-white border-2 border-neutral-900 p-4 rounded-2xl font-hand text-xl font-bold text-neutral-900 leading-relaxed">
                "{response.mnemonic}"
              </div>
            </div>
          )}

          {/* Interactive Quiz if provided */}
          {response.quiz && response.quiz.length > 0 && (
            <div className="bg-indigo-50 border-3 border-neutral-900 rounded-3xl p-6 brutal-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <h4 className="font-doodle text-xl font-bold text-indigo-950">
                    Quick Practice Game (Test Your Mastery!)
                  </h4>
                </div>
                <span className="text-xs font-bold bg-indigo-200 text-indigo-900 px-3 py-1 rounded-full border border-indigo-900">
                  +10 XP per correct answer
                </span>
              </div>

              <div className="space-y-4">
                {response.quiz.map((q, qIdx) => {
                  const selected = quizAnswers[qIdx];
                  const hasAnswered = selected !== undefined;
                  const isCorrect = selected === q.correctIndex;

                  return (
                    <div key={qIdx} className="bg-white border-2 border-neutral-900 rounded-2xl p-4">
                      <p className="font-bold text-sm text-neutral-900 mb-3">
                        {qIdx + 1}. {q.question}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                        {q.options.map((opt, optIdx) => {
                          const isThisSelected = selected === optIdx;
                          const isThisCorrect = optIdx === q.correctIndex;

                          let btnStyle = 'bg-[#FFFDF5] border-neutral-300 hover:border-neutral-900 text-neutral-800';
                          if (hasAnswered) {
                            if (isThisCorrect) {
                              btnStyle = 'bg-emerald-300 border-neutral-900 text-neutral-950 font-bold';
                            } else if (isThisSelected && !isCorrect) {
                              btnStyle = 'bg-rose-200 border-neutral-900 text-rose-950';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                if (hasAnswered) return;
                                setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                                if (optIdx === q.correctIndex) {
                                  onAwardXp(10);
                                  confetti({ particleCount: 25, spread: 45 });
                                }
                              }}
                              className={`p-2.5 text-xs text-left rounded-xl border-2 transition-all font-medium ${btnStyle}`}
                            >
                              <span className="font-bold mr-1">{String.fromCharCode(65 + optIdx)}.</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div className={`mt-2 p-2.5 rounded-xl text-xs font-bold ${
                          isCorrect ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                        }`}>
                          {isCorrect ? '🎉 Correct! ' : '💡 Explanation: '}
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Key Takeaway & High-Five Quote */}
          <div className="bg-amber-100 border-3 border-neutral-900 rounded-3xl p-6 brutal-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-900 mb-1">
                ⭐ Golden Rule to Remember
              </div>
              <div className="font-doodle text-lg sm:text-xl font-bold text-neutral-900">
                {response.keyTakeaway}
              </div>
              <div className="font-hand text-sm font-bold text-neutral-700 mt-1">
                {response.encouragement}
              </div>
            </div>

            <button
              onClick={() => {
                setQuery('');
                setResponse(null);
              }}
              className="px-5 py-2.5 bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs sm:text-sm rounded-xl border-2 border-neutral-900 brutal-shadow-sm whitespace-nowrap"
            >
              Solve Another Problem
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
