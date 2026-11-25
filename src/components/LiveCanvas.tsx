import React, { useRef, useState, useEffect } from 'react';
import { 
  Eraser, 
  RotateCcw, 
  Download, 
  Sparkles, 
  Share2, 
  Plus, 
  Trash2, 
  Save, 
  Smile, 
  Highlighter, 
  Check,
  Palette
} from 'lucide-react';
import { StickyNote, UserProfile } from '../types/index.js';
import confetti from 'canvas-confetti';

interface LiveCanvasProps {
  user: UserProfile;
  onSuperpowerSolve: (prompt: string, subject: string) => void;
  onPostToWall: (canvasDetails: { title: string; description: string; subject: string }) => void;
  initialProblem?: string;
}

export const LiveCanvas: React.FC<LiveCanvasProps> = ({ 
  user, 
  onSuperpowerSolve, 
  onPostToWall,
  initialProblem = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'crayon' | 'highlighter' | 'eraser'>('pen');
  const [color, setColor] = useState('#18181b');
  const [lineWidth, setLineWidth] = useState(4);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [canvasTitle, setCanvasTitle] = useState(initialProblem ? `Solving: ${initialProblem}` : 'My Homework Sketchnote');
  const [subject, setSubject] = useState('Math');

  // Sticky notes
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([
    { id: 'sn-1', text: initialProblem ? `Goal: Solve ${initialProblem}` : '✏️ Write formulas & ideas here!', color: '#FEF08A', x: 24, y: 24 }
  ]);
  const [activeStickyId, setActiveStickyId] = useState<string | null>(null);
  const [isDraggingSticky, setIsDraggingSticky] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Stamps / Stickers
  const [stickers, setStickers] = useState<{ id: string; emoji: string; x: number; y: number }[]>([
    { id: 'stk-1', emoji: '🐣', x: 260, y: 30 }
  ]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareDescription, setShareDescription] = useState('');

  const colors = [
    { label: 'Ink Black', value: '#18181b' },
    { label: 'Bright Yellow', value: '#EAB308' },
    { label: 'Coral Pink', value: '#F43F5E' },
    { label: 'Sky Blue', value: '#0284C7' },
    { label: 'Leaf Green', value: '#16A34A' },
    { label: 'Purple Gem', value: '#9333EA' },
    { label: 'Orange Flame', value: '#EA580C' }
  ];

  const availableStickers = ['🐣', '⭐', '💡', '🚀', '🧠', '📐', '🔥', '🏆', '🍕', '🎉'];

  // Initialize canvas with grid pattern
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Initial white background with faint grid
    drawGrid(ctx, rect.width, rect.height);
    saveState();
  }, []);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(0, 0, width, height);

    // Draw faint grid lines
    ctx.strokeStyle = '#F1ECE1';
    ctx.lineWidth = 1;

    const gridSize = 24;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vertical pink student margin line
    ctx.strokeStyle = '#FCA5A5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(48, 0);
    ctx.lineTo(48, height);
    ctx.stroke();
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => [...prev.slice(-15), state]);
    } catch {
      // Ignore cross-origin error if any
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previous = newHistory[newHistory.length - 1];
    if (previous) {
      ctx.putImageData(previous, 0, 0);
      setHistory(newHistory);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    drawGrid(ctx, rect.width, rect.height);
    setStickyNotes([]);
    setStickers([]);
    saveState();
  };

  // Drawing event handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.strokeStyle = '#FFFDF8';
      ctx.lineWidth = lineWidth * 3.5;
      ctx.globalAlpha = 1.0;
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth * 3;
      ctx.globalAlpha = 0.35;
    } else if (tool === 'crayon') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth * 1.5;
      ctx.globalAlpha = 0.85;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = 1.0;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveState();
  };

  // Add sticky note
  const handleAddSticky = () => {
    const stickyColors = ['#FEF08A', '#FED7AA', '#DDD6FE', '#BAE6FD', '#BBF7D0'];
    const randomColor = stickyColors[Math.floor(Math.random() * stickyColors.length)];
    const newNote: StickyNote = {
      id: 'sn-' + Date.now(),
      text: 'New thought...',
      color: randomColor,
      x: 100 + Math.random() * 80,
      y: 100 + Math.random() * 80
    };
    setStickyNotes(prev => [...prev, newNote]);
  };

  // Add sticker
  const handleAddSticker = (emoji: string) => {
    setStickers(prev => [
      ...prev,
      {
        id: 'stk-' + Date.now(),
        emoji,
        x: 150 + Math.random() * 100,
        y: 150 + Math.random() * 100
      }
    ]);
    setShowStickerPicker(false);
  };

  // Save Canvas to Backend API
  const handleSaveToBackend = async () => {
    try {
      setSaveStatus('Saving...');
      const response = await fetch('/api/canvases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: canvasTitle,
          subject,
          stickyNotes,
          stickers
        })
      });
      if (response.ok) {
        setSaveStatus('Saved!');
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
        setTimeout(() => setSaveStatus(null), 2500);
      } else {
        setSaveStatus('Failed to save');
      }
    } catch {
      setSaveStatus('Error saving');
    }
  };

  // Download image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${canvasTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Feed to AI Superpower
  const handleAskAIToSolve = () => {
    const notesSummary = stickyNotes.map(n => n.text).join('; ');
    const prompt = canvasTitle.includes('Solving:')
      ? canvasTitle.replace('Solving:', '').trim()
      : `${canvasTitle}. Notes: ${notesSummary}`;
    onSuperpowerSolve(prompt, subject);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner & Title Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-white p-4 sm:p-5 rounded-2xl border-3 border-neutral-900 brutal-shadow">
        
        {/* Title & Subject */}
        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-300 border-2 border-neutral-900 flex items-center justify-center text-xl shrink-0">
            🖌️
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={canvasTitle}
              onChange={(e) => setCanvasTitle(e.target.value)}
              className="font-doodle text-xl sm:text-2xl font-bold text-neutral-900 border-b-2 border-dashed border-neutral-300 hover:border-neutral-900 focus:border-neutral-900 focus:outline-none w-full bg-transparent"
              placeholder="Give your sketch a title..."
            />
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-neutral-500">Subject:</span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-xs font-bold bg-neutral-100 border border-neutral-900 rounded-md px-2 py-0.5 focus:outline-none"
              >
                <option value="Math">Math 📐</option>
                <option value="Science">Science 🔬</option>
                <option value="Physics">Physics ⚡</option>
                <option value="History">History 🏛️</option>
                <option value="Coding">Coding 💻</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Ask AI to solve what is on canvas */}
          <button
            onClick={handleAskAIToSolve}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Solve This!</span>
          </button>

          {/* Save to backend */}
          <button
            onClick={handleSaveToBackend}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-900 font-bold text-xs sm:text-sm rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn"
          >
            {saveStatus === 'Saved!' ? <Check className="w-4 h-4 text-emerald-900" /> : <Save className="w-4 h-4" />}
            <span>{saveStatus || 'Save'}</span>
          </button>

          {/* Share to Wall of Fame */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-300 hover:bg-amber-200 text-neutral-900 font-bold text-xs sm:text-sm rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn"
          >
            <Share2 className="w-4 h-4" />
            <span>Post to Wall</span>
          </button>

          {/* Download Image */}
          <button
            onClick={handleDownload}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl border-2 border-neutral-900 brutal-shadow-sm"
            title="Download Canvas PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main Drawing Area & Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Toolbar */}
        <div className="lg:col-span-2 flex lg:flex-col items-center justify-between lg:justify-start gap-3 bg-white p-3 sm:p-4 rounded-2xl border-3 border-neutral-900 brutal-shadow overflow-x-auto">
          
          {/* Tool selector */}
          <div className="flex lg:flex-col gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider hidden lg:block">Tool</span>
            <button
              onClick={() => setTool('pen')}
              className={`p-2.5 rounded-xl border-2 transition-all flex items-center gap-2 text-xs font-bold ${
                tool === 'pen' ? 'bg-amber-300 border-neutral-900 brutal-shadow-sm' : 'border-transparent hover:bg-neutral-100'
              }`}
              title="Pen"
            >
              <span className="text-base">✏️</span>
              <span className="hidden lg:inline">Pen</span>
            </button>

            <button
              onClick={() => setTool('crayon')}
              className={`p-2.5 rounded-xl border-2 transition-all flex items-center gap-2 text-xs font-bold ${
                tool === 'crayon' ? 'bg-amber-300 border-neutral-900 brutal-shadow-sm' : 'border-transparent hover:bg-neutral-100'
              }`}
              title="Crayon"
            >
              <span className="text-base">🖍️</span>
              <span className="hidden lg:inline">Crayon</span>
            </button>

            <button
              onClick={() => setTool('highlighter')}
              className={`p-2.5 rounded-xl border-2 transition-all flex items-center gap-2 text-xs font-bold ${
                tool === 'highlighter' ? 'bg-amber-300 border-neutral-900 brutal-shadow-sm' : 'border-transparent hover:bg-neutral-100'
              }`}
              title="Highlighter"
            >
              <Highlighter className="w-4 h-4 text-amber-600" />
              <span className="hidden lg:inline">Marker</span>
            </button>

            <button
              onClick={() => setTool('eraser')}
              className={`p-2.5 rounded-xl border-2 transition-all flex items-center gap-2 text-xs font-bold ${
                tool === 'eraser' ? 'bg-amber-300 border-neutral-900 brutal-shadow-sm' : 'border-transparent hover:bg-neutral-100'
              }`}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
              <span className="hidden lg:inline">Eraser</span>
            </button>
          </div>

          <div className="h-px w-full bg-neutral-200 hidden lg:block my-1" />

          {/* Color palette */}
          <div className="flex lg:grid lg:grid-cols-3 gap-2 shrink-0">
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => { setColor(c.value); if (tool === 'eraser') setTool('pen'); }}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  color === c.value && tool !== 'eraser' ? 'scale-125 border-neutral-900 ring-2 ring-neutral-900 ring-offset-1' : 'border-neutral-400'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>

          <div className="h-px w-full bg-neutral-200 hidden lg:block my-1" />

          {/* Stroke Width */}
          <div className="flex lg:flex-col gap-1.5 items-center shrink-0">
            <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider hidden lg:block">Width</span>
            <div className="flex gap-1.5">
              {[2, 5, 12].map(w => (
                <button
                  key={w}
                  onClick={() => setLineWidth(w)}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
                    lineWidth === w ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-100 border-neutral-300'
                  }`}
                >
                  <div className="rounded-full bg-current" style={{ width: Math.max(3, w * 0.7), height: Math.max(3, w * 0.7) }} />
                </button>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-neutral-200 hidden lg:block my-1" />

          {/* Sticky Notes & Stickers */}
          <div className="flex lg:flex-col gap-2 shrink-0">
            <button
              onClick={handleAddSticky}
              className="px-2.5 py-1.5 bg-yellow-100 hover:bg-yellow-200 border-2 border-neutral-900 rounded-xl text-xs font-bold flex items-center gap-1 brutal-shadow-sm"
              title="Add Sticky Note"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Sticky Note</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowStickerPicker(!showStickerPicker)}
                className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 border-2 border-neutral-900 rounded-xl text-xs font-bold flex items-center gap-1 brutal-shadow-sm w-full"
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Stamps</span>
              </button>

              {showStickerPicker && (
                <div className="absolute left-0 bottom-full lg:left-full lg:bottom-0 ml-2 mb-2 p-2 bg-white border-2 border-neutral-900 rounded-xl brutal-shadow z-30 grid grid-cols-5 gap-1.5 w-44">
                  {availableStickers.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleAddSticker(emoji)}
                      className="text-xl p-1 hover:bg-amber-100 rounded transition-transform hover:scale-125"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-px w-full bg-neutral-200 hidden lg:block my-1" />

          {/* Undo & Clear */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleUndo}
              className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl border-2 border-neutral-900 brutal-shadow-sm"
              title="Undo last stroke"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleClear}
              className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl border-2 border-neutral-900 brutal-shadow-sm"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Main Canvas Viewport */}
        <div className="lg:col-span-10 relative bg-white border-3 border-neutral-900 rounded-2xl brutal-shadow overflow-hidden min-h-[580px] select-none">
          
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-[580px] cursor-crosshair touch-none"
          />

          {/* Render draggable sticky notes on top of canvas */}
          {stickyNotes.map((note) => (
            <div
              key={note.id}
              style={{
                left: `${note.x}px`,
                top: `${note.y}px`,
                backgroundColor: note.color,
                transform: 'rotate(-1deg)'
              }}
              className="absolute p-3 rounded-lg border-2 border-neutral-900 brutal-shadow-sm w-48 z-20 group"
            >
              <div className="flex items-center justify-between border-b border-neutral-900/20 pb-1 mb-1">
                <span className="font-hand font-bold text-xs text-neutral-700">📌 Sticky</span>
                <button
                  onClick={() => setStickyNotes(prev => prev.filter(n => n.id !== note.id))}
                  className="text-neutral-400 hover:text-rose-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
              <textarea
                value={note.text}
                onChange={(e) => {
                  const val = e.target.value;
                  setStickyNotes(prev => prev.map(n => n.id === note.id ? { ...n, text: val } : n));
                }}
                className="w-full font-hand text-sm font-bold bg-transparent text-neutral-900 focus:outline-none resize-none h-16 leading-tight"
              />
            </div>
          ))}

          {/* Render emoji stickers on canvas */}
          {stickers.map((stk) => (
            <div
              key={stk.id}
              style={{ left: `${stk.x}px`, top: `${stk.y}px` }}
              className="absolute text-3xl select-none cursor-pointer hover:scale-125 transition-transform z-15"
              onClick={() => setStickers(prev => prev.filter(s => s.id !== stk.id))}
              title="Click to remove sticker"
            >
              {stk.emoji}
            </div>
          ))}

          {/* Student helpful prompt banner at bottom */}
          <div className="absolute bottom-3 left-4 right-4 pointer-events-none flex items-center justify-between text-xs text-neutral-500 font-bold">
            <span className="bg-white/90 px-3 py-1 rounded-lg border border-neutral-300">
              ✏️ Draw formulas, charts, geometry, or diagrams directly on the graph paper
            </span>
            <span className="hidden sm:inline bg-white/90 px-3 py-1 rounded-lg border border-neutral-300">
              Author: {user.name} ({user.avatar})
            </span>
          </div>

        </div>

      </div>

      {/* Share to Wall of Fame Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-3 border-neutral-900 rounded-3xl p-6 max-w-md w-full brutal-shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <h3 className="font-doodle text-xl font-bold text-neutral-900">Post to Wall of Fame</h3>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full border-2 border-neutral-900 flex items-center justify-center font-bold hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 mb-4 font-medium">
              Share your visual explanation with the DoodleSquad community! Earn +100 XP and inspire fellow students.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={canvasTitle}
                  onChange={(e) => setCanvasTitle(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-neutral-900 rounded-xl text-sm font-bold focus:outline-none bg-[#FFFDF5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-neutral-900 rounded-xl text-sm font-bold focus:outline-none bg-[#FFFDF5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">How did you solve it? (Explanation)</label>
                <textarea
                  value={shareDescription}
                  onChange={(e) => setShareDescription(e.target.value)}
                  placeholder="Explain the intuition behind your doodle so others understand..."
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-neutral-900 rounded-xl text-sm font-medium focus:outline-none bg-[#FFFDF5] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onPostToWall({
                      title: canvasTitle,
                      subject,
                      description: shareDescription || `Sketchnote explanation for ${canvasTitle}`
                    });
                    setShowShareModal(false);
                    confetti({ particleCount: 50, spread: 70 });
                  }}
                  className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-900 font-extrabold text-sm rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn"
                >
                  🚀 Publish to Community (+100 XP)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
