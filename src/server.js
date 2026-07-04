import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { translateText, DEFAULT_ENDPOINT, DEFAULT_MODEL } from './translator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.TRANSLATE_PORT || process.env.PORT || 3097);

app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: '1h' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/config', (_req, res) => res.json({ endpoint: process.env.TRANSLATE_ENDPOINT || DEFAULT_ENDPOINT, model: process.env.TRANSLATE_MODEL || DEFAULT_MODEL }));
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLang, sourceLang, endpoint, model, apiKey } = req.body || {};
    const headerKey = String(req.get('authorization') || '').replace(/^Bearer\s+/i, '');
    const translated = await translateText({
      text,
      targetLang,
      sourceLang: sourceLang || 'auto',
      endpoint: endpoint || process.env.TRANSLATE_ENDPOINT,
      model: model || process.env.TRANSLATE_MODEL,
      apiKey: apiKey || headerKey || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY
    });
    res.json({ ok: true, translated });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.listen(port, '127.0.0.1', () => console.log(`translate listening on 127.0.0.1:${port}`));
