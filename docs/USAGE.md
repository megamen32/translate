# BeZ Translate usage

## Providers

The CLI and web app support `google` (default), `mymemory`, `libre`, and `openrouter`. The first three call their configured external translation endpoints; their availability and limits are controlled by those services. `openrouter` uses an OpenAI-compatible endpoint and requires `OPENROUTER_API_KEY` or `OPENAI_API_KEY`.

## Configuration

Environment variables:

- `TRANSLATE_PROVIDER` selects the default provider.
- `TRANSLATE_MODEL` and `TRANSLATE_ENDPOINT` configure OpenRouter-compatible mode.
- `LIBRETRANSLATE_ENDPOINT` configures the LibreTranslate-compatible adapter.
- `TRANSLATE_PORT` changes the local web port (default `3097`).

CLI flags `--provider`, `--key`, `--model`, and `--endpoint` override environment values where applicable. Do not commit API keys.

## `.gittranslate`

The first non-comment line contains target languages; later non-comment lines are file globs:

```text
ru en cn
README.md
docs/**/*.md
```

`cn` is normalized to Simplified Chinese (`zh-CN`). Generated files use language suffixes such as `README.ru.md` and are excluded from the next source scan. `--dry-run` prints the planned files without writing; `--no-overwrite` skips existing outputs.
