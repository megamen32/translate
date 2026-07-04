import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { translateText, DEFAULT_ENDPOINT, DEFAULT_MODEL } from './translator.js';
import { translateGoogleFree, translateMyMemoryFree, translateLibreFree } from './freeProviders.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.TRANSLATE_PORT || process.env.PORT || 3097);

app.disable('x-powered-by');
app.use(express.json({ limit: '4mb' }));
app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: '1h' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/config', (_req, res) => res.json({
  provider: process.env.TRANSLATE_PROVIDER || 'google',
  endpoint: process.env.TRANSLATE_ENDPOINT || DEFAULT_ENDPOINT,
  model: process.env.TRANSLATE_MODEL || DEFAULT_MODEL
}));

app.post('/api/translate', async (req, res) => {
  try {
    const { provider, text, targetLang, sourceLang, endpoint, model, apiKey } = req.body || {};
    const selected = String(provider || process.env.TRANSLATE_PROVIDER || 'google').toLowerCase();
    let result;
    if (selected === 'google') {
      result = await translateGoogleFree(text, targetLang, sourceLang || 'auto');
    } else if (selected === 'mymemory') {
      result = await translateMyMemoryFree(text, targetLang, sourceLang || 'auto');
    } else if (selected === 'libre' || selected === 'libretranslate') {
      result = await translateLibreFree(text, targetLang, sourceLang || 'auto', endpoint || process.env.LIBRETRANSLATE_ENDPOINT || 'https://libretranslate.com');
    } else {
      const translated = await translateText({
        text,
        targetLang,
        sourceLang: sourceLang || 'auto',
        endpoint: endpoint || process.env.TRANSLATE_ENDPOINT,
        model: model || process.env.TRANSLATE_MODEL,
        apiKey: apiKey || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY
      });
      result = { translated, detectedLang: '', provider: 'openrouter' };
    }
    res.json({ ok: true, translated: result.translated, detectedLang: result.detectedLang, provider: result.provider });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.listen(port, '127.0.0.1', () => console.log(`translate listening on 127.0.0.1:${port}`));
