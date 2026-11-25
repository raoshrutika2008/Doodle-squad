/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { Hero } from './components/Hero.js';
import { LiveCanvas } from './components/LiveCanvas.js';
import { Superpowers } from './components/Superpowers.js';
import { StudySquads } from './components/StudySquads.js';
import { WallOfFame } from './components/WallOfFame.js';
import { DailyChallenges } from './components/DailyChallenges.js';
import { UserProfileModal } from './components/UserProfileModal.js';
import { ProductVideoTour } from './components/ProductVideoTour.js';
import { UserProfile, WallOfFameItem } from './types/index.js';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'superpowers' | 'canvas' | 'squads' | 'wall' | 'challenges' | 'tour'>('home');
  const [user, setUser] = useState<UserProfile>({
    id: 'user-1',
    name: 'Shrutika Rao',
    avatar: '🐣',
    streakDays: 6,
    xp: 1250,
    badges: ['First Brainstorm', 'Canvas Picasso', 'Math Wizard', 'Squad Leader'],
    stickers: ['🐣', '⭐', '🔥', '🚀', '🧠', '💡', '🎨', '📐']
  });
  const [currentProblem, setCurrentProblem] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Fetch initial user state
  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        if (data && data.name) setUser(data);
      })
      .catch(() => {});
  }, []);

  const handleAwardXp = (amount: number) => {
    setUser(prev => ({ ...prev, xp: prev.xp + amount }));
  };

  const handleQuickSolveFromHero = (problem: string) => {
    setCurrentProblem(problem);
    setActiveTab('superpowers');
  };

  const handleOpenCanvas = (problem = '') => {
    if (problem) setCurrentProblem(problem);
    setActiveTab('canvas');
  };

  const handleSuperpowerSolve = (prompt: string, subject: string) => {
    setCurrentProblem(prompt);
    setActiveTab('superpowers');
  };

  const handlePostToWall = async (details: { title: string; description: string; subject: string }) => {
    try {
      const res = await fetch('/api/wall-of-fame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: details.title,
          description: details.description,
          subject: details.subject,
          strokesCount: 120,
          tags: [details.subject, 'HomeworkSketchnote', 'DoodleSquad']
        })
      });
      if (res.ok) {
        handleAwardXp(100);
        setActiveTab('wall');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloneToCanvas = (item: WallOfFameItem) => {
    setCurrentProblem(item.title);
    setActiveTab('canvas');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF5] text-neutral-900 selection:bg-amber-300">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <Hero
              onQuickSolve={handleQuickSolveFromHero}
              onOpenCanvas={() => setActiveTab('canvas')}
              onExploreSquads={() => setActiveTab('squads')}
              onOpenTour={() => setActiveTab('tour')}
            />
            <div className="bg-[#FFFDF8] border-b-2 border-neutral-900 py-4">
              <DailyChallenges
                user={user}
                onSolveOnCanvas={handleOpenCanvas}
                onAwardXp={handleAwardXp}
              />
            </div>
            <WallOfFame
              user={user}
              onCloneToCanvas={handleCloneToCanvas}
              onAwardXp={handleAwardXp}
            />
          </>
        )}

        {activeTab === 'tour' && (
          <ProductVideoTour
            onNavigateToFeature={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'canvas' && (
          <LiveCanvas
            user={user}
            initialProblem={currentProblem}
            onSuperpowerSolve={handleSuperpowerSolve}
            onPostToWall={handlePostToWall}
          />
        )}

        {activeTab === 'superpowers' && (
          <Superpowers
            user={user}
            initialQuery={currentProblem}
            onSendToCanvas={handleOpenCanvas}
            onAwardXp={handleAwardXp}
          />
        )}

        {activeTab === 'squads' && (
          <StudySquads
            user={user}
            onOpenCanvasWithGoal={handleOpenCanvas}
            onAwardXp={handleAwardXp}
          />
        )}

        {activeTab === 'wall' && (
          <WallOfFame
            user={user}
            onCloneToCanvas={handleCloneToCanvas}
            onAwardXp={handleAwardXp}
          />
        )}

        {activeTab === 'challenges' && (
          <DailyChallenges
            user={user}
            onSolveOnCanvas={handleOpenCanvas}
            onAwardXp={handleAwardXp}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-3 border-neutral-900 bg-white py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-300 border-2 border-neutral-900 flex items-center justify-center text-lg">
              ✏️
            </div>
            <div>
              <div className="font-doodle text-lg font-black text-neutral-900">
                Doodle<span className="text-indigo-600">Squad</span> 🐣
              </div>
              <p className="text-xs text-neutral-500 font-hand font-bold">
                Where Brainstorms Hatch! Homework is way better together.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold text-neutral-600">
            <button onClick={() => setActiveTab('tour')} className="hover:text-amber-600 font-black">🎬 Video Tour</button>
            <button onClick={() => setActiveTab('superpowers')} className="hover:text-indigo-600">Superpowers</button>
            <button onClick={() => setActiveTab('canvas')} className="hover:text-rose-600">Live Canvas</button>
            <button onClick={() => setActiveTab('squads')} className="hover:text-emerald-600">Study Squads</button>
            <button onClick={() => setActiveTab('wall')} className="hover:text-amber-600">Wall of Fame</button>
          </div>

          <div className="text-xs text-neutral-400 font-bold">
            Built with ❤️ for curious minds
          </div>
        </div>
      </footer>

      {/* User Profile & Badge Modal */}
      {showProfileModal && (
        <UserProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
        />
      )}

    </div>
  );
}
