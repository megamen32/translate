# BeZ Translate

Небольшой BYOK-переводчик текста и Markdown-документации по файлу `.gittranslate`.

**[English](./README.md)** · **[简体中文](./README.zh.md)**

![Рабочий процесс BeZ Translate](docs/assets/readme-hero.png)

## Быстрый старт

Нужен Node.js 20+. Установите зафиксированные зависимости одной командой:

```bash
npm ci
```

Задайте ключ [OpenRouter](https://openrouter.ai/) и запустите веб-приложение:

```bash
export OPENROUTER_API_KEY=sk-or-...
npm start
```

Откройте <http://127.0.0.1:3097> или порт из `TRANSLATE_PORT`.

## CLI

Локальный CLI без глобальной установки:

```bash
npm run translate -- "Привет" --to en
echo "Hello" | npm run translate -- --to ru
```

Опубликованная или GitHub-версия запускается так:

```bash
npx -y github:megamen32/translate "Привет" --to en
```

## Перевод документации

Создайте `.gittranslate` со списком языков и glob-шаблонов:

```text
ru en cn
README.md
docs/**/*.md
```

Запустите:

```bash
npm run translate -- --docs
```

`cn` означает упрощённый китайский (`zh-CN`), язык оригинала определяется автоматически.

## Настройки

Для перевода нужен `OPENROUTER_API_KEY`. Дополнительно доступны `TRANSLATE_MODEL` и `TRANSLATE_ENDPOINT`; флаги `--key`, `--model`, `--endpoint` имеют приоритет.

## Лицензия

MIT
