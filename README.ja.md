# Clip Link

リンクをクリックする感覚で、任意の文字列をクリップボードにコピーできる Obsidian プラグイン。

- [電話番号](clip: 770-555-5765)
- [メール](clip: [foo@example.com](mailto:foo@example.com))
- [コマンド](clip: brew install ffmpeg)
- [プロンプト](clip: "サブエージェントに渡して平行で実装をして)

クリック → コピー完了。画面遷移も右クリックも範囲選択も不要。

## インストール

1. コミュニティプラグインから [BRAT](obsidian://show-plugin?id=BRAT) をインストール
2. `Add a beta plugin` → `https://github.com/kanade2511/clip-link-obsidian`
3. コミュニティプラグイン一覧で **Clip Link** を有効化

または `main.js` + `manifest.json` を `.obsidian/plugins/clip-link/` にコピー。

## 使い方


| Markdown                       | 動作                                   |
| ------------------------------ | ------------------------------------ |
| `[電話](clip: 770-555-5765)`     | `770-555-5765` をコピー、"Copied: 電話" と通知 |
| `[メール](clip: foo@example.com)` | `foo@example.com` をコピー               |
| `[GitHub](https://github.com)` | 通常通り遷移 — `clip:` スキームのみ処理            |
| `[メモ](clip: 覚書)`               | `覚書` をコピー                            |


`clip:` を使用したリンクは通常のリンクと区別できるようシアン色で表示されます。

## 特徴

- 設定不要 — インストールするだけ
- 設定画面なし（シンプル設計）
- Reading View / Live Preview 両対応
- 標準の Markdown 記法をそのまま使用

## 互換性

- Obsidian Desktop (v0.15+)
- Obsidian Mobile

---

[English](./README.md)