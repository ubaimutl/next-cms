"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  Command,
  EditorBubble,
  EditorBubbleItem,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
  HorizontalRule,
  Placeholder,
  StarterKit,
  createSuggestionItems,
  handleCommandNavigation,
  renderItems,
} from "novel";
import type { EditorInstance, JSONContent } from "novel";
import {
  adminKickerClass,
  adminSecondaryButtonClass,
} from "./components/ui";

type PostContentEditorProps = {
  editorKey: number;
  initialHtml?: string;
  onChange: (content: { html: string; text: string }) => void;
  placeholder?: string;
  variant?: "default" | "ghost";
};

const initialContent: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

const suggestionItems = createSuggestionItems([
  {
    title: "Text",
    description: "Start with a paragraph",
    icon: <span className="text-[0.72rem] font-medium">P</span>,
    searchTerms: ["paragraph", "text", "body"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: <span className="text-[0.72rem] font-medium">H1</span>,
    searchTerms: ["title", "heading", "hero"],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleHeading({ level: 1 })
        .run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: <span className="text-[0.72rem] font-medium">H2</span>,
    searchTerms: ["subtitle", "heading"],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleHeading({ level: 2 })
        .run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: <span className="text-[0.72rem] font-medium">H3</span>,
    searchTerms: ["heading", "section"],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleHeading({ level: 3 })
        .run(),
  },
  {
    title: "Bullet List",
    description: "List with bullets",
    icon: <span className="text-[0.72rem] font-medium">UL</span>,
    searchTerms: ["list", "bullet", "items"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Ordered List",
    description: "List with numbers",
    icon: <span className="text-[0.72rem] font-medium">OL</span>,
    searchTerms: ["list", "ordered", "numbered"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Quote",
    description: "Indented quotation block",
    icon: (
      <span className="text-[0.72rem] font-medium">&quot;</span>
    ),
    searchTerms: ["blockquote", "quote", "citation"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Divider",
    description: "Horizontal rule",
    icon: <span className="text-[0.72rem] font-medium">HR</span>,
    searchTerms: ["divider", "horizontal", "rule"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: "Code Block",
    description: "Block for code snippets",
    icon: (
      <span className="text-[0.72rem] font-medium">{`</>`}</span>
    ),
    searchTerms: ["code", "snippet", "pre", "block"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
]);

function getCurrentBlockElement(editor: EditorInstance) {
  const { $from } = editor.state.selection;

  if ($from.depth > 0) {
    const blockDom = editor.view.nodeDOM($from.before($from.depth));

    if (blockDom instanceof HTMLElement) {
      return blockDom;
    }
  }

  const domAtSelection = editor.view.domAtPos(editor.state.selection.from).node;
  const element =
    domAtSelection instanceof HTMLElement
      ? domAtSelection
      : domAtSelection.parentElement;

  return element?.closest(
    "p, h1, h2, h3, h4, h5, h6, li, blockquote, pre",
  ) as HTMLElement | null;
}

function BubbleAction({
  label,
  onClick,
}: {
  label: string;
  onClick: (editor: EditorInstance) => void;
}) {
  return (
    <EditorBubbleItem asChild onSelect={onClick}>
      <button
        type="button"
        className="inline-flex items-center rounded-full px-2 py-1 text-[0.76rem] font-medium text-white/62 transition hover:bg-white/[0.06] hover:text-white"
      >
        {label}
      </button>
    </EditorBubbleItem>
  );
}

export default function PostContentEditor({
  editorKey,
  initialHtml,
  onChange,
  placeholder = "Type '/' for blocks",
  variant = "default",
}: PostContentEditorProps) {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [editorInstance, setEditorInstance] = useState<EditorInstance | null>(null);
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [insertButtonTop, setInsertButtonTop] = useState(88);
  const [showInsertButton, setShowInsertButton] = useState(true);
  const isGhostVariant = variant === "ghost";
  const insertMenuRef = useRef<HTMLDivElement | null>(null);
  const editorViewportRef = useRef<HTMLDivElement | null>(null);

  const syncInsertButtonPosition = useCallback(
    (editor: EditorInstance | null) => {
      if (!isGhostVariant || !editor || !editorViewportRef.current) {
        return;
      }

      window.requestAnimationFrame(() => {
        if (!editorViewportRef.current) {
          return;
        }

        const container = editorViewportRef.current;
        const { selection } = editor.state;
        const { $from } = selection;
        const currentBlock = $from.parent;
        const isEmptyTextBlock =
          selection.empty &&
          currentBlock.isTextblock &&
          currentBlock.textContent.trim().length === 0;

        if (!isEmptyTextBlock) {
          setShowInsertMenu(false);
          setShowInsertButton(false);
          return;
        }

        const rect = container.getBoundingClientRect();
        const currentBlockElement = getCurrentBlockElement(editor);

        if (currentBlockElement) {
          const blockRect = currentBlockElement.getBoundingClientRect();
          const computedLineHeight = Number.parseFloat(
            window.getComputedStyle(currentBlockElement).lineHeight,
          );
          const effectiveLineHeight = Number.isFinite(computedLineHeight)
            ? Math.min(blockRect.height, Math.max(20, computedLineHeight))
            : blockRect.height;
          const nextTop =
            blockRect.top - rect.top + container.scrollTop + effectiveLineHeight / 2;

          setShowInsertButton(true);
          setInsertButtonTop(Math.max(14, nextTop));
          return;
        }

        const blockStart = $from.start();
        const coords = editor.view.coordsAtPos(blockStart);
        const lineHeight = Math.max(20, coords.bottom - coords.top);
        const nextTop =
          coords.top - rect.top + container.scrollTop + lineHeight / 2;

        setShowInsertButton(true);
        setInsertButtonTop(Math.max(14, nextTop));
      });
    },
    [isGhostVariant],
  );

  useEffect(() => {
    if (!showInsertMenu) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!insertMenuRef.current?.contains(event.target as Node)) {
        setShowInsertMenu(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowInsertMenu(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showInsertMenu]);

  useEffect(() => {
    if (!editorInstance || !isGhostVariant) {
      return;
    }

    syncInsertButtonPosition(editorInstance);

    const container = editorViewportRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => syncInsertButtonPosition(editorInstance);
    const handleResize = () => syncInsertButtonPosition(editorInstance);

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [editorInstance, isGhostVariant, syncInsertButtonPosition]);

  useEffect(() => {
    if (!isFocusMode) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsFocusMode(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isFocusMode]);

  return (
    <div
      className={`${isFocusMode
          ? "fixed inset-0 z-[120] flex items-center justify-center bg-[color-mix(in_srgb,var(--bg-color)_88%,transparent)] p-4 backdrop-blur-sm md:p-8"
          : isGhostVariant
            ? "relative mt-6 px-0 py-0"
            : "relative mt-4 px-0 py-0"
        }`}
    >
      <div
        className={`${isFocusMode
            ? "admin-panel relative flex h-[min(88vh,58rem)] w-full max-w-5xl flex-col overflow-hidden px-5 py-5 md:px-8 md:py-7"
            : isGhostVariant
              ? "relative pl-0 md:pl-0"
              : "relative border-t border-white/6 pt-6"
          }`}
      >
        {!isGhostVariant ? (
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className={adminKickerClass}>
              {isFocusMode ? "Focus mode" : "Editor"}
            </p>

            <button
              type="button"
              onClick={() => setIsFocusMode((current) => !current)}
              className={adminSecondaryButtonClass}
            >
              {isFocusMode ? "Exit focus" : "Focus mode"}
            </button>
          </div>
        ) : null}

        {isGhostVariant && !isFocusMode && showInsertButton ? (
          <div
            ref={insertMenuRef}
            className="absolute left-[-3.5rem] z-40 -translate-y-1/2"
            style={{ top: `${insertButtonTop}px` }}
          >
            <button
              type="button"
              onClick={() => {
                if (!editorInstance) {
                  return;
                }

                editorInstance.chain().focus().run();
                setShowInsertMenu((current) => !current);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/18 text-[1.65rem] leading-none text-white/56 transition hover:border-white/28 hover:text-white"
              aria-label="Open block menu"
            >
              +
            </button>

            {showInsertMenu ? (
              <div className="absolute top-1/2 left-14 z-40 w-72 -translate-y-1/2 overflow-hidden rounded-[0.95rem] border border-white/8 bg-[#151719] p-2 shadow-[0_20px_40px_rgba(0,0,0,0.24)]">
                {suggestionItems.map((item) => (
                  <button
                    key={`insert-${item.title}`}
                    type="button"
                    onClick={() => {
                      if (!editorInstance || !item.command) {
                        return;
                      }

                      editorInstance.chain().focus().run();
                      const { from, to } = editorInstance.state.selection;
                      item.command({
                        editor: editorInstance,
                        range: { from, to },
                      });
                      setShowInsertMenu(false);
                    }}
                    className="flex w-full items-start gap-3 rounded-[0.85rem] px-3 py-3 text-left transition hover:bg-white/[0.04]"
                  >
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-[0.85rem] border border-white/8 text-white/72">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[0.95rem] leading-none font-medium text-white/92">
                        {item.title}
                      </p>
                      <p className="mt-2 text-[0.82rem] leading-relaxed text-white/46">
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          ref={editorViewportRef}
          className={isFocusMode ? "min-h-0 flex-1 overflow-y-auto" : undefined}
        >
          <EditorRoot>
            <EditorContent
              className={
                isFocusMode
                  ? "post-content h-full"
                  : isGhostVariant
                    ? "post-content min-h-[52vh]"
                    : "post-content"
              }
              key={editorKey}
              initialContent={initialContent}
              immediatelyRender={false}
              extensions={[
                StarterKit,
                HorizontalRule,
                Placeholder.configure({
                  placeholder,
                }),
                Command.configure({
                  suggestion: {
                    items: ({ query }: { query: string }) => {
                      const normalizedQuery = query.toLowerCase().trim();

                      if (!normalizedQuery) {
                        return suggestionItems;
                      }

                      return suggestionItems.filter((item) => {
                        const label = `${item.title} ${item.description} ${item.searchTerms?.join(" ") ?? ""}`;
                        return label.toLowerCase().includes(normalizedQuery);
                      });
                    },
                    render: () => renderItems(),
                  },
                }),
              ]}
              editorProps={{
                attributes: {
                  class:
                    isGhostVariant
                      ? "novel-editor min-h-[52vh] text-[1.06rem] leading-relaxed outline-none md:text-[1.12rem]"
                      : "novel-editor min-h-[24rem] text-[1rem] leading-relaxed outline-none md:text-[1.02rem]",
                },
                handleDOMEvents: {
                  keydown: (_view, event) =>
                    handleCommandNavigation(event) ?? false,
                },
              }}
              onCreate={({ editor }) => {
                setEditorInstance(editor);
                syncInsertButtonPosition(editor);

                if (initialHtml) {
                  editor.commands.setContent(initialHtml);
                }

                onChange({
                  html: editor.getHTML(),
                  text: editor.getText(),
                });
              }}
              onUpdate={({ editor }) => {
                onChange({
                  html: editor.getHTML(),
                  text: editor.getText(),
                });
                syncInsertButtonPosition(editor);
              }}
              onSelectionUpdate={({ editor }) => {
                syncInsertButtonPosition(editor);
              }}
            >
              <EditorBubble
                tippyOptions={{
                  placement: "top",
                }}
                className="flex items-center gap-1 rounded-full border border-white/8 bg-[#151719] px-2 py-1 shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
              >
                <BubbleAction
                  label="B"
                  onClick={(editor) =>
                    editor.chain().focus().toggleBold().run()
                  }
                />
                <BubbleAction
                  label="I"
                  onClick={(editor) =>
                    editor.chain().focus().toggleItalic().run()
                  }
                />
                <BubbleAction
                  label="H2"
                  onClick={(editor) =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                />
                <BubbleAction
                  label="Quote"
                  onClick={(editor) =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                />
                <BubbleAction
                  label="Code"
                  onClick={(editor) =>
                    editor.chain().focus().toggleCode().run()
                  }
                />
              </EditorBubble>

              <EditorCommand className="z-50 max-h-80 w-72 overflow-y-auto rounded-[1rem] border border-white/8 bg-[#151719] p-2 shadow-[0_20px_40px_rgba(0,0,0,0.24)]">
                <EditorCommandEmpty className="px-3 py-2 text-[0.82rem] text-white/48">
                  No results
                </EditorCommandEmpty>
                <EditorCommandList>
                  {suggestionItems.map((item) => (
                    <EditorCommandItem
                      value={item.title}
                      key={item.title}
                      keywords={item.searchTerms}
                      onCommand={item.command!}
                      className="flex cursor-pointer items-start gap-3 rounded-[0.85rem] px-3 py-3 transition hover:bg-white/[0.04]"
                    >
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-[0.85rem] border border-white/8 text-white/72">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[0.95rem] leading-none font-medium text-white/92">
                          {item.title}
                        </p>
                        <p className="mt-2 text-[0.82rem] leading-relaxed text-white/46">
                          {item.description}
                        </p>
                      </div>
                    </EditorCommandItem>
                  ))}
                </EditorCommandList>
              </EditorCommand>
            </EditorContent>
          </EditorRoot>
        </div>
      </div>
    </div>
  );
}
