import { StudySquad, SquadMessage, WallOfFameItem, DailyChallenge, UserProfile, CanvasData } from '../types/index.js';

export class DoodleSquadStore {
  user: UserProfile = {
    id: 'user-1',
    name: 'Shrutika Rao',
    avatar: '🐣',
    streakDays: 6,
    xp: 1250,
    badges: ['First Brainstorm', 'Canvas Picasso', 'Math Wizard', 'Squad Leader'],
    stickers: ['🐣', '⭐', '🔥', '🚀', '🧠', '💡', '🎨', '📐']
  };

  squads: StudySquad[] = [
    {
      id: 'squad-math',
      name: 'Algebra Avengers ⚡',
      subject: 'Math',
      motto: 'Solving for X, one variable at a time!',
      avatar: '📐',
      bannerColor: 'bg-amber-100 border-amber-400',
      activeTask: 'Quadratic formula & parabola doodles',
      studyGoal: 'Finish Chapter 4 Review problems together',
      timerMinutes: 25,
      isTimerRunning: true,
      members: [
        { id: 'm1', name: 'Maya Chen', avatar: '🦊', role: 'Leader', isOnline: true, status: 'Drawing parabolas' },
        { id: 'm2', name: 'Liam Patel', avatar: '🦁', role: 'Member', isOnline: true, status: 'Factoring polynomials' },
        { id: 'user-1', name: 'Shrutika Rao', avatar: '🐣', role: 'Member', isOnline: true, status: 'Active now' },
        { id: 'm3', name: 'Zoe Brooks', avatar: '🐼', role: 'Member', isOnline: false, status: 'Away' }
      ],
      messages: [
        {
          id: 'msg-1',
          authorId: 'm1',
          authorName: 'Maya Chen',
          authorAvatar: '🦊',
          text: 'Hey squad! Remember: -b ± √(b² - 4ac) / 2a! I doodled the vertex path on the squad canvas!',
          timestamp: '10 mins ago',
          attachmentType: 'formula',
          attachmentContent: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'
        },
        {
          id: 'msg-2',
          authorId: 'm2',
          authorName: 'Liam Patel',
          authorAvatar: '🦁',
          text: 'Super helpful! Also if b² - 4ac < 0, there are no real roots, just two imaginary ones 🧠',
          timestamp: '6 mins ago'
        },
        {
          id: 'msg-3',
          authorId: 'user-1',
          authorName: 'Shrutika Rao',
          authorAvatar: '🐣',
          text: 'Starting our 25-minute focus session! Ready for problem 12!',
          timestamp: 'Just now'
        }
      ]
    },
    {
      id: 'squad-bio',
      name: 'BioHatchlings 🧬',
      subject: 'Science',
      motto: 'From mitochondria to ecosystems!',
      avatar: '🔬',
      bannerColor: 'bg-emerald-100 border-emerald-400',
      activeTask: 'Cellular respiration vs Photosynthesis diagram',
      studyGoal: 'Draw & label the chloroplast organelles',
      timerMinutes: 18,
      isTimerRunning: false,
      members: [
        { id: 'm4', name: 'Noah Kim', avatar: '🐨', role: 'Leader', isOnline: true, status: 'Annotating ATP cycle' },
        { id: 'm5', name: 'Aria Taylor', avatar: '🐱', role: 'Member', isOnline: true, status: 'Sketching thylakoids' },
        { id: 'm6', name: 'Devon Reed', avatar: '🦉', role: 'Member', isOnline: false, status: 'Reviewing genetics' }
      ],
      messages: [
        {
          id: 'msg-4',
          authorId: 'm4',
          authorName: 'Noah Kim',
          authorAvatar: '🐨',
          text: 'Chlorophyll absorbs red and blue light, but reflects green! That is why leaves look green to us 🍃',
          timestamp: '15 mins ago'
        }
      ]
    },
    {
      id: 'squad-code',
      name: 'Python Pixels 💻',
      subject: 'Coding',
      motto: 'Eat, Sleep, Code, Debug, Repeat!',
      avatar: '🐍',
      bannerColor: 'bg-indigo-100 border-indigo-400',
      activeTask: 'Building recursion visualizer tree',
      studyGoal: 'Master Fibonacci recursion with memoization',
      timerMinutes: 25,
      isTimerRunning: true,
      members: [
        { id: 'm7', name: 'Alex Vance', avatar: '🚀', role: 'Leader', isOnline: true, status: 'Writing Python dicts' },
        { id: 'm8', name: 'Samira Joshi', avatar: '🎨', role: 'Member', isOnline: true, status: 'Debugging stack overflow' }
      ],
      messages: [
        {
          id: 'msg-5',
          authorId: 'm7',
          authorName: 'Alex Vance',
          authorAvatar: '🚀',
          text: 'Base case is the golden rule! Always ensure n <= 1 returns early!',
          timestamp: '25 mins ago'
        }
      ]
    },
    {
      id: 'squad-history',
      name: 'Time Travelers ⏳',
      subject: 'History',
      motto: 'Connecting ancient civilizations to tomorrow!',
      avatar: '🏛️',
      bannerColor: 'bg-rose-100 border-rose-400',
      activeTask: 'Silk Road trade network mind-map',
      studyGoal: 'Map out ancient trade routes & cultural exchange',
      timerMinutes: 20,
      isTimerRunning: false,
      members: [
        { id: 'm9', name: 'Elena Ramos', avatar: '🐯', role: 'Leader', isOnline: true, status: 'Drawing caravan routes' },
        { id: 'm10', name: 'Jordan Smith', avatar: '🦅', role: 'Member', isOnline: true, status: 'Listing spices & silk goods' }
      ],
      messages: [
        {
          id: 'msg-6',
          authorId: 'm9',
          authorName: 'Elena Ramos',
          authorAvatar: '🐯',
          text: 'Did you know the Silk Road was over 4,000 miles long and passed through desert oases? 🐫',
          timestamp: '1 hour ago'
        }
      ]
    }
  ];

  wallOfFame: WallOfFameItem[] = [
    {
      id: 'fame-1',
      title: 'Visual Proof of Pythagorean Theorem 📐',
      author: 'Maya Chen',
      authorAvatar: '🦊',
      subject: 'Math',
      description: 'Doodled 4 right triangles rearranged inside a large square to clearly see a² + b² = c² without scary algebra!',
      strokesCount: 142,
      stars: 48,
      hasStarred: false,
      createdAt: 'Yesterday',
      tags: ['Geometry', 'Pythagoras', 'Visual Proof', 'Triangles'],
      explanationSnippet: 'Area of large square = (a + b)². Subtract 4 * (1/2 * a * b) = 2ab. You are left with the tilted square of c²!'
    },
    {
      id: 'fame-2',
      title: 'Mitochondria: The Powerhouse Factory 🏭',
      author: 'Noah Kim',
      authorAvatar: '🐨',
      subject: 'Science',
      description: 'A comic book style doodle showing glucose arriving at the outer membrane and ATP turbine spinners in the inner cristae folds!',
      strokesCount: 210,
      stars: 64,
      hasStarred: true,
      createdAt: '2 days ago',
      tags: ['Biology', 'Cells', 'ATP', 'BioHatchlings'],
      explanationSnippet: 'Inner membrane folds (cristae) provide massive surface area for electron transport chain enzymes to generate ATP!'
    },
    {
      id: 'fame-3',
      title: 'Water Cycle Comic Strip 🌧️☀️',
      author: 'Liam Patel',
      authorAvatar: '🦁',
      subject: 'Science',
      description: 'Follow "Droppy the H2O Molecule" through evaporation, cloud condensation, rainy precipitation, and mountain percolation!',
      strokesCount: 185,
      stars: 39,
      hasStarred: false,
      createdAt: '3 days ago',
      tags: ['Earth Science', 'Hydrology', 'Infographic'],
      explanationSnippet: 'Solar thermal energy fuels evaporation -> air cools at high altitude causing condensation into droplets -> gravity pulls precipitation down!'
    },
    {
      id: 'fame-4',
      title: 'Binary Search in 3 Quick Sketchnotes 🔍',
      author: 'Alex Vance',
      authorAvatar: '🚀',
      subject: 'Coding',
      description: 'Dividing telephone directories in half! Why O(log N) destroys linear search O(N) every single time.',
      strokesCount: 96,
      stars: 52,
      hasStarred: false,
      createdAt: '4 days ago',
      tags: ['Algorithms', 'Computer Science', 'Big O'],
      explanationSnippet: 'With 1,000,000 items, linear search needs up to 1M steps. Binary search finds it in at most 20 comparisons!'
    },
    {
      id: 'fame-5',
      title: 'Why Rome Built Aqueducts with Gravity Alone 🏛️',
      author: 'Elena Ramos',
      authorAvatar: '🐯',
      subject: 'History',
      description: 'Cross-section engineering sketch of Roman arch gradients dropping just 1 foot every 300 feet over miles of terrain.',
      strokesCount: 130,
      stars: 31,
      hasStarred: false,
      createdAt: '5 days ago',
      tags: ['Roman Empire', 'Civil Engineering', 'History'],
      explanationSnippet: 'Continuous gentle downward slope without pumps delivered fresh mountain spring water across deep valleys via stone arches!'
    }
  ];

  challenges: DailyChallenge[] = [
    {
      id: 'c1',
      title: 'Fraction Pizza Party 🍕',
      subject: 'Math',
      prompt: 'Draw a pizza cut into 8 slices. Color 3/8 with pepperoni and 2/8 with mushrooms. What fraction is plain cheese?',
      rewardXp: 150,
      badgeReward: 'Pizza Slicer 🍕',
      completed: true,
      difficulty: 'Easy'
    },
    {
      id: 'c2',
      title: 'Photosynthesis Solar Lab ☀️🌱',
      subject: 'Science',
      prompt: 'Sketch a plant leaf with arrows for sunlight, CO₂, and H₂O entering, and Oxygen & Glucose emerging.',
      rewardXp: 200,
      badgeReward: 'Solar Bot 🌻',
      completed: false,
      difficulty: 'Medium'
    },
    {
      id: 'c3',
      title: 'Gravity Pendulum Physics ⏱️',
      subject: 'Physics',
      prompt: 'Doodle a swinging pendulum showing where Potential Energy is maximum vs where Kinetic Energy is peak.',
      rewardXp: 300,
      badgeReward: 'Kinetic Master ⚡',
      completed: false,
      difficulty: 'Brain Melter'
    }
  ];

  savedCanvases: CanvasData[] = [
    {
      id: 'canvas-demo-1',
      title: 'Slope-Intercept Form (y = mx + b) 📈',
      subject: 'Math',
      strokes: [],
      stickyNotes: [
        { id: 's1', text: 'm = rise / run (slope)', color: '#FEF08A', x: 80, y: 120 },
        { id: 's2', text: 'b = y-intercept (where it hits the y-axis)', color: '#FED7AA', x: 280, y: 120 }
      ],
      stickers: [
        { id: 'st1', emoji: '📐', x: 400, y: 50 },
        { id: 'st2', emoji: '⭐', x: 500, y: 80 }
      ],
      author: 'Shrutika Rao',
      createdAt: 'Today, 2:30 PM'
    }
  ];

  starWallItem(id: string): WallOfFameItem | null {
    const item = this.wallOfFame.find(w => w.id === id);
    if (!item) return null;
    if (item.hasStarred) {
      item.stars -= 1;
      item.hasStarred = false;
    } else {
      item.stars += 1;
      item.hasStarred = true;
      this.user.xp += 10;
    }
    return item;
  }

  addWallItem(data: Omit<WallOfFameItem, 'id' | 'stars' | 'hasStarred' | 'createdAt'>): WallOfFameItem {
    const newItem: WallOfFameItem = {
      ...data,
      id: 'fame-' + Date.now(),
      stars: 1,
      hasStarred: true,
      createdAt: 'Just now'
    };
    this.wallOfFame.unshift(newItem);
    this.user.xp += 100;
    return newItem;
  }

  addSquadMessage(squadId: string, text: string, attachmentType?: 'canvas' | 'formula' | 'tip', attachmentContent?: string): SquadMessage | null {
    const squad = this.squads.find(s => s.id === squadId);
    if (!squad) return null;
    const msg: SquadMessage = {
      id: 'msg-' + Date.now(),
      authorId: this.user.id,
      authorName: this.user.name,
      authorAvatar: this.user.avatar,
      text,
      timestamp: 'Just now',
      attachmentType,
      attachmentContent
    };
    squad.messages.push(msg);
    this.user.xp += 15;
    return msg;
  }

  createSquad(name: string, subject: string, motto: string, avatar: string): StudySquad {
    const squad: StudySquad = {
      id: 'squad-' + Date.now(),
      name,
      subject,
      motto: motto || 'Studying together!',
      avatar: avatar || '🐣',
      bannerColor: 'bg-violet-100 border-violet-400',
      activeTask: 'Starting group study session',
      studyGoal: 'Support each other through tough assignments',
      timerMinutes: 25,
      isTimerRunning: true,
      members: [
        { id: this.user.id, name: this.user.name, avatar: this.user.avatar, role: 'Leader', isOnline: true, status: 'Study Room Host' }
      ],
      messages: [
        {
          id: 'msg-init-' + Date.now(),
          authorId: this.user.id,
          authorName: this.user.name,
          authorAvatar: this.user.avatar,
          text: `Welcome to ${name}! Let's doodle and solve homework together! 🚀`,
          timestamp: 'Just now'
        }
      ]
    };
    this.squads.unshift(squad);
    this.user.xp += 50;
    return squad;
  }

  joinSquad(squadId: string): StudySquad | null {
    const squad = this.squads.find(s => s.id === squadId);
    if (!squad) return null;
    if (!squad.members.some(m => m.id === this.user.id)) {
      squad.members.push({
        id: this.user.id,
        name: this.user.name,
        avatar: this.user.avatar,
        role: 'Member',
        isOnline: true,
        status: 'Joined the squad'
      });
      this.user.xp += 25;
    }
    return squad;
  }

  completeChallenge(id: string): DailyChallenge | null {
    const challenge = this.challenges.find(c => c.id === id);
    if (!challenge) return null;
    if (!challenge.completed) {
      challenge.completed = true;
      this.user.xp += challenge.rewardXp;
      if (!this.user.badges.includes(challenge.badgeReward)) {
        this.user.badges.push(challenge.badgeReward);
      }
    }
    return challenge;
  }
}

export const store = new DoodleSquadStore();
