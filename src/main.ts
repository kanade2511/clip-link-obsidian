import { Plugin, Notice, MarkdownView } from 'obsidian';
import { ViewPlugin, Decoration, DecorationSet, EditorView, ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

// ---------------------------------------------------------------------------
// CM6 Plugin — add .clip-link-text class to clip: links in Live Preview
// ---------------------------------------------------------------------------

const clipLinkStylePlugin = ViewPlugin.fromClass(
	class {
		decorations: DecorationSet = Decoration.set([]);

		constructor(view: EditorView) {
			this.decorations = this.build(view);
		}

		update(u: ViewUpdate) {
			if (u.docChanged || u.viewportChanged) {
				this.decorations = this.build(u.view);
			}
		}

		build(view: EditorView): DecorationSet {
			const decos: any[] = [];
			const tree = syntaxTree(view.state);

			const walk = (node: any) => {
				if (node.name === 'string_url') {
					const url = view.state.doc.sliceString(node.from, node.to);
					if (!url.startsWith('clip:')) return;

					let prev = node.prevSibling;
					while (prev && prev.name !== 'link') prev = prev.prevSibling;
					if (!prev) return;

					decos.push(
						Decoration.mark({ class: 'clip-link-text' }).range(prev.from, prev.to),
					);
				}
				if (node.firstChild) {
					for (let c = node.firstChild; c; c = c.nextSibling) walk(c);
				}
			};

			for (let c = tree.topNode.firstChild; c; c = c.nextSibling) walk(c);
			return Decoration.set(decos);
		}
	},
	{ decorations: (v) => v.decorations },
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Intercept the event, copy text to clipboard, show notification. */
function doCopy(text: string, evt: Event) {
	evt.preventDefault();
	evt.stopPropagation();
	evt.stopImmediatePropagation();

	const cleaned = text.slice('clip:'.length).trim();
	navigator.clipboard.writeText(cleaned)
		.then(() => new Notice(`Copied: ${cleaned}`))
		.catch(() => new Notice(`ClipLink: clipboard error`));
}

/** Regex matching a markdown link at any position in a line. */
const LINK_RE = /\[([^\]]*)\]\(([^)]*)\)/g;

// ---------------------------------------------------------------------------
// Main Plugin
// ---------------------------------------------------------------------------

export default class ClipLinkPlugin extends Plugin {
	async onload() {
		// --- Click handler (intercepts pointerdown before CM6/HTML does) ---
		const handler = (e: PointerEvent) => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!view) return;

			const state = view.getState();

			// mode=source|live → Editing View  (has CM6 → line-based regex parsing)
			// mode=preview     → Reading View (static HTML → <a> DOM element)
			const isEditing = state?.mode !== 'preview';

			if (isEditing) {
				// ========== Editing View (Live Preview / Source) ==========
				// @ts-expect-error - cm is an internal bridge property
				const cm = view.editor.cm;
				if (!cm) return;

				const pos = cm.posAtCoords({ x: e.clientX, y: e.clientY });
				if (pos == null) return;

				const line = cm.state.doc.lineAt(pos);
				const lineStart = line.from;
				LINK_RE.lastIndex = 0;

				let m: RegExpExecArray | null;
				while ((m = LINK_RE.exec(line.text)) !== null) {
					const linkStart = lineStart + m.index;
					const linkEnd = linkStart + m[0].length;
					if (pos >= linkStart && pos < linkEnd) {
						if (m[2].startsWith('clip:')) doCopy(m[2], e);
						return;
					}
				}
			} else {
				// ========== Reading View ==========
				// Styled by CSS a[href^="clip:"] (in styles.css).
				const link = (e.target as HTMLElement).closest('a');
				if (!link) return;

				const href = link.getAttribute('href');
				if (href?.startsWith('clip:')) doCopy(href, e);
			}
		};

		window.addEventListener('pointerdown', handler, true);
		this.register(() => window.removeEventListener('pointerdown', handler, true));

		// --- CM6 styling (Editing View) ---
		this.registerEditorExtension(clipLinkStylePlugin);

		// --- Reading View: render [text](clip:…) as actual <a> elements ---
		// Obsidian's renderer leaves unknown schemes as raw text, so we
		// create clickable <a> elements via a markdown post-processor.
		this.registerMarkdownPostProcessor((el) => {
			const doc = el.ownerDocument;
			const walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT);
			const textNodes: Text[] = [];
			while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

			for (const node of textNodes) {
				const m = node.textContent?.match(/\[([^\]]*)\]\(clip:\s*([^)]+)\)/);
				if (!m) continue;

				const before = doc.createTextNode(node.textContent!.slice(0, m.index));
				const anchor = doc.createElement('a');
				anchor.href = `clip:${m[2]}`;
				anchor.textContent = m[1];
				anchor.className = 'clip-link-anchor';
				const after = doc.createTextNode(
					node.textContent!.slice(m.index! + m[0].length),
				);

				node.parentNode!.insertBefore(before, node);
				node.parentNode!.insertBefore(anchor, node);
				node.parentNode!.insertBefore(after, node);
				node.parentNode!.removeChild(node);
			}
		});
	}
}
