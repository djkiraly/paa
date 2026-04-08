---
name: TipTap RichTextEditor component
description: Notes on TipTap v3 integration in the PAA admin panel — API patterns, installed extensions, and placeholder approach
type: project
---

TipTap v3.22.3 is installed (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/pm`). No other TipTap extensions are installed.

**Why:** Admin CMS needs rich text editing for page sections and initiative descriptions.

**How to apply:** When adding TipTap fields to admin forms, import from `@/components/admin/RichTextEditor` and pass `value` (HTML string) + `onChange` callback.

## Key API facts (v3)

- `useEditor({ immediatelyRender: false })` returns `Editor | null` — always guard for null in selectors
- Active-state tracking: use `useEditorState({ editor, selector })` — the selector receives `{ editor: Editor | null, transactionNumber }`. Return null from selector when editor is null.
- `StarterKit` in v3 includes Link via `@tiptap/extension-link` (configured via `StarterKit.configure({ link: ... })`). To use the separate `Link` extension with custom config, set `link: false` in StarterKit options.
- `Tiptap` / `TiptapWrapper` / `TiptapContent` are the v3 context-based API — not used here; we use `useEditor` + `EditorContent` directly.
- `onMouseDown + e.preventDefault()` on toolbar buttons is required to prevent editor losing focus on click.

## Placeholder approach

`@tiptap/extension-placeholder` is NOT installed. Placeholder is implemented as a React-rendered absolute-positioned `<p aria-hidden>` that shows when `activeState?.isEmpty` is true. This avoids an extra dependency.

TODO: Phase 2 — install `@tiptap/extension-placeholder` for native cursor-level placeholder support.

## Scoped prose styles

Editor content styles are delivered via a `<style>` tag scoped to `.rte-content .tiptap` to avoid leaking into the admin UI. If a second editor instance is added, migrate these rules to `globals.css`.
