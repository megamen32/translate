# BeZ Translate

Небольшой переводчик текста и Markdown-документации по файлу `.gittranslate`: из терминала или локальной веб-страницы. Поддерживает бесплатные провайдеры и BYOK-режим.

**[English](./README.md)** · **[简体中文](./README.zh.md)**

![Рабочий процесс BeZ Translate](docs/assets/readme-hero.png)

## Быстрый старт

Нужен Node.js 20+. Это установка из исходников; опубликованный npm-пакет здесь не заявлен:

```bash
npm ci
```

Запустите локальное веб-приложение:

```bash
export OPENROUTER_API_KEY=sk-or-...
npm start
```

Откройте <http://127.0.0.1:3097> или порт из `TRANSLATE_PORT`.

По умолчанию CLI и веб-приложение используют бесплатный адаптер Google. Для режима OpenRouter задайте ключ и выберите `--provider openrouter`.

## CLI

Локальный CLI без глобальной установки:

```bash
npm run translate -- "Привет" --to en
echo "Hello" | npm run translate -- --to ru
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

Для режима OpenRouter нужен `OPENROUTER_API_KEY`; бесплатные провайдеры ключа не требуют. Дополнительно доступны `TRANSLATE_MODEL` и `TRANSLATE_ENDPOINT`; флаги `--key`, `--model`, `--endpoint` имеют приоритет.

## Лицензия

MIT
