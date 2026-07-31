# BeZ Translate

Tiny BYOK translator for text and Markdown documentation driven by `.gittranslate`.

**[Русский](./README.ru.md)** · **[简体中文](./README.zh.md)**

![BeZ Translate workflow](docs/assets/readme-hero.png)

> Smoke-tested in this workspace with Node.js 22.22.3 and npm 10.9.8.

## Quick start

Requires Node.js 20+. Install the locked dependencies with one command:

```bash
npm ci
```

Set an [OpenRouter](https://openrouter.ai/) key, then start the local web app:

```bash
export OPENROUTER_API_KEY=sk-or-...
npm start
```

Open <http://127.0.0.1:3097> (or the configured `TRANSLATE_PORT`).

## CLI

Run the local CLI without a global install:

```bash
npm run translate -- "Привет" --to en
echo "Hello" | npm run translate -- --to ru
```

For a published or GitHub package, use:

```bash
npx -y github:megamen32/translate "Привет" --to en
```

## Translate a documentation set

Create `.gittranslate` with target languages and file globs:

```text
ru en cn
README.md
docs/**/*.md
```

Then run:

```bash
npm run translate -- --docs
```

`cn` is normalized to Simplified Chinese (`zh-CN`). The source language is detected automatically.

## Configuration

`OPENROUTER_API_KEY` is required for translation. Optional variables are
`TRANSLATE_MODEL` and `TRANSLATE_ENDPOINT`; CLI flags `--key`, `--model`, and
`--endpoint` override them.

## License

MIT
