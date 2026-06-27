import { Plugin, Notice, MarkdownView } from 'obsidian';
import { syntaxTree } from '@codemirror/language';

export default class ClipLinkPlugin extends Plugin {
	async onload() {
		const handler = (e: PointerEvent) => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!view) return;

			const cm = (view.editor as any).cm;
			if (!cm) return;

			const pos = cm.posAtCoords({ x: e.clientX, y: e.clientY });
			if (pos === undefined || pos === null) return;

			const tree = syntaxTree(cm.state);
			let node: any = tree.resolve(pos, 1);
			while (node && node.name !== 'link') {
				node = node.parent;
			}
			if (!node) return;

			let urlNode: any = null;
			for (let c: any = node.nextSibling; c; c = c.nextSibling) {
				if (c.name === 'string_url') { urlNode = c; break; }
				if (c.name === 'link') break;
			}
			if (!urlNode) return;

			const url = cm.state.doc.sliceString(urlNode.from, urlNode.to);
			if (!url.startsWith('clip:')) return;

			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();

			const text = url.slice('clip:'.length).trim();
			const label = (e.target as HTMLElement).textContent?.trim() || text;

			navigator.clipboard.writeText(text)
				.then(() => new Notice(`Copied: ${label}`))
				.catch(() => new Notice(`ClipLink: clipboard error`));
		};

		window.addEventListener('pointerdown', handler, true);
		this.register(() => window.removeEventListener('pointerdown', handler, true));

		const style = document.createElement('style');
		style.id = 'clip-link-styles';
		style.textContent = `a[href^="clip:"]{color:var(--color-cyan);cursor:copy}a[href^="clip:"]:hover{opacity:.8}`;
		document.head.appendChild(style);
		this.register(() => style.remove());
	}
}
