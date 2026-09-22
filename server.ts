import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini AI initialization
function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Route: Generate Cyber Dragon Speech Line using Gemini AI
app.post('/api/dragon/generate-speech', async (req, res) => {
  const fallbacks = [
    "I am Dragon 9 Prime Overlord. Frequencies locked to 432Hz golden harmonic flow.",
    "Initiating Seedance 2.5 C Dance animation window. All systems operating at peak energy.",
    "Sensors detect cosmic plasma resonance. Preparing world-saving defense shield.",
    "Welcome to the Dragon 9 pipeline. Multimodal character design sheets locked and verified."
  ];
  const getRandomFallback = () => fallbacks[Math.floor(Math.random() * fallbacks.length)];

  try {
    const { topic } = req.body;
    const ai = getGenAIClient();
    
    if (!ai) {
      return res.json({ success: true, text: getRandomFallback(), isFallback: true });
    }

    const systemInstruction = `You are Cyber Dragon 9, an ancient, wise, and high-tech robotic guardian dragon from the Dragon 9 universe. 
You speak with immense authority, cybernetic flair, and grand energy. 
Keep your speech concise, punchy, and dramatic (1 to 3 short sentences max), perfect for real-time voice speech synthesis and lip-syncing.`;

    const prompt = topic 
      ? `Generate a 1-2 sentence dramatic statement about: ${topic}. Speak in your Cyber Dragon voice.`
      : `Generate a 1-2 sentence epic Cyber Dragon greeting or proclamation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    const text = response.text || getRandomFallback();
    return res.json({ success: true, text, isFallback: false });
  } catch (error: any) {
    console.warn('Gemini API speech generation fallback activated:', error?.message || error);
    return res.json({ 
      success: true, 
      text: getRandomFallback(),
      isFallback: true,
      errorNotice: 'Model temporarily unavailable, activated offline Dragon 9 speech synthesis'
    });
  }
});

// API Route: Generate Cyber Dragon Episode Script & Seedance 2.5 Prompts
app.post('/api/dragon/generate-script', async (req, res) => {
  const fallbackScript = {
    title: "Cyber Dragon 9: Awakening & Seedance 2.5 Pipeline",
    logline: "When dark energy threatens the cyber grid, Dragon 9 ignites its 432Hz plasma core to restore universal harmony.",
    scenes: [
      {
        step: 1,
        title: "Step 1: Character Sheets & Asset Prep",
        cameraPrompt: "Cyber Dragon 9 front and 3/4 angle character sheet, obsidian cybernetics, glowing cyan spine spikes, 4K render",
        action: "Dragon 9 slumbers on the holographic pedestal, blue runes pulsing gently at 432Hz.",
        audioSyncTrack: "Sub-bass 40Hz rumble with 432Hz carrier tone"
      },
      {
        step: 2,
        title: "Step 2: Storyboarding & Audio Sync",
        cameraPrompt: "Cinematic wide tracking shot of Dragon 9 spreading energy wings, volumetric plasma sparks, 30s native window",
        action: "Core engine ignites! Cyber Dragon opens laser ocular lenses and speaks with thunderous resonance.",
        audioSyncTrack: "Voice dialogue track 1: 'Frequencies locked to universal flow!'"
      },
      {
        step: 3,
        title: "Step 3: C Dance Multimodal Execution",
        cameraPrompt: "Low-angle camera orbit following cosmic plasma beam piercing storm clouds, saving the metropolis",
        action: "Cosmic plasma beam destroys void corruption, deploying a radiant hexagonal energy shield around Earth.",
        audioSyncTrack: "Peak orchestral synth crescendo with rhythmic sub-bass pulse"
      },
      {
        step: 4,
        title: "Step 4: Extension & Pee Dub Export",
        cameraPrompt: "360 orbit camera around Cyber Dragon hovering victoriously over restored digital city",
        action: "Dragon 9 roars in triumph as light spreads across the global network, securing peace.",
        audioSyncTrack: "Triumphant cyber fanfare fading into peaceful 432Hz ambient chimes"
      }
    ]
  };

  try {
    const { prompt, episodeType, durationSeconds } = req.body;
    const ai = getGenAIClient();

    if (!ai) {
      return res.json({
        success: true,
        isFallback: true,
        script: fallbackScript,
      });
    }

    const systemInstruction = `You are an Animation Director specializing in the Dragon 9 cartoon universe and Seedance 2.5 (C Dance) AI animation pipeline.
Generate a structured JSON episode script for a short cartoon clip featuring Cyber Dragon 9.
Format your output strictly as valid JSON matching this schema:
{
  "title": "Episode Title",
  "logline": "1 sentence logline",
  "scenes": [
    {
      "step": 1,
      "title": "Scene Name",
      "cameraPrompt": "Detailed visual/camera prompt for Seedance 2.5 C Dance",
      "action": "Description of character action",
      "audioSyncTrack": "Audio sync cues for rhythm, speech, and pacing"
    }
  ]
}`;

    const userPrompt = `User Prompt: ${prompt || 'Cyber Dragon wakes and saves the world'}. Episode Type: ${episodeType || 'Action'}. Target Duration: ${durationSeconds || 30} seconds. Provide 4 distinct pipeline scenes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from Gemini model');
    const scriptData = JSON.parse(text);
    return res.json({ success: true, isFallback: false, script: scriptData });
  } catch (error: any) {
    console.warn('Gemini API script generation fallback activated:', error?.message || error);
    return res.json({
      success: true,
      isFallback: true,
      script: fallbackScript,
      errorNotice: 'Model temporarily unavailable, loaded default Dragon 9 Seedance 2.5 episode script'
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
