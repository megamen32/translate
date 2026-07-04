# BeZ Translate

Мини-переводчик для текста и автоперевода документации из `.gittranslate`.

## Web

```bash
npm install
TRANSLATE_PORT=3097 npm start
```

Открой `translate.bezrabotnyi.com`, вставь текст, выбери язык, получи перевод. Язык оригинала определяется моделью автоматически.

## CLI

Без публикации в npm:

```bash
npx -y github:megamen32/translate "Привет" --to en
```

После публикации scoped-пакета:

```bash
npx -y @bezrabotnyi/translate "Привет" --to en
```

Обычное использование:

```bash
export OPENROUTER_API_KEY=sk-or-...
translate "Hello" --to ru
echo "Hello" | translate --to cn
```

## `.gittranslate`

Первая строка — языки назначения. `cn` автоматически превращается в Simplified Chinese `zh-CN`.

```text
ru en cn
README.md
docs/**/*.md
```

Запуск:

```bash
translate --docs
```

Для `README.md` будут созданы `README.ru.md`, `README.en.md`, `README.cn.md`. Язык оригинала определяется автоматически, сгенерированные языковые файлы повторно не переводятся.

## Настройки

```bash
OPENROUTER_API_KEY=sk-or-...
TRANSLATE_MODEL=openrouter/auto
TRANSLATE_ENDPOINT=https://openrouter.ai/api/v1
```

Также можно передать `--key`, `--model`, `--endpoint`.
