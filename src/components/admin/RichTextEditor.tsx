"use client";

import { useCallback, useState } from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
// TODO: Phase 2 — install @tiptap/extension-placeholder for native placeholder support
import { StarterKit } from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// ---------------------------------------------------------------------------
// Toolbar button
// ---------------------------------------------------------------------------

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive = false,
  isDisabled = false,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        // Prevent the editor from losing focus when clicking toolbar buttons
        e.preventDefault();
        onClick();
      }}
      disabled={isDisabled}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
      className={[
        "flex h-7 w-7 items-center justify-center rounded text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--paa-accent)]",
        "disabled:cursor-not-allowed disabled:opacity-30",
        isActive
          ? "bg-[var(--paa-accent)] text-white"
          : "text-[var(--paa-gray)] hover:bg-[var(--paa-slate)] hover:text-[var(--paa-white)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Toolbar divider
// ---------------------------------------------------------------------------

function ToolbarDivider() {
  return (
    <span
      aria-hidden="true"
      className="mx-0.5 h-5 w-px shrink-0 bg-white/10"
    />
  );
}

// ---------------------------------------------------------------------------
// SVG icons (inline, no external dependency)
// ---------------------------------------------------------------------------

const Icons = {
  Bold: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  ),
  Italic: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  ),
  H2: () => (
    <span className="text-[11px] font-bold leading-none tracking-tight">H2</span>
  ),
  H3: () => (
    <span className="text-[11px] font-bold leading-none tracking-tight">H3</span>
  ),
  BulletList: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  OrderedList: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <text x="3" y="8" fontSize="6" fill="currentColor" stroke="none" fontWeight="bold">1</text>
      <text x="3" y="14" fontSize="6" fill="currentColor" stroke="none" fontWeight="bold">2</text>
      <text x="3" y="20" fontSize="6" fill="currentColor" stroke="none" fontWeight="bold">3</text>
    </svg>
  ),
  Link: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  Unlink: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  ),
  Undo: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  ),
  Redo: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// Link dialog (inline, lightweight)
// ---------------------------------------------------------------------------

interface LinkDialogProps {
  onConfirm: (url: string) => void;
  onCancel: () => void;
  initialUrl?: string;
}

function LinkDialog({ onConfirm, onCancel, initialUrl = "" }: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onConfirm(url.trim());
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-label="Insert link"
    >
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[var(--paa-navy)] p-5 shadow-xl">
        <h3 className="mb-3 text-sm font-semibold text-[var(--paa-white)] font-[family-name:var(--font-barlow)]">
          Insert Link
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            autoFocus
            className="w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-3 py-2 text-sm text-[var(--paa-white)] placeholder:text-[var(--paa-gray)] focus:border-[var(--paa-accent)] focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-3 py-1.5 text-sm text-[var(--paa-gray)] hover:text-[var(--paa-white)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[var(--paa-accent)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--paa-accent-light)]"
            >
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something…",
  minHeight = "8rem",
}: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [pendingLinkUrl, setPendingLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Link is provided via the separate extension below for explicit config
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "text-[var(--paa-sky)] underline underline-offset-2",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate({ editor: e }) {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        "aria-label": "Rich text editor",
        "aria-multiline": "true",
        role: "textbox",
        spellcheck: "true",
      },
    },
  });

  // ---------------------------------------------------------------------------
  // Reactive active-state tracking via useEditorState (avoids stale closures)
  // ---------------------------------------------------------------------------

  const activeState = useEditorState({
    editor,
    selector: (snapshot) => {
      const e = snapshot.editor;
      if (!e) return null;
      return {
        bold: e.isActive("bold"),
        italic: e.isActive("italic"),
        h2: e.isActive("heading", { level: 2 }),
        h3: e.isActive("heading", { level: 3 }),
        bulletList: e.isActive("bulletList"),
        orderedList: e.isActive("orderedList"),
        link: e.isActive("link"),
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
        // Track emptiness for React-driven placeholder
        isEmpty: e.isEmpty,
      };
    },
  });

  // ---------------------------------------------------------------------------
  // Link handling
  // ---------------------------------------------------------------------------

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const existing = editor.getAttributes("link").href as string | undefined;
    setPendingLinkUrl(existing ?? "");
    setShowLinkDialog(true);
  }, [editor]);

  const applyLink = useCallback(
    (url: string) => {
      setShowLinkDialog(false);
      if (!editor) return;
      if (!url) {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    },
    [editor],
  );

  const removeLink = useCallback(() => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
  }, [editor]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!editor) return null;

  return (
    <>
      {showLinkDialog && (
        <LinkDialog
          initialUrl={pendingLinkUrl}
          onConfirm={applyLink}
          onCancel={() => setShowLinkDialog(false)}
        />
      )}

      <div className="overflow-hidden rounded-lg border border-white/10 bg-[var(--paa-midnight)] focus-within:border-[var(--paa-accent)]/60 transition-colors">
        {/* Toolbar */}
        <div
          role="toolbar"
          aria-label="Text formatting"
          className="flex flex-wrap items-center gap-0.5 border-b border-white/10 bg-[var(--paa-navy)] px-2 py-1.5"
        >
          {/* Text style */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={activeState?.bold}
            title="Bold (Ctrl+B)"
          >
            <Icons.Bold />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={activeState?.italic}
            title="Italic (Ctrl+I)"
          >
            <Icons.Italic />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Headings */}
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={activeState?.h2}
            title="Heading 2"
          >
            <Icons.H2 />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={activeState?.h3}
            title="Heading 3"
          >
            <Icons.H3 />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={activeState?.bulletList}
            title="Bullet list"
          >
            <Icons.BulletList />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={activeState?.orderedList}
            title="Ordered list"
          >
            <Icons.OrderedList />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Link */}
          <ToolbarButton
            onClick={activeState?.link ? removeLink : openLinkDialog}
            isActive={activeState?.link}
            title={activeState?.link ? "Remove link" : "Insert link"}
          >
            {activeState?.link ? <Icons.Unlink /> : <Icons.Link />}
          </ToolbarButton>

          <ToolbarDivider />

          {/* History */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            isDisabled={!activeState?.canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Icons.Undo />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            isDisabled={!activeState?.canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Icons.Redo />
          </ToolbarButton>
        </div>

        {/* Editor content area */}
        <div className="relative" style={{ minHeight }}>
          {/* React-driven placeholder (no @tiptap/extension-placeholder needed) */}
          {activeState?.isEmpty && (
            <p
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-2 text-sm text-[var(--paa-gray)] select-none"
            >
              {placeholder}
            </p>
          )}
          <EditorContent
            editor={editor}
            className="rte-content px-3 py-2 text-sm text-[var(--paa-white)]"
          />
        </div>
      </div>

      {/*
        Prose styles for the editor's generated markup. Scoped to .rte-content
        so they don't leak into the rest of the admin UI.
        TODO: Phase 2 — migrate these to globals.css if additional editor instances are added.
      */}
      <style>{`
        .rte-content .tiptap {
          outline: none;
          min-height: inherit;
        }
        .rte-content .tiptap p {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        .rte-content .tiptap p:last-child {
          margin-bottom: 0;
        }
        .rte-content .tiptap h2 {
          font-family: var(--font-barlow), "Arial Narrow", sans-serif;
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--paa-white);
          margin-top: 1rem;
          margin-bottom: 0.375rem;
          line-height: 1.3;
        }
        .rte-content .tiptap h3 {
          font-family: var(--font-barlow), "Arial Narrow", sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: var(--paa-sky);
          margin-top: 0.75rem;
          margin-bottom: 0.25rem;
          line-height: 1.3;
        }
        .rte-content .tiptap ul {
          list-style-type: disc;
          padding-left: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .rte-content .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .rte-content .tiptap li {
          margin-bottom: 0.2rem;
          line-height: 1.5;
        }
        .rte-content .tiptap a {
          color: var(--paa-sky);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .rte-content .tiptap a:hover {
          color: var(--paa-sky-light);
        }
        .rte-content .tiptap strong {
          font-weight: 700;
          color: var(--paa-white);
        }
        .rte-content .tiptap em {
          font-style: italic;
          color: var(--paa-sky-light);
        }
        /* Reduced-motion: disable transitions */
        @media (prefers-reduced-motion: reduce) {
          .rte-content .tiptap * {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
