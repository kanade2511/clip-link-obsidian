# Clip Link

Copy any text to clipboard with a single click — just like a regular link.

- [Phone](clip: 770-555-5765)
- [Email](clip: [foo@example.com](mailto:foo@example.com))
- [Command](clip: brew install ffmpeg)
- [Prompt](clip: "Delegate tasks to sub-agents and implement in parallel.")

Click → copied. No navigation, no right-click, no text selection.

## Install

1. Install [BRAT](obsidian://show-plugin?id=BRAT) from Community Plugins
2. `Add a beta plugin` → `https://github.com/kanade2511/clip-link-obsidian`
3. Enable **Clip Link** in Community Plugins

Or copy `main.js` + `manifest.json` into `.obsidian/plugins/clip-link/`.

## Usage


| Markdown                       | Result                                                  |
| ------------------------------ | ------------------------------------------------------- |
| `[Call](clip: +1-555-0199)`    | Copies `+1-555-0199`, shows "Copied: Call"              |
| `[Key](clip: sk-xxxx)`         | Copies `sk-xxxx`                                        |
| `[GitHub](https://github.com)` | Navigates normally — only `clip:` links are intercepted |
| `[Text](clip: hello)`          | Copies `hello`                                          |


Links using `clip:` are shown in cyan to distinguish them from regular links.

## Why

- Zero config — install and use
- No plugin settings
- Works in Reading View and Live Preview
- Uses standard Markdown syntax

## Compatibility

- Obsidian Desktop (v0.15+)
- Obsidian Mobile

---

[日本語](./README.ja.md)