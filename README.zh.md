# BeZ Translate

一个用于文本和 Markdown 文档的本地翻译器，通过 `.gittranslate` 配置批量翻译；支持免费服务和 BYOK 模式。

**[English](./README.md)** · **[Русский](./README.ru.md)** · **简体中文**

![BeZ Translate 工作流](docs/assets/readme-hero.png)

## 快速开始

需要 Node.js 20+。这是源码安装；这里尚未声明已发布的 npm 包：

```bash
npm ci
```

启动本地网页应用（默认使用免费的 Google 适配器）：

```bash
export OPENROUTER_API_KEY=sk-or-...
npm start
```

打开 <http://127.0.0.1:3097>，也可以通过 `TRANSLATE_PORT` 更换端口。

使用 OpenRouter 模式时，请设置 `OPENROUTER_API_KEY` 并传入 `--provider openrouter`。

## CLI

无需全局安装即可运行本地 CLI：

```bash
npm run translate -- "Привет" --to en
echo "Hello" | npm run translate -- --to ru
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

OpenRouter 模式需要 `OPENROUTER_API_KEY`；免费服务不需要 key。可选变量为 `TRANSLATE_MODEL`、`TRANSLATE_ENDPOINT`；命令行的 `--key`、`--model`、`--endpoint` 优先级更高。

## 许可证

MIT
