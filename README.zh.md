# BeZ Translate

一个基于 BYOK 的文本与 Markdown 文档翻译器，通过 `.gittranslate` 配置批量翻译。

**[English](./README.md)** · **[Русский](./README.ru.md)** · **简体中文**

![BeZ Translate 工作流](docs/assets/readme-hero.png)

## 快速开始

需要 Node.js 20+。使用一条命令安装锁定依赖：

```bash
npm ci
```

设置 [OpenRouter](https://openrouter.ai/) key，然后启动本地网页应用：

```bash
export OPENROUTER_API_KEY=sk-or-...
npm start
```

打开 <http://127.0.0.1:3097>，也可以通过 `TRANSLATE_PORT` 更换端口。

## CLI

无需全局安装即可运行本地 CLI：

```bash
npm run translate -- "Привет" --to en
echo "Hello" | npm run translate -- --to ru
```

GitHub 版本：

```bash
npx -y github:megamen32/translate "Привет" --to en
```

## 批量翻译文档

创建 `.gittranslate`：

```text
ru en cn
README.md
docs/**/*.md
```

然后执行：

```bash
npm run translate -- --docs
```

`cn` 会转换为简体中文 `zh-CN`，源语言由模型自动识别。

## 配置

翻译需要 `OPENROUTER_API_KEY`。可选变量为 `TRANSLATE_MODEL`、`TRANSLATE_ENDPOINT`；命令行的 `--key`、`--model`、`--endpoint` 优先级更高。

## 许可证

MIT
