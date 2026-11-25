import React, { useState, useEffect } from 'react';
import { Users, Clock, Play, Pause, RotateCcw, Send, Plus, CheckCircle, Flame, MessageSquare } from 'lucide-react';
import { StudySquad, UserProfile } from '../types/index.js';
import confetti from 'canvas-confetti';

interface StudySquadsProps {
  user: UserProfile;
  onOpenCanvasWithGoal: (goal: string) => void;
  onAwardXp: (xp: number) => void;
}

export const StudySquads: React.FC<StudySquadsProps> = ({ 
  user, 
  onOpenCanvasWithGoal,
  onAwardXp 
}) => {
  const [squads, setSquads] = useState<StudySquad[]>([]);
  const [selectedSquadId, setSelectedSquadId] = useState<string>('squad-math');
  const [newMessage, setNewMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSquadName, setNewSquadName] = useState('');
  const [newSquadSubject, setNewSquadSubject] = useState('Math');
  const [newSquadMotto, setNewSquadMotto] = useState('');
  const [newSquadAvatar, setNewSquadAvatar] = useState('⚡');

  // Study Timer local state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Fetch squads from backend
  const fetchSquads = async () => {
    try {
      const res = await fetch('/api/squads');
      if (res.ok) {
        const data = await res.json();
        setSquads(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSquads();
  }, []);

  // Timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      confetti({ particleCount: 60, spread: 80 });
      onAwardXp(50);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const currentSquad = squads.find(s => s.id === selectedSquadId) || squads[0];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentSquad) return;

    try {
      const res = await fetch(`/api/squads/${currentSquad.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newMessage.trim() })
      });

      if (res.ok) {
        setNewMessage('');
        fetchSquads();
        onAwardXp(15);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinSquad = async (squadId: string) => {
    try {
      const res = await fetch(`/api/squads/${squadId}/join`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchSquads();
        onAwardXp(25);
        confetti({ particleCount: 40, spread: 60 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSquadName.trim()) return;

    try {
      const res = await fetch('/api/squads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSquadName.trim(),
          subject: newSquadSubject,
          motto: newSquadMotto,
          avatar: newSquadAvatar
        })
      });

      if (res.ok) {
        const squad = await res.json();
        setShowCreateModal(false);
        setNewSquadName('');
        setNewSquadMotto('');
        fetchSquads();
        setSelectedSquadId(squad.id);
        onAwardXp(50);
        confetti({ particleCount: 50, spread: 70 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Squads Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border-2 border-neutral-900 rounded-full text-xs font-bold text-emerald-950 mb-2 brutal-shadow-sm">
            <Users className="w-3.5 h-3.5" />
            <span>Peer Study Rooms</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 font-doodle">
            Study Squads
          </h2>
          <p className="text-sm text-neutral-600 font-medium mt-1">
            Study together in real-time, conquer homework goals, and share sketches!
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-900 font-extrabold text-sm rounded-xl border-2.5 border-neutral-900 brutal-shadow-sm brutal-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Squad (+50 XP)</span>
        </button>
      </div>

      {/* Main Grid: Squad selector cards & Active Room */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Squads List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider block px-1">
            Active Study Squads ({squads.length})
          </span>

          {squads.map((squad) => {
            const isSelected = squad.id === selectedSquadId;
            const isUserMember = squad.members.some(m => m.id === user.id);

            return (
              <div
                key={squad.id}
                onClick={() => setSelectedSquadId(squad.id)}
                className={`p-4 rounded-2xl border-2.5 transition-all cursor-pointer brutal-btn ${
                  isSelected 
                    ? 'bg-white border-neutral-900 brutal-shadow scale-[1.01]' 
                    : 'bg-[#FFFDF5] border-neutral-300 hover:border-neutral-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 border-2 border-neutral-900 flex items-center justify-center text-xl shrink-0">
                      {squad.avatar}
                    </div>
                    <div>
                      <h4 className="font-doodle font-bold text-base text-neutral-900 leading-tight">
                        {squad.name}
                      </h4>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        {squad.subject}
                      </span>
                    </div>
                  </div>

                  {isUserMember ? (
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-400 px-2 py-0.5 rounded-full">
                      Member
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinSquad(squad.id);
                      }}
                      className="text-[10px] font-black bg-amber-300 hover:bg-amber-200 text-neutral-900 border border-neutral-900 px-2.5 py-1 rounded-lg brutal-shadow-sm"
                    >
                      Join
                    </button>
                  )}
                </div>

                <p className="text-xs text-neutral-600 font-medium line-clamp-1 italic mb-2">
                  "{squad.motto}"
                </p>

                <div className="flex items-center justify-between text-xs text-neutral-500 font-bold pt-2 border-t border-neutral-200">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-neutral-600" />
                    <span>{squad.members.length} students</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>{squad.members.filter(m => m.isOnline).length} studying now</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Squad Room & Live Session */}
        {currentSquad && (
          <div className="lg:col-span-8 bg-white border-3 border-neutral-900 rounded-3xl p-5 sm:p-6 brutal-shadow flex flex-col justify-between min-h-[640px]">
            
            {/* Squad Room Banner & Pomodoro Timer */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-neutral-200 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-300 border-2 border-neutral-900 flex items-center justify-center text-2xl brutal-shadow-sm">
                    {currentSquad.avatar}
                  </div>
                  <div>
                    <h3 className="font-doodle text-xl sm:text-2xl font-black text-neutral-900">
                      {currentSquad.name}
                    </h3>
                    <p className="text-xs text-neutral-600 font-medium">
                      🎯 Current Goal: <strong className="text-neutral-900">{currentSquad.studyGoal}</strong>
                    </p>
                  </div>
                </div>

                {/* Focus Timer Widget */}
                <div className="flex items-center gap-3 bg-[#FFFDF5] border-2 border-neutral-900 px-3.5 py-2 rounded-2xl brutal-shadow-sm">
                  <div className="flex items-center gap-1.5 font-mono text-lg font-black text-neutral-900">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>{formatTimer(timerSeconds)}</span>
                  </div>
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="p-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    title={isTimerRunning ? 'Pause Focus' : 'Start Focus'}
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => { setIsTimerRunning(false); setTimerSeconds(25 * 60); }}
                    className="p-1.5 bg-neutral-100 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-200"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Members Presence Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4">
                <span className="text-xs font-bold text-neutral-400 shrink-0">In room:</span>
                {currentSquad.members.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-50 border border-neutral-300 rounded-full shrink-0 text-xs font-bold"
                  >
                    <div className="relative">
                      <span>{member.avatar}</span>
                      {member.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                      )}
                    </div>
                    <span className="text-neutral-800">{member.name}</span>
                    <span className="text-[10px] text-neutral-400 font-normal">({member.status})</span>
                  </div>
                ))}
              </div>

              {/* Shared Whiteboard Action Card */}
              <div className="bg-amber-50 border-2 border-dashed border-amber-400 rounded-2xl p-3.5 mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🖌️</span>
                  <div>
                    <h5 className="font-doodle text-xs font-bold text-neutral-900">Squad Sketchpad Assignment</h5>
                    <p className="text-xs text-neutral-600">{currentSquad.activeTask}</p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenCanvasWithGoal(currentSquad.activeTask)}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-900 font-bold text-xs rounded-xl border border-neutral-900 brutal-shadow-sm whitespace-nowrap"
                >
                  Open in Live Canvas
                </button>
              </div>

              {/* Live Chat History */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {currentSquad.messages.map((msg) => {
                  const isMe = msg.authorId === user.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-neutral-100 border-2 border-neutral-900 flex items-center justify-center text-sm shrink-0">
                        {msg.authorAvatar}
                      </div>
                      <div className={`max-w-[75%] p-3 rounded-2xl border-2 border-neutral-900 text-xs sm:text-sm ${
                        isMe ? 'bg-indigo-100 brutal-shadow-sm' : 'bg-[#FFFDF5] brutal-shadow-sm'
                      }`}>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-neutral-900">{msg.authorName}</span>
                          <span className="text-[10px] text-neutral-400">{msg.timestamp}</span>
                        </div>
                        <p className="text-neutral-800 font-medium leading-relaxed">
                          {msg.text}
                        </p>
                        {msg.attachmentType === 'formula' && (
                          <div className="mt-2 p-2 bg-neutral-900 text-emerald-400 font-mono text-xs rounded-lg">
                            {msg.attachmentContent}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Input Field */}
            <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t-2 border-neutral-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Send a study hint or ask ${currentSquad.name}...`}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-medium border-2 border-neutral-900 rounded-xl focus:outline-none bg-[#FFFDF5]"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send (+15 XP)</span>
                </button>
              </div>
            </form>

          </div>
        )}

      </div>

      {/* Create Squad Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-3 border-neutral-900 rounded-3xl p-6 max-w-md w-full brutal-shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👥</span>
                <h3 className="font-doodle text-xl font-bold text-neutral-900">Create Study Squad</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full border-2 border-neutral-900 flex items-center justify-center font-bold hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSquad} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Squad Name</label>
                <input
                  type="text"
                  value={newSquadName}
                  onChange={(e) => setNewSquadName(e.target.value)}
                  placeholder="e.g. Physics Pioneers 🚀"
                  className="w-full px-3 py-2 border-2 border-neutral-900 rounded-xl text-sm font-bold focus:outline-none bg-[#FFFDF5]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Subject</label>
                  <select
                    value={newSquadSubject}
                    onChange={(e) => setNewSquadSubject(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-neutral-900 rounded-xl text-xs font-bold focus:outline-none bg-[#FFFDF5]"
                  >
                    <option value="Math">Math 📐</option>
                    <option value="Science">Science 🔬</option>
                    <option value="Physics">Physics ⚡</option>
                    <option value="Coding">Coding 💻</option>
                    <option value="History">History 🏛️</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">Emoji Badge</label>
                  <select
                    value={newSquadAvatar}
                    onChange={(e) => setNewSquadAvatar(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-neutral-900 rounded-xl text-xs font-bold focus:outline-none bg-[#FFFDF5]"
                  >
                    <option value="⚡">⚡ Lightning</option>
                    <option value="🧬">🧬 Genetics</option>
                    <option value="🚀">🚀 Rocket</option>
                    <option value="📐">📐 Geometry</option>
                    <option value="🎨">🎨 Creative</option>
                    <option value="🦉">🦉 Wise Owl</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">Squad Motto</label>
                <input
                  type="text"
                  value={newSquadMotto}
                  onChange={(e) => setNewSquadMotto(e.target.value)}
                  placeholder="e.g. Doodling our way to straight A's!"
                  className="w-full px-3 py-2 border-2 border-neutral-900 rounded-xl text-sm font-medium focus:outline-none bg-[#FFFDF5]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-neutral-900 font-extrabold text-sm rounded-xl border-2 border-neutral-900 brutal-shadow-sm brutal-btn"
                >
                  🎉 Launch Squad (+50 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
