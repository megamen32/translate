import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';

export const DEFAULT_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
export const DEFAULT_MODEL = 'openrouter/auto';

export const LANG_ALIASES = new Map([
  ['cn', 'zh-CN'], ['zh', 'zh-CN'], ['zh_cn', 'zh-CN'], ['zh-cn', 'zh-CN'],
  ['ua', 'uk'], ['jp', 'ja'], ['kr', 'ko']
]);

export function normalizeLang(lang) {
  const value = String(lang || '').trim();
  if (!value) return '';
  return LANG_ALIASES.get(value.toLowerCase()) || value;
}

export function displayLang(lang) {
  const normalized = normalizeLang(lang);
  return normalized === 'zh-CN' ? 'cn' : normalized;
}

export function splitLangs(line) {
  return String(line || '')
    .split(/[\s,;]+/g)
    .map(normalizeLang)
    .filter(Boolean);
}

export function makePrompt(text, targetLang, sourceLang = 'auto') {
  return [
    {
      role: 'system',
      content: [
        'You are a translation engine.',
        'Auto-detect the source language when source is auto.',
        'Return only the translated text, no explanations, no markdown fences.',
        'Preserve formatting, markdown, code blocks, links, placeholders, frontmatter keys, variables, indentation, and line breaks.',
        'Translate human-readable prose and UI strings. Do not translate code identifiers, URLs, file paths, package names, environment variable names, or command names.',
        'For Chinese target zh-CN/cn, use Simplified Chinese.'
      ].join(' ')
    },
    {
      role: 'user',
      content: `Source language: ${sourceLang || 'auto'}\nTarget language: ${targetLang}\n\nText:\n${text}`
    }
  ];
}

export async function translateText({
  text,
  targetLang,
  sourceLang = 'auto',
  apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '',
  endpoint = process.env.TRANSLATE_ENDPOINT || process.env.OPENAI_BASE_URL || DEFAULT_ENDPOINT,
  model = process.env.TRANSLATE_MODEL || process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
  fetchImpl = fetch
}) {
  if (!String(text || '').trim()) throw new Error('Empty text');
  const target = normalizeLang(targetLang);
  if (!target) throw new Error('Target language is required');
  if (!apiKey) throw new Error('Missing API key: set OPENROUTER_API_KEY/OPENAI_API_KEY or pass apiKey');

  const url = endpoint.endsWith('/chat/completions') ? endpoint : endpoint.replace(/\/$/, '') + '/chat/completions';
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${apiKey}`,
      'http-referer': 'https://translate.bezrabotnyi.com',
      'x-title': 'BeZ Translate'
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: makePrompt(text, target, sourceLang)
    })
  });

  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); } catch { data = null; }
  if (!response.ok) {
    const message = data?.error?.message || data?.message || raw.slice(0, 500) || response.statusText;
    throw new Error(`Translation API failed (${response.status}): ${message}`);
  }
  const translated = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text;
  if (!translated) throw new Error('Translation API returned empty result');
  return String(translated).trim();
}

export async function readGittranslateConfig(cwd = process.cwd()) {
  const file = path.join(cwd, '.gittranslate');
  const body = await fs.readFile(file, 'utf8');
  const lines = body.split(/\r?\n/);
  const first = lines.find(line => line.trim() && !line.trim().startsWith('#')) || '';
  const firstIndex = lines.indexOf(first);
  const languages = splitLangs(first);
  const patterns = lines
    .slice(firstIndex + 1)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
  return { file, languages, patterns: patterns.length ? patterns : ['README.md', 'docs/**/*.md'] };
}

export function targetPathFor(sourcePath, lang, outDir = '') {
  const parsed = path.parse(sourcePath);
  const suffix = displayLang(lang);
  const basename = parsed.name.replace(/\.(ru|en|cn|zh-CN|uk|ja|ko)$/i, '');
  const next = path.join(parsed.dir, `${basename}.${suffix}${parsed.ext}`);
  return outDir ? path.join(outDir, next) : next;
}

export function looksGenerated(file, languages = []) {
  const name = path.parse(file).name.toLowerCase();
  const suffixes = new Set(languages.map(displayLang).map(x => x.toLowerCase()).concat(['ru','en','cn','zh-cn','zh']));
  const last = name.split('.').pop();
  return suffixes.has(last);
}

export async function expandPatterns(patterns, cwd, languages) {
  const entries = await fg(patterns, {
    cwd,
    onlyFiles: true,
    dot: false,
    ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**']
  });
  return [...new Set(entries)].filter(file => !looksGenerated(file, languages));
}

export async function translateGittranslate({
  cwd = process.cwd(),
  apiKey,
  endpoint,
  model,
  sourceLang = 'auto',
  outDir = '',
  overwrite = true,
  dryRun = false,
  onProgress = () => {}
} = {}) {
  const config = await readGittranslateConfig(cwd);
  if (!config.languages.length) throw new Error('.gittranslate first non-comment line must contain languages, e.g. ru en cn');
  const files = await expandPatterns(config.patterns, cwd, config.languages);
  const results = [];
  for (const file of files) {
    const source = await fs.readFile(path.join(cwd, file), 'utf8');
    for (const lang of config.languages) {
      const out = targetPathFor(file, lang, outDir);
      const absOut = path.join(cwd, out);
      if (!overwrite) {
        try { await fs.access(absOut); results.push({ file, lang, out, skipped: true }); continue; } catch {}
      }
      onProgress({ file, lang, out });
      if (!dryRun) {
        const translated = await translateText({ text: source, targetLang: lang, sourceLang, apiKey, endpoint, model });
        await fs.mkdir(path.dirname(absOut), { recursive: true });
        await fs.writeFile(absOut, translated + '\n');
      }
      results.push({ file, lang, out, skipped: false });
    }
  }
  return { config, files, results };
}
