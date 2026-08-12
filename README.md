# BeZ Translate

**Translate text and Markdown docs from your terminal or a local web page—without handing your repository to a hosted app.**

[Русский](./README.ru.md) · [简体中文](./README.zh.md) · [Usage details](docs/USAGE.md)

![BeZ Translate workflow](docs/assets/readme-hero.png)

BeZ Translate is a small BYOK-friendly translator driven by `.gittranslate`. It uses free provider adapters by default and can use an OpenAI-compatible endpoint such as OpenRouter when you provide a key.

## What it does

- Translates one text from the CLI or local web UI.
- Detects the source language or accepts `--from`.
- Batch-translates Markdown files listed in `.gittranslate`.
- Preserves Markdown code, links, paths, placeholders, and command-like literals.
- Writes language-suffixed copies and supports dry runs and `--no-overwrite`.

## Run from source

This repository currently documents source setup, not a published npm install:

```bash
git clone https://github.com/megamen32/translate.git
cd translate
npm ci
```

Start the local web app:

```bash
npm start
```

Open <http://127.0.0.1:3097>. For a one-off CLI translation:

```bash
npm run translate -- "Привет" --to en
```

The default CLI provider is a free Google endpoint adapter. For OpenRouter quality mode, set `OPENROUTER_API_KEY` and pass `--provider openrouter` (or configure `TRANSLATE_PROVIDER`). Provider behavior and configuration are documented in [Usage](docs/USAGE.md).

## Translate a documentation set

```bash
npm run translate -- init
npm run translate -- --docs --dry-run
npm run translate -- --docs
```

Edit `.gittranslate` before the final command to choose languages and Markdown globs.

## Verify

```bash
npm test
```

## License

MIT
