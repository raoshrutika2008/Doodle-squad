import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  SkipBack, 
  Sparkles, 
  ArrowRight, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  Pencil, 
  Users, 
  Trophy, 
  Flame, 
  Layers,
  Mic,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface VideoScene {
  id: number;
  key: string;
  title: string;
  subtitle: string;
  durationSec: number;
  badge: string;
  color: string;
  borderColor: string;
  narrationText: string;
  highlights: string[];
}

interface ProductVideoTourProps {
  onNavigateToFeature: (tab: 'canvas' | 'superpowers' | 'squads' | 'wall') => void;
  onClose?: () => void;
}

export const ProductVideoTour: React.FC<ProductVideoTourProps> = ({ 
  onNavigateToFeature, 
  onClose 
}) => {
  const [scenes, setScenes] = useState<VideoScene[]>([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100% of current scene
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Puck' | 'Zephyr' | 'native'>('Kore');
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeSubtitle, setActiveSubtitle] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch scenes from server
  useEffect(() => {
    fetch('/api/video/scenes')
      .then(res => res.json())
      .then(data => {
        if (data.scenes && data.scenes.length > 0) {
          setScenes(data.scenes);
        }
      })
      .catch(err => {
        console.error('Failed to load scenes:', err);
      });
  }, []);

  const currentScene = scenes[currentSceneIndex];

  // Stop any playing audio
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Play audio narration for current scene
  const playNarration = async (scene: VideoScene) => {
    stopAudio();
    if (isMuted || !scene) return;

    setActiveSubtitle(scene.narrationText);

    // If native web speech selected
    if (selectedVoice === 'native') {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(scene.narrationText);
        utterance.rate = playbackSpeed;
        utterance.pitch = 1.05;
        speechSynthRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
      return;
    }

    // Try Gemini TTS API
    try {
      setIsLoadingAudio(true);
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scene.narrationText,
          voice: selectedVoice
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:${data.mimeType};base64,${data.audioBase64}`);
          audio.playbackRate = playbackSpeed;
          audioRef.current = audio;
          audio.play().catch(e => console.warn('Audio play restricted by browser:', e));
          setIsLoadingAudio(false);
          return;
        }
      }
    } catch {
      // Gracefully switch to browser speech synthesis
    } finally {
      setIsLoadingAudio(false);
    }

    // Fallback to browser SpeechSynthesis with natural voice
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(scene.narrationText);
      utterance.rate = playbackSpeed;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const bestVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Samantha'))) 
        || voices.find(v => v.lang.startsWith('en'));
      if (bestVoice) utterance.voice = bestVoice;

      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Scene transition logic
  useEffect(() => {
    if (!currentScene) return;

    setProgress(0);
    if (isPlaying) {
      playNarration(currentScene);
    } else {
      stopAudio();
      setActiveSubtitle(currentScene.narrationText);
    }

    // Trigger visual confetti on intro and finale
    if (currentScene.id === 1 && isPlaying) {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    } else if (currentScene.id === 5 && isPlaying) {
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.5 } });
    }
  }, [currentSceneIndex, isPlaying]);

  // Handle timeline progress ticks
  useEffect(() => {
    if (!isPlaying || !currentScene) {
      clearInterval(timerRef.current);
      return;
    }

    const durationMs = (currentScene.durationSec / playbackSpeed) * 1000;
    const intervalMs = 100;
    const step = (intervalMs / durationMs) * 100;

    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Advance to next scene or loop/stop
          if (currentSceneIndex < scenes.length - 1) {
            setCurrentSceneIndex(i => i + 1);
            return 0;
          } else {
            setIsPlaying(false);
            stopAudio();
            return 100;
          }
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timerRef.current);
  }, [isPlaying, currentSceneIndex, scenes.length, playbackSpeed, currentScene]);

  // Handle mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopAudio();
    } else if (isPlaying && currentScene) {
      playNarration(currentScene);
    }
  };

  const handleNext = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(prev => prev - 1);
    }
  };

  const handleReplay = () => {
    setCurrentSceneIndex(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!currentScene) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin text-4xl mb-3">🌀</div>
        <p className="font-doodle text-lg">Loading DoodleSquad Product Tour...</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#FFFDF5] p-6 overflow-y-auto max-w-none' : ''
      }`}
    >
      
      {/* Video Container Card */}
      <div className="bg-white border-3.5 border-neutral-900 rounded-3xl brutal-shadow-lg overflow-hidden flex flex-col">
        
        {/* Top Video Header Bar */}
        <div className="bg-amber-300 border-b-3 border-neutral-900 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-neutral-900 flex items-center justify-center font-bold text-sm shadow-2xs">
              🎬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-doodle text-base sm:text-lg font-black text-neutral-900">
                  DoodleSquad Feature Showcase
                </span>
                <span className="px-2 py-0.5 bg-neutral-900 text-amber-300 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
                  AI Dubbed 🎙️
                </span>
              </div>
              <span className="text-[11px] font-hand text-neutral-800 font-bold block -mt-0.5">
                Scene {currentSceneIndex + 1} of {scenes.length}: {currentScene.badge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Voice Selector */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#FFFDF5] border-2 border-neutral-900 px-2.5 py-1 rounded-xl text-xs font-bold">
              <Mic className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-neutral-500 text-[10px] uppercase">Voice:</span>
              <select
                value={selectedVoice}
                onChange={(e) => {
                  setSelectedVoice(e.target.value as any);
                  if (isPlaying) playNarration(currentScene);
                }}
                className="bg-transparent text-xs font-bold text-neutral-900 focus:outline-none cursor-pointer"
              >
                <option value="Kore">Kore (Friendly AI Tutor)</option>
                <option value="Puck">Puck (Energetic Host)</option>
                <option value="Zephyr">Zephyr (Calm Mentor)</option>
                <option value="native">Browser Speech (Native)</option>
              </select>
            </div>

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl border-2 border-neutral-900 transition-all ${
                isMuted ? 'bg-rose-200 text-rose-900' : 'bg-white hover:bg-neutral-100 text-neutral-900'
              }`}
              title={isMuted ? 'Unmute AI Voice' : 'Mute Voice'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white hover:bg-neutral-100 border-2 border-neutral-900 rounded-xl"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border-2 border-neutral-900 flex items-center justify-center font-bold hover:bg-neutral-100 ml-1"
                title="Close Video Tour"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Video Canvas / Screen Area */}
        <div className="relative aspect-video min-h-[380px] sm:min-h-[460px] bg-[#FFFDF5] notebook-pattern notebook-margin-line p-6 sm:p-10 flex flex-col justify-between overflow-hidden">
          
          {/* Animated Audio Visualizer Waves Indicator */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs border-2 border-neutral-900 px-3 py-1.5 rounded-full brutal-shadow-sm">
            <Radio className={`w-3.5 h-3.5 ${isPlaying && !isMuted ? 'text-emerald-500 animate-pulse' : 'text-neutral-400'}`} />
            <span className="text-[11px] font-bold text-neutral-800">
              {isLoadingAudio ? 'Generating Voice...' : isPlaying && !isMuted ? 'AI Dubbing Active' : 'Voice Paused'}
            </span>
            <div className="flex items-end gap-0.5 h-3.5 ml-1">
              {[0.4, 0.8, 0.3, 1, 0.6, 0.9].map((h, idx) => (
                <div
                  key={idx}
                  className={`w-1 rounded-full bg-indigo-600 transition-all duration-150 ${
                    isPlaying && !isMuted ? 'animate-pulse' : 'opacity-40'
                  }`}
                  style={{
                    height: isPlaying && !isMuted ? `${h * 100}%` : '25%',
                    animationDelay: `${idx * 0.15}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Scene Visuals - Dynamically changes per Scene */}
          <div className="relative z-10 flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
            
            {/* Scene 1: Welcome & Intro */}
            {currentScene.id === 1 && (
              <div className="text-center space-y-4 animate-in zoom-in-95 duration-300">
                <div className="inline-block relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-amber-300 border-3 border-neutral-900 flex items-center justify-center text-5xl sm:text-6xl brutal-shadow mx-auto animate-bounce">
                    🐣
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl border-2 border-neutral-900 text-sm font-bold rotate-12">
                    ✏️
                  </div>
                </div>

                <div className="inline-block">
                  <span className="px-4 py-1.5 bg-purple-200 border-2 border-neutral-900 rounded-2xl font-hand text-lg font-bold text-neutral-900 brutal-shadow-sm">
                    ✨ Homework is way better together!
                  </span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 font-doodle tracking-tight leading-tight">
                  Welcome to <span className="text-indigo-600">DoodleSquad</span>
                </h2>

                <p className="text-base sm:text-xl text-neutral-700 font-medium max-w-2xl mx-auto">
                  The playful collaborative homework & study hub where brainstorms hatch with live sketchpads, AI chalkboard solvers, and study squads!
                </p>

                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {currentScene.highlights.map((h, i) => (
                    <span key={i} className="px-3 py-1 bg-white border border-neutral-900 rounded-xl text-xs font-bold text-neutral-800 brutal-shadow-sm">
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Scene 2: Live Canvas & Digital Sketchpad */}
            {currentScene.id === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-in fade-in duration-300">
                <div className="md:col-span-5 space-y-3 text-left">
                  <span className="px-3 py-1 bg-rose-200 border-2 border-neutral-900 rounded-xl text-xs font-black text-neutral-900">
                    🖌️ Feature 1
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black text-neutral-900 font-doodle leading-tight">
                    Interactive Live Canvas
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-700 font-medium leading-relaxed">
                    Throw away messy scrap paper! Sketch math formulas, draw biology diagrams, drop colorful sticky notes, and stamp playful stickers on infinite graph paper.
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {currentScene.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                        <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => onNavigateToFeature('canvas')}
                    className="mt-2 px-4 py-2 bg-rose-300 hover:bg-rose-200 text-neutral-900 font-extrabold text-xs sm:text-sm rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn inline-flex items-center gap-1.5"
                  >
                    <span>Try Canvas Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Simulated Canvas Mockup */}
                <div className="md:col-span-7 bg-white border-3 border-neutral-900 rounded-2xl p-4 brutal-shadow relative min-h-[220px] overflow-hidden select-none">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2 mb-3 text-xs font-bold text-neutral-500">
                    <span>📐 Graph Sketchpad</span>
                    <div className="flex gap-1">
                      <span className="w-3 h-3 rounded-full bg-rose-400" />
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                  </div>

                  {/* Simulated drawing strokes */}
                  <svg className="w-full h-36" viewBox="0 0 300 120">
                    <path
                      d="M 20,100 Q 150,10 280,100"
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="4"
                      strokeDasharray="400"
                      strokeDashoffset={isPlaying ? '0' : '200'}
                      className="transition-all duration-1000 ease-out"
                    />
                    <path
                      d="M 50,40 L 250,40"
                      fill="none"
                      stroke="#EAB308"
                      strokeWidth="10"
                      opacity="0.35"
                    />
                    <text x="70" y="35" fontFamily="Fredoka" fontSize="12" fill="#18181b" fontWeight="bold">
                      y = -0.5(x - 5)² + 8 (Vertex Form)
                    </text>
                  </svg>

                  {/* Simulated sticky note */}
                  <div className="absolute bottom-3 right-3 bg-amber-200 border-2 border-neutral-900 rounded-lg p-2.5 w-40 brutal-shadow-sm rotate-2">
                    <span className="text-[10px] font-bold text-neutral-600 block">📌 Key Formula</span>
                    <span className="font-hand text-xs font-black text-neutral-900">
                      Peak height happens at vertex (h, k)!
                    </span>
                  </div>

                  {/* Stamp */}
                  <div className="absolute top-8 right-6 text-3xl animate-bounce">
                    ⭐
                  </div>
                </div>
              </div>
            )}

            {/* Scene 3: AI Superpowers */}
            {currentScene.id === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-in fade-in duration-300">
                <div className="md:col-span-5 space-y-3 text-left">
                  <span className="px-3 py-1 bg-indigo-200 border-2 border-neutral-900 rounded-xl text-xs font-black text-neutral-900">
                    ⚡ Feature 2
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black text-neutral-900 font-doodle leading-tight">
                    AI Study Superpowers
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-700 font-medium leading-relaxed">
                    Powered by Gemini AI! Don't just get an answer—get step-by-step visual proofs, memorable mnemonics, and instant practice quizzes.
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {currentScene.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => onNavigateToFeature('superpowers')}
                    className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn inline-flex items-center gap-1.5"
                  >
                    <span>Launch Superpowers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Simulated Chalkboard UI */}
                <div className="md:col-span-7 bg-neutral-900 text-white border-3 border-neutral-900 rounded-2xl p-5 brutal-shadow font-mono text-xs relative select-none">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-700 text-neutral-400">
                    <span className="text-emerald-400 font-bold">Chalkboard AI Engine</span>
                    <span>Gemini 3.8 Flash</span>
                  </div>

                  <div className="mt-3 space-y-2 text-left">
                    <div className="text-amber-300 font-bold">
                      ► Problem: Solve 2x² - 8 = 0
                    </div>
                    <div className="bg-neutral-800/80 p-2.5 rounded-lg border border-neutral-700 space-y-1">
                      <div className="text-neutral-300">Step 1: Add 8 to both sides  ──► 2x² = 8</div>
                      <div className="text-neutral-300">Step 2: Divide both sides by 2  ──► x² = 4</div>
                      <div className="text-emerald-400 font-bold">Step 3: Take square root  ──► x = ±2  ✓</div>
                    </div>
                    <div className="bg-indigo-950/70 border border-indigo-500/50 p-2 rounded-lg text-indigo-300 text-[11px]">
                      🎵 Mnemonic: "Isolate the power, take square roots in an hour!"
                    </div>
                  </div>

                  <div className="absolute bottom-2 right-3 text-2xl">
                    🧠
                  </div>
                </div>
              </div>
            )}

            {/* Scene 4: Collaborative Study Squads */}
            {currentScene.id === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-in fade-in duration-300">
                <div className="md:col-span-5 space-y-3 text-left">
                  <span className="px-3 py-1 bg-emerald-200 border-2 border-neutral-900 rounded-xl text-xs font-black text-neutral-900">
                    👥 Feature 3
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black text-neutral-900 font-doodle leading-tight">
                    Study Squads
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-700 font-medium leading-relaxed">
                    Collaborate in real-time study rooms with active peer presence, live chat, shared whiteboard missions, and synchronized focus timers.
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {currentScene.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => onNavigateToFeature('squads')}
                    className="mt-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-900 font-extrabold text-xs sm:text-sm rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn inline-flex items-center gap-1.5"
                  >
                    <span>Join a Study Squad</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Simulated Squad Room UI */}
                <div className="md:col-span-7 bg-white border-3 border-neutral-900 rounded-2xl p-4 brutal-shadow relative select-none">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⚡</span>
                      <div>
                        <div className="font-doodle font-bold text-sm text-neutral-900">Algebra Avengers</div>
                        <span className="text-[10px] text-emerald-600 font-bold">● 4 studying now</span>
                      </div>
                    </div>

                    {/* Mini Pomodoro Counter */}
                    <div className="px-3 py-1 bg-amber-100 border border-neutral-900 rounded-lg text-xs font-mono font-black text-neutral-900">
                      ⏱️ 24:18
                    </div>
                  </div>

                  {/* Simulated chat bubble */}
                  <div className="space-y-2 text-xs text-left">
                    <div className="bg-neutral-100 p-2.5 rounded-xl border border-neutral-200">
                      <span className="font-bold text-neutral-900 block">🦊 Maya Chen:</span>
                      <span>Vertex is at -b / (2a)! I put the diagram on our canvas!</span>
                    </div>
                    <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 ml-4">
                      <span className="font-bold text-indigo-900 block">🐣 Shrutika Rao:</span>
                      <span>Got it! Starting our 25-minute focus sprint now! 🚀</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scene 5: Wall of Fame & Daily Challenges */}
            {currentScene.id === 5 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-in fade-in duration-300">
                <div className="md:col-span-5 space-y-3 text-left">
                  <span className="px-3 py-1 bg-amber-200 border-2 border-neutral-900 rounded-xl text-xs font-black text-neutral-900">
                    🌟 Feature 4
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black text-neutral-900 font-doodle leading-tight">
                    Wall of Fame & Streaks
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-700 font-medium leading-relaxed">
                    Publish your creative sketchnotes to inspire others, star peer creations, and complete daily brain warm-ups to earn XP and level up!
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {currentScene.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => onNavigateToFeature('wall')}
                    className="mt-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-900 font-extrabold text-xs sm:text-sm rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn inline-flex items-center gap-1.5"
                  >
                    <span>Explore Wall of Fame</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Simulated Wall Card */}
                <div className="md:col-span-7 bg-white border-3 border-neutral-900 rounded-2xl p-4 brutal-shadow relative text-left select-none">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                      Math Proof
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold bg-amber-300 px-2 py-0.5 rounded-lg border border-neutral-900">
                      ⭐ 49 Stars
                    </div>
                  </div>

                  <h4 className="font-doodle font-bold text-base text-neutral-900 mb-1">
                    Visual Pythagorean Proof 📐
                  </h4>
                  <p className="text-xs text-neutral-600 mb-3">
                    Doodled 4 right triangles rearranged inside a large square to prove a² + b² = c²!
                  </p>

                  <div className="p-2.5 bg-[#FFFDF5] border border-dashed border-neutral-300 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔥</span>
                      <span className="font-bold text-neutral-800">6 Day Study Streak!</span>
                    </div>
                    <span className="font-black text-amber-700">+100 XP Earned</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Subtitle / Teleprompter Strip */}
          <div className="relative z-20 mt-4 bg-neutral-900/90 text-white p-3 rounded-2xl border-2 border-neutral-900 shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-0.5">
              <span>🎙️ AI Voice Subtitles:</span>
              {selectedVoice !== 'native' && (
                <span className="text-[10px] font-normal text-neutral-400">
                  (Voice: {selectedVoice} - Gemini TTS)
                </span>
              )}
            </div>
            <p className="font-medium text-xs sm:text-sm text-neutral-100 leading-snug">
              "{activeSubtitle}"
            </p>
          </div>

        </div>

        {/* Video Scrubber & Playback Controls Bar */}
        <div className="bg-white border-t-3 border-neutral-900 p-4 space-y-3">
          
          {/* Timeline Chapter Scrubber */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500">
              <span>Chapter {currentSceneIndex + 1}: {currentScene.title}</span>
              <span>{Math.round(progress)}% of scene</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 h-2.5">
              {scenes.map((scene, idx) => {
                let barFill = 'bg-neutral-200';
                if (idx < currentSceneIndex) barFill = 'bg-indigo-600';
                if (idx === currentSceneIndex) barFill = 'bg-amber-400';

                return (
                  <div
                    key={scene.id}
                    onClick={() => {
                      setCurrentSceneIndex(idx);
                      setProgress(0);
                    }}
                    className="relative bg-neutral-200 rounded-full overflow-hidden cursor-pointer h-full border border-neutral-300 hover:border-neutral-900 transition-all"
                    title={`Jump to Scene ${idx + 1}: ${scene.title}`}
                  >
                    {idx === currentSceneIndex ? (
                      <div 
                        className="h-full bg-amber-400 transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    ) : (
                      <div className={`h-full ${barFill}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            
            {/* Play/Pause & Navigation buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentSceneIndex === 0}
                className="p-2 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 border-2 border-neutral-900 rounded-xl"
                title="Previous Scene"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-900 font-black text-sm rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn flex items-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-neutral-900" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-neutral-900" />
                    <span>{progress > 0 && progress < 100 ? 'Resume' : 'Play Video'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNext}
                disabled={currentSceneIndex === scenes.length - 1}
                className="p-2 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 border-2 border-neutral-900 rounded-xl"
                title="Next Scene"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={handleReplay}
                className="p-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-neutral-900 rounded-xl"
                title="Restart Tour from Beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Speed & Chapter selection pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-500 hidden sm:inline">Speed:</span>
              {[0.75, 1, 1.25, 1.5].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-0.5 text-xs font-bold rounded-lg border ${
                    playbackSpeed === speed 
                      ? 'bg-neutral-900 text-white border-neutral-900' 
                      : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                  }`}
                >
                  {speed}x
                </button>
              ))}

              {/* Jump to Feature CTA */}
              <button
                onClick={() => {
                  if (currentScene.key === 'canvas') onNavigateToFeature('canvas');
                  else if (currentScene.key === 'superpowers') onNavigateToFeature('superpowers');
                  else if (currentScene.key === 'squads') onNavigateToFeature('squads');
                  else if (currentScene.key === 'wall_and_challenges') onNavigateToFeature('wall');
                  else onNavigateToFeature('superpowers');
                }}
                className="ml-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn flex items-center gap-1.5"
              >
                <span>Try this feature</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
