export function normalizeFreeLang(lang) {
  const value = String(lang || '').trim();
  const lower = value.toLowerCase();
  if (lower === 'cn' || lower === 'zh' || lower === 'zh-cn') return 'zh-CN';
  if (lower === 'ua') return 'uk';
  if (lower === 'jp') return 'ja';
  if (lower === 'kr') return 'ko';
  return value;
}

function splitText(text, maxChars) {
  const src = String(text || '');
  if (src.length <= maxChars) return [src];
  const out = [];
  let rest = src;
  while (rest.length > maxChars) {
    let cut = rest.lastIndexOf('\n\n', maxChars);
    if (cut < maxChars * 0.4) cut = rest.lastIndexOf('\n', maxChars);
    if (cut < maxChars * 0.4) cut = rest.lastIndexOf('. ', maxChars);
    if (cut < maxChars * 0.4) cut = maxChars;
    out.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  if (rest) out.push(rest);
  return out;
}

async function getJson(url, options) {
  const response = await fetch(url, options);
  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); } catch { data = null; }
  if (!response.ok) throw new Error((data && (data.responseDetails || data.message)) || raw.slice(0, 300) || response.statusText);
  return data;
}

export async function translateGoogleFree(text, targetLang, sourceLang = 'auto') {
  const target = normalizeFreeLang(targetLang);
  const source = sourceLang === 'auto' ? 'auto' : normalizeFreeLang(sourceLang);
  const parts = splitText(text, 4200);
  const translated = [];
  let detectedLang = '';
  for (const part of parts) {
    const params = new URLSearchParams({ client: 'gtx', sl: source, tl: target, dt: 't', q: part });
    const data = await getJson(`https://translate.googleapis.com/translate_a/single?${params.toString()}`);
    translated.push((data && data[0] ? data[0] : []).map(x => x && x[0] ? x[0] : '').join(''));
    detectedLang = detectedLang || (data && data[2]) || '';
  }
  return { translated: translated.join(''), detectedLang, provider: 'google' };
}

export async function translateMyMemoryFree(text, targetLang, sourceLang = 'auto') {
  let source = sourceLang === 'auto' ? '' : normalizeFreeLang(sourceLang);
  let detectedLang = source;
  if (!source) {
    const detected = await translateGoogleFree(String(text).slice(0, 500), targetLang || 'en', 'auto');
    source = detected.detectedLang || 'en';
    detectedLang = source;
  }
  const target = normalizeFreeLang(targetLang);
  const parts = splitText(text, 450);
  const translated = [];
  for (const part of parts) {
    const params = new URLSearchParams({ q: part, langpair: `${source}|${target}`, mt: '1' });
    const data = await getJson(`https://api.mymemory.translated.net/get?${params.toString()}`);
    const value = data && data.responseData && data.responseData.translatedText;
    if (!value) throw new Error((data && data.responseDetails) || 'empty MyMemory response');
    translated.push(value);
  }
  return { translated: translated.join(''), detectedLang, provider: 'mymemory' };
}

export async function translateLibreFree(text, targetLang, sourceLang = 'auto', endpoint = 'https://libretranslate.com') {
  const target = normalizeFreeLang(targetLang) === 'zh-CN' ? 'zh' : normalizeFreeLang(targetLang);
  const source = sourceLang === 'auto' ? 'auto' : normalizeFreeLang(sourceLang);
  const data = await getJson(`${String(endpoint).replace(/\/$/, '')}/translate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ q: text, source, target, format: 'text' })
  });
  return { translated: data.translatedText || '', detectedLang: data.detectedLanguage?.language || '', provider: 'libre' };
}
