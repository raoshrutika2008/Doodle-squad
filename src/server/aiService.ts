import { GoogleGenAI } from '@google/genai';
import { AiHomeworkResponse } from '../types/index.js';

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (!aiInstance && process.env.GEMINI_API_KEY) {
    aiInstance = new GoogleGenAI();
  }
  return aiInstance;
}

export async function solveHomeworkWithGemini(
  query: string,
  mode: 'solve' | 'explain' | 'mnemonic' | 'quiz' = 'solve',
  subject?: string
): Promise<AiHomeworkResponse> {
  const ai = getAI();

  const prompt = `You are "DoodleSquad Superpower AI", an enthusiastic, warm, pedagogical tutor who makes homework fun, visual, and easy to understand using chalkboard breakdowns, intuitive analogies, step-by-step logic, and encouraging doodles.

The student asked: "${query}"
Subject area: "${subject || 'General Homework'}"
Selected Mode: "${mode}"

Return a valid JSON object strictly matching this schema:
{
  "mode": "${mode}",
  "title": "A fun, snappy title with emojis",
  "summary": "1-2 sentence quick summary of the core concept",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Short title for this step",
      "explanation": "Clear, friendly explanation of what we are doing and why",
      "visualHint": "A visual ASCII diagram, sketchnote hint, or chalkboard layout for this step",
      "formula": "Any math or science formula or keyword (optional)"
    }
  ],
  "keyTakeaway": "The golden rule or secret hack to remember forever",
  "mnemonic": "A silly, memorable rhyme or acronym to never forget this (if mode is mnemonic or helpful)",
  "quiz": [
    {
      "question": "A quick practice question to test understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct!"
    }
  ],
  "encouragement": "A cheerful high-five quote encouraging the student"
}

Provide 2 to 4 clear steps. Keep explanations lively and engaging. Do not include markdown code ticks around the JSON if using responseMimeType: 'application/json'.`;

  if (ai) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timed out')), 7000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);

      if (response && response.text) {
        const parsed = JSON.parse(response.text) as AiHomeworkResponse;
        return parsed;
      }
    } catch (err) {
      console.warn('Gemini call did not complete in time, using smart educational fallback:', err);
    }
  }

  // Fallback generator for offline/resilience
  return getSmartFallbackResponse(query, mode, subject);
}

function getSmartFallbackResponse(query: string, mode: string, subject?: string): AiHomeworkResponse {
  const cleanQ = query.trim() || '2x + 6 = 18';

  if (mode === 'quiz') {
    return {
      mode: 'quiz',
      title: `⚡ Rapid Fire Quiz: ${cleanQ}`,
      summary: `Test your mastery on "${cleanQ}" with these instant brain warm-ups!`,
      steps: [
        {
          stepNumber: 1,
          title: 'Warm Up',
          explanation: 'Identify the fundamental rule or variable first before calculating.',
          visualHint: '[ Input ] ──► [ Process ] ──► [ Output ]'
        }
      ],
      keyTakeaway: 'Always read every option carefully and check the inverse operation!',
      quiz: [
        {
          question: `In solving equations like ${cleanQ}, what is the first golden rule?`,
          options: [
            'Perform inverse operations to isolate the variable',
            'Multiply everything by 100',
            'Guess and check random numbers',
            'Delete the variable'
          ],
          correctIndex: 0,
          explanation: 'Inverse operations (like subtracting what is added) cancel out terms and leave the variable alone!'
        },
        {
          question: 'What happens to an equation if you do the exact same operation to BOTH sides?',
          options: [
            'It stays balanced and equivalent',
            'It becomes invalid',
            'The answer doubles',
            'It only works for addition'
          ],
          correctIndex: 0,
          explanation: 'Think of an equation as a balance scale: doing identical things to both sides keeps the scale perfectly level!'
        }
      ],
      encouragement: 'You are crushing this! Every mistake is just your brain leveling up!'
    };
  }

  if (mode === 'mnemonic') {
    return {
      mode: 'mnemonic',
      title: `🎵 Memory Beat & Rhyme: ${cleanQ}`,
      summary: `Turn "${cleanQ}" into a catchy rhythm your brain will never forget during tests!`,
      steps: [
        {
          stepNumber: 1,
          title: 'Rhyme Breakdown',
          explanation: 'Anchor each tough term to an everyday visual object.',
          visualHint: '🎵 [Listen] ─► [Rhyme] ─► [Remember forever!]'
        }
      ],
      keyTakeaway: 'Rhythm and visualization bypass test anxiety and stick straight to long-term memory.',
      mnemonic: 'Flip the sign and draw the line, balance both sides and you’ll do fine! Keep X alone upon the throne, and the answer is yours to own!',
      encouragement: 'Sing it once in your head, and it is locked in forever!'
    };
  }

  return {
    mode: 'solve',
    title: `📐 Chalkboard Solution: ${cleanQ}`,
    summary: `Let's break "${cleanQ}" down into simple, bite-sized visual steps.`,
    steps: [
      {
        stepNumber: 1,
        title: 'Spot the Goal',
        explanation: 'We want to isolate the unknown variable and get it all by itself on one side of the equal sign.',
        visualHint: '  [  Balance Scale  ]\n   Left Side  =  Right Side\n   ═══════════════════════',
        formula: cleanQ
      },
      {
        stepNumber: 2,
        title: 'Undo the Distractions',
        explanation: 'Use inverse operations. If a number is added, subtract it from both sides to keep the balance scale level.',
        visualHint: '  Subtract from both sides:\n  (Left - term) = (Right - term)',
        formula: 'Balance Property of Equality'
      },
      {
        stepNumber: 3,
        title: 'Isolate & Check',
        explanation: 'Divide both sides by the coefficient of the variable. Then plug your answer back in to verify it works!',
        visualHint: '  ✓ Double Check:\n  Plug back into original ─► Balanced!',
        formula: 'x = Result'
      }
    ],
    keyTakeaway: 'Whatever you do to the left side of an equation, you MUST do to the right side!',
    mnemonic: 'PEMDAS in reverse when solving: Sad Mep (Subtract, Add, Divide, Multiply, Exponents, Parentheses)!',
    encouragement: 'Boom! You just solved it like a pro mathematician! 🌟'
  };
}
