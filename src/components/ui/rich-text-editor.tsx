"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline font-medium hover:opacity-80 transition-opacity",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] max-h-[500px] overflow-y-auto px-3.5 py-3 text-sm focus:outline-none prose-content leading-relaxed select-text",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. initial fetch or form reset)
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="min-h-[220px] rounded-[var(--radius-md)] border border-border bg-surface p-3 text-sm text-muted-foreground animate-pulse">
        Loading editor…
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter link URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-col rounded-[var(--radius-md)] border border-border bg-surface overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-1.5 text-muted-foreground">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "flex size-8 items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-surface hover:text-foreground",
            editor.isActive("heading", { level: 2 }) && "bg-surface text-primary shadow-xs font-semibold"
          )}
          title="Heading 2"
        >
          <Heading2 className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            "flex size-8 items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-surface hover:text-foreground",
            editor.isActive("heading", { level: 3 }) && "bg-surface text-primary shadow-xs font-semibold"
          )}
          title="Heading 3"
        >
          <Heading3 className="size-4" />
        </button>

        <div className="mx-1 h-4 w-px bg-border" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "flex size-8 items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-surface hover:text-foreground",
            editor.isActive("bold") && "bg-surface text-primary shadow-xs font-semibold"
          )}
          title="Bold"
        >
          <Bold className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "flex size-8 items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-surface hover:text-foreground",
            editor.isActive("italic") && "bg-surface text-primary shadow-xs font-semibold"
          )}
          title="Italic"
        >
          <Italic className="size-4" />
        </button>

        <div className="mx-1 h-4 w-px bg-border" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "flex size-8 items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-surface hover:text-foreground",
            editor.isActive("bulletList") && "bg-surface text-primary shadow-xs font-semibold"
          )}
          title="Bullet List"
        >
          <List className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "flex size-8 items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-surface hover:text-foreground",
            editor.isActive("orderedList") && "bg-surface text-primary shadow-xs font-semibold"
          )}
          title="Numbered List"
        >
          <ListOrdered className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "flex size-8 items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-surface hover:text-foreground",
            editor.isActive("blockquote") && "bg-surface text-primary shadow-xs font-semibold"
          )}
          title="Quote"
        >
          <Quote className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(
            "flex size-8 items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-surface hover:text-foreground",
            editor.isActive("codeBlock") && "bg-surface text-primary shadow-xs font-semibold"
          )}
          title="Code block"
        >
          <Code className="size-4" />
        </button>

        <div className="mx-1 h-4 w-px bg-border" />

        <button
          type="button"
          onClick={setLink}
          className={cn(
            "flex size-8 items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-surface hover:text-foreground",
            editor.isActive("link") && "bg-surface text-primary shadow-xs font-semibold"
          )}
          title="Add / Edit Link"
        >
          <LinkIcon className="size-4" />
        </button>

        {editor.isActive("link") && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-surface hover:text-danger"
            title="Remove Link"
          >
            <Unlink className="size-4" />
          </button>
        )}

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-surface hover:text-foreground disabled:opacity-30"
            title="Undo"
          >
            <Undo className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-surface hover:text-foreground disabled:opacity-30"
            title="Redo"
          >
            <Redo className="size-4" />
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} />
    </div>
  );
}

