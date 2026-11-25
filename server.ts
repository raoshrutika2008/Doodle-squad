import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { store } from './src/server/store.js';
import { solveHomeworkWithGemini } from './src/server/aiService.js';
import { VIDEO_SCENES, generateSpeechAudio } from './src/server/ttsService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'DoodleSquad Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// User Profile & Gamification
app.get('/api/user', (req: Request, res: Response) => {
  res.json(store.user);
});

// Study Squads
app.get('/api/squads', (req: Request, res: Response) => {
  res.json(store.squads);
});

app.post('/api/squads', (req: Request, res: Response) => {
  const { name, subject, motto, avatar } = req.body;
  if (!name || !subject) {
    res.status(400).json({ error: 'Name and subject are required' });
    return;
  }
  const squad = store.createSquad(name, subject, motto, avatar);
  res.status(201).json(squad);
});

app.get('/api/squads/:id', (req: Request, res: Response) => {
  const squad = store.squads.find(s => s.id === req.params.id);
  if (!squad) {
    res.status(404).json({ error: 'Squad not found' });
    return;
  }
  res.json(squad);
});

app.post('/api/squads/:id/join', (req: Request, res: Response) => {
  const squad = store.joinSquad(req.params.id);
  if (!squad) {
    res.status(404).json({ error: 'Squad not found' });
    return;
  }
  res.json({ success: true, squad, user: store.user });
});

app.post('/api/squads/:id/messages', (req: Request, res: Response) => {
  const { text, attachmentType, attachmentContent } = req.body;
  if (!text) {
    res.status(400).json({ error: 'Message text is required' });
    return;
  }
  const message = store.addSquadMessage(req.params.id, text, attachmentType, attachmentContent);
  if (!message) {
    res.status(404).json({ error: 'Squad not found' });
    return;
  }
  res.status(201).json({ message, user: store.user });
});

app.post('/api/squads/:id/timer', (req: Request, res: Response) => {
  const squad = store.squads.find(s => s.id === req.params.id);
  if (!squad) {
    res.status(404).json({ error: 'Squad not found' });
    return;
  }
  const { isRunning, minutes } = req.body;
  if (typeof isRunning === 'boolean') squad.isTimerRunning = isRunning;
  if (typeof minutes === 'number') squad.timerMinutes = minutes;
  res.json({ success: true, squad });
});

// Wall of Fame
app.get('/api/wall-of-fame', (req: Request, res: Response) => {
  const { subject, sort } = req.query;
  let items = [...store.wallOfFame];

  if (subject && subject !== 'All') {
    items = items.filter(item => item.subject.toLowerCase() === String(subject).toLowerCase());
  }

  if (sort === 'stars') {
    items.sort((a, b) => b.stars - a.stars);
  } else if (sort === 'strokes') {
    items.sort((a, b) => b.strokesCount - a.strokesCount);
  }

  res.json(items);
});

app.post('/api/wall-of-fame', (req: Request, res: Response) => {
  const { title, subject, description, doodleSvg, strokesCount, tags, explanationSnippet } = req.body;
  if (!title || !description) {
    res.status(400).json({ error: 'Title and description are required' });
    return;
  }
  const newItem = store.addWallItem({
    title,
    author: store.user.name,
    authorAvatar: store.user.avatar,
    subject: subject || 'Math',
    description,
    doodleSvg,
    strokesCount: strokesCount || 10,
    tags: tags || ['DoodleSquad', subject || 'Study'],
    explanationSnippet: explanationSnippet || description
  });
  res.status(201).json({ item: newItem, user: store.user });
});

app.post('/api/wall-of-fame/:id/star', (req: Request, res: Response) => {
  const updated = store.starWallItem(req.params.id);
  if (!updated) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }
  res.json({ item: updated, user: store.user });
});

// Daily Challenges
app.get('/api/challenges', (req: Request, res: Response) => {
  res.json(store.challenges);
});

app.post('/api/challenges/:id/complete', (req: Request, res: Response) => {
  const updated = store.completeChallenge(req.params.id);
  if (!updated) {
    res.status(404).json({ error: 'Challenge not found' });
    return;
  }
  res.json({ challenge: updated, user: store.user });
});

// Canvases
app.get('/api/canvases', (req: Request, res: Response) => {
  res.json(store.savedCanvases);
});

app.post('/api/canvases', (req: Request, res: Response) => {
  const { title, subject, strokes, stickyNotes, stickers, thumbnail } = req.body;
  const newCanvas = {
    id: 'canvas-' + Date.now(),
    title: title || 'Untitled Doodle Canvas',
    subject: subject || 'General',
    strokes: strokes || [],
    stickyNotes: stickyNotes || [],
    stickers: stickers || [],
    author: store.user.name,
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    thumbnail
  };
  store.savedCanvases.unshift(newCanvas);
  store.user.xp += 30;
  res.status(201).json({ canvas: newCanvas, user: store.user });
});

// AI Homework Superpowers
app.post('/api/ai/solve', async (req: Request, res: Response) => {
  try {
    const { query, mode, subject } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }
    const result = await solveHomeworkWithGemini(query, mode, subject);
    store.user.xp += 20; // Gamification XP reward for learning!
    res.json({ result, user: store.user });
  } catch (err: any) {
    console.error('AI Solver error:', err);
    res.status(500).json({ error: err.message || 'Failed to solve homework problem' });
  }
});

// Video Tour & AI Voice Dubbing
app.get('/api/video/scenes', (req: Request, res: Response) => {
  res.json({ scenes: VIDEO_SCENES });
});

app.post('/api/ai/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }
    const audioResult = await generateSpeechAudio(text, voice || 'Kore');
    if (audioResult) {
      res.json(audioResult);
    } else {
      res.json({ fallback: true, mode: 'speech_synthesis' });
    }
  } catch (err: any) {
    res.json({ fallback: true, mode: 'speech_synthesis' });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    // Serve transformed index.html for client routes
    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite) vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DoodleSquad server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start DoodleSquad server:', err);
  process.exit(1);
});
