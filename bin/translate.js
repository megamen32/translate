#!/usr/bin/env node
import 'dotenv/config';
import fs from 'node:fs/promises';
import { stdin as input } from 'node:process';
import { translateText, translateGittranslate, DEFAULT_ENDPOINT, DEFAULT_MODEL } from '../src/translator.js';
import { translateGoogleFree, translateMyMemoryFree, translateLibreFree } from '../src/freeProviders.js';

function help() {
  console.log(`BeZ Translate

Text:
  translate "Привет" --to en
  echo "Hello" | translate --to ru

Docs from .gittranslate:
  translate --docs
  translate init

.gittranslate:
  ru en cn
  README.md
  docs/**/*.md

Providers:
  google      free unofficial Google endpoint, default
  mymemory    free official REST API
  libre       LibreTranslate-compatible endpoint
  openrouter  BYOK LLM quality mode

Options:
  --provider, -p <name> provider, default google
  --to, -t <lang>       target language for text mode
  --from <lang>         source language, default auto
  --docs                translate files listed in .gittranslate
  --init                create .gittranslate
  --model <id>          default ${DEFAULT_MODEL}
  --endpoint <url>      default ${DEFAULT_ENDPOINT}
  --key <key>           or OPENROUTER_API_KEY / OPENAI_API_KEY
  --out-dir <dir>       write generated docs under dir
  --no-overwrite        skip existing generated files
  --dry-run             show planned files only`);
}

function parse(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--docs' || a === 'docs') opts.docs = true;
    else if (a === '--init' || a === 'init') opts.init = true;
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--no-overwrite') opts.overwrite = false;
    else if (a === '--provider' || a === '-p') opts.provider = argv[++i];
    else if (a === '--to' || a === '-t') opts.to = argv[++i];
    else if (a === '--from') opts.from = argv[++i];
    else if (a === '--model') opts.model = argv[++i];
    else if (a === '--endpoint') opts.endpoint = argv[++i];
    else if (a === '--key') opts.key = argv[++i];
    else if (a === '--out-dir') opts.outDir = argv[++i];
    else opts._.push(a);
  }
  return opts;
}

async function readStdinIfPiped() {
  if (input.isTTY) return '';
  const chunks = [];
  for await (const chunk of input) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

const opts = parse(process.argv.slice(2));
if (opts.help) { help(); process.exit(0); }
if (opts.init) {
  await fs.writeFile('.gittranslate', 'ru en cn\nREADME.md\ndocs/**/*.md\n', { flag: 'wx' }).catch(async err => {
    if (err.code === 'EEXIST') throw new Error('.gittranslate already exists');
    throw err;
  });
  console.log('created .gittranslate');
  process.exit(0);
}

try {
  const positional = opts._.join(' ').trim();
  const stdin = await readStdinIfPiped();
  const text = positional || stdin.trim();
  const shouldDocs = opts.docs || (!text && await fs.access('.gittranslate').then(() => true, () => false));

  if (shouldDocs) {
    const result = await translateGittranslate({
      apiKey: opts.key,
      endpoint: opts.endpoint,
      model: opts.model,
      sourceLang: opts.from || 'auto',
      outDir: opts.outDir || '',
      overwrite: opts.overwrite !== false,
      dryRun: Boolean(opts.dryRun),
      onProgress: ({ file, lang, out }) => console.error(`${file} -> ${out} (${lang})`)
    });
    console.log(`done: ${result.results.length} translations, ${result.files.length} source files`);
    process.exit(0);
  }

  if (!opts.to) throw new Error('Missing --to <lang>');
  const provider = String(opts.provider || process.env.TRANSLATE_PROVIDER || 'google').toLowerCase();
  let result;
  if (provider === 'google') result = await translateGoogleFree(text, opts.to, opts.from || 'auto');
  else if (provider === 'mymemory') result = await translateMyMemoryFree(text, opts.to, opts.from || 'auto');
  else if (provider === 'libre' || provider === 'libretranslate') result = await translateLibreFree(text, opts.to, opts.from || 'auto', opts.endpoint || process.env.LIBRETRANSLATE_ENDPOINT || 'https://libretranslate.com');
  else {
    const translated = await translateText({ text, targetLang: opts.to, sourceLang: opts.from || 'auto', apiKey: opts.key, endpoint: opts.endpoint, model: opts.model });
    result = { translated, detectedLang: '', provider: 'openrouter' };
  }
  if (result.detectedLang) console.error(`detected: ${result.detectedLang}; provider: ${result.provider}`);
  console.log(result.translated);
} catch (error) {
  console.error(`translate: ${error.message}`);
  process.exit(1);
}
