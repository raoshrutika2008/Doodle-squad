export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  streakDays: number;
  xp: number;
  badges: string[];
  stickers: string[];
}

export interface StickyNote {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
}

export interface CanvasStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: 'pen' | 'highlighter' | 'eraser';
}

export interface CanvasData {
  id: string;
  title: string;
  subject: string;
  strokes: CanvasStroke[];
  stickyNotes: StickyNote[];
  stickers: { id: string; emoji: string; x: number; y: number }[];
  author: string;
  createdAt: string;
  thumbnail?: string;
}

export interface SquadMember {
  id: string;
  name: string;
  avatar: string;
  role: 'Leader' | 'Member';
  isOnline: boolean;
  status: string;
}

export interface SquadMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
  attachmentType?: 'canvas' | 'formula' | 'tip';
  attachmentContent?: string;
}

export interface StudySquad {
  id: string;
  name: string;
  subject: string;
  motto: string;
  avatar: string;
  bannerColor: string;
  members: SquadMember[];
  activeTask: string;
  studyGoal: string;
  timerMinutes: number;
  isTimerRunning: boolean;
  messages: SquadMessage[];
}

export interface WallOfFameItem {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  subject: 'Math' | 'Science' | 'History' | 'Coding' | 'Literature' | 'Art';
  description: string;
  doodleSvg?: string;
  strokesCount: number;
  stars: number;
  hasStarred?: boolean;
  createdAt: string;
  tags: string[];
  explanationSnippet: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  subject: string;
  prompt: string;
  rewardXp: number;
  badgeReward: string;
  completed: boolean;
  difficulty: 'Easy' | 'Medium' | 'Brain Melter';
}

export interface AiHomeworkResponse {
  mode: 'solve' | 'explain' | 'mnemonic' | 'quiz';
  title: string;
  summary: string;
  steps: {
    stepNumber: number;
    title: string;
    explanation: string;
    visualHint?: string;
    formula?: string;
  }[];
  keyTakeaway: string;
  mnemonic?: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  encouragement: string;
}
