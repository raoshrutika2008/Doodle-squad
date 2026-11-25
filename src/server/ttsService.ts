import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

let aiInstance: GoogleGenAI | null = null;
const audioCache = new Map<string, string>();

function getAI(): GoogleGenAI | null {
  if (!aiInstance && process.env.GEMINI_API_KEY) {
    aiInstance = new GoogleGenAI();
  }
  return aiInstance;
}

export const VIDEO_SCENES = [
  {
    id: 1,
    key: 'intro',
    title: 'Welcome to DoodleSquad 🐣',
    subtitle: 'Where Brainstorms Hatch! Turn boring homework into a creative study adventure.',
    durationSec: 14,
    badge: 'Introduction',
    color: 'from-amber-200 to-yellow-300',
    borderColor: 'border-amber-400',
    narrationText: "Welcome to DoodleSquad! Where brainstorms hatch. DoodleSquad turns confusing homework into a vibrant, creative study session. Let's take a tour of the superpowers and collaborative tools built for you!",
    highlights: [
      'Infinite digital notebook with real-time tools',
      'AI-powered visual chalkboard solver',
      'Collaborative Study Squads with focus timers',
      'Community Wall of Fame with peer upvotes'
    ]
  },
  {
    id: 2,
    key: 'canvas',
    title: 'Interactive Live Canvas & Sandbox 🖌️',
    subtitle: 'Sketch formulas, neon-highlight ideas, and organize with sticky notes.',
    durationSec: 16,
    badge: 'Feature 1',
    color: 'from-rose-100 to-pink-200',
    borderColor: 'border-rose-400',
    narrationText: "First, meet the Live Canvas! Say goodbye to boring scrap paper. You get an infinite digital sketchpad with smooth ink pens, neon crayons, semi-transparent highlighters, draggable sticky notes, and fun stickers. You can even export your work as a high-resolution PNG image.",
    highlights: [
      'Pen, Crayon, Marker, & Eraser with custom palettes',
      'Draggable, colorful sticky notes for notes & formulas',
      'Emoji stamp collection with student avatars',
      'One-click "AI Solve This!" integration directly from canvas'
    ]
  },
  {
    id: 3,
    key: 'superpowers',
    title: 'AI Study Superpowers 📐⚡',
    subtitle: 'Step-by-step chalkboard proofs, visual diagrams, and catchy memory rhymes.',
    durationSec: 18,
    badge: 'Feature 2',
    color: 'from-indigo-100 to-violet-200',
    borderColor: 'border-indigo-400',
    narrationText: "Next up: AI Superpowers, powered by Gemini AI! Stuck on an algebra proof, science concept, or history date? Ask the AI to solve it step-by-step with visual chalkboard diagrams, generate unforgettable memory rhymes, or build an interactive practice quiz to test your mastery!",
    highlights: [
      'Step-by-step chalkboard breakdowns with ASCII sketches',
      'Visual Concept Explainer using intuitive analogies',
      'Memory Rhyme & Mnemonic Forge for exam recall',
      'Gamified practice quizzes with instant XP rewards'
    ]
  },
  {
    id: 4,
    key: 'squads',
    title: 'Collaborative Study Squads 👥',
    subtitle: 'Synchronized Pomodoro focus sessions and live peer study chat.',
    durationSec: 16,
    badge: 'Feature 3',
    color: 'from-emerald-100 to-teal-200',
    borderColor: 'border-emerald-400',
    narrationText: "Studying is always better together in Study Squads. Join rooms like Algebra Avengers or BioHatchlings. Tackle assignments together, share formulas in real-time squad chat, and crush homework sprints using the synchronized twenty-five minute Pomodoro focus timer.",
    highlights: [
      'Subject squads: Math, Science, Coding, and History',
      'Synchronized 25-minute Pomodoro focus timer with breaks',
      'Live squad study chat with formula cards',
      'Member presence indicators & shared mission goals'
    ]
  },
  {
    id: 5,
    key: 'wall_and_challenges',
    title: 'Wall of Fame & Daily Challenges 🌟',
    subtitle: 'Share your sketchnotes, star peer solutions, and keep your streak alive!',
    durationSec: 16,
    badge: 'Feature 4',
    color: 'from-amber-100 to-orange-200',
    borderColor: 'border-orange-400',
    narrationText: "Finally, showcase your brilliance on the Wall of Fame! Explore creative sketchnotes from students worldwide, give stars to inspiring solutions, and complete daily brain warm-up challenges to level up your XP and keep your streak on fire!",
    highlights: [
      'Student gallery with Math, Science, and Coding filters',
      'One-click "Clone into My Canvas" to build upon peer notes',
      'Star upvoting system with celebration confetti',
      'Daily homework challenges for streak protection & badges'
    ]
  }
];

let isQuotaExhausted = true; // Daily free-tier limit of 10 requests reached on this project

export async function generateSpeechAudio(
  text: string, 
  voiceName: 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon' = 'Kore'
): Promise<{ audioBase64: string; mimeType: string } | null> {
  const cacheKey = `${voiceName}:${crypto.createHash('md5').update(text).digest('hex')}`;
  if (audioCache.has(cacheKey)) {
    return {
      audioBase64: audioCache.get(cacheKey)!,
      mimeType: 'audio/wav'
    };
  }

  // If daily quota was reached, immediately delegate to client Web Speech engine
  if (isQuotaExhausted) {
    return null;
  }

  const ai = getAI();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text }]
          }
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        audioCache.set(cacheKey, audioData);
        return {
          audioBase64: audioData,
          mimeType: 'audio/wav'
        };
      }
    } catch (err: any) {
      if (err?.status === 429 || err?.message?.includes('Quota exceeded') || err?.message?.includes('429')) {
        isQuotaExhausted = true;
        console.info('Gemini TTS daily quota reached. Seamlessly routing audio dubbing to browser speech synthesis engine.');
      } else {
        console.warn('Gemini TTS unavailable, routing to speech synthesis:', err?.message || err);
      }
      return null;
    }
  }

  return null;
}
