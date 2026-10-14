'use client';

import { ChangeEvent, KeyboardEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { TextSelection } from '@tiptap/pm/state';
import { canSplit } from '@tiptap/pm/transform';
import {
  Bold,
  Braces,
  Code2,
  Eraser,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Upload,
} from 'lucide-react';
import { LoadingIndicator } from '@/components/LoadingIndicator';

export interface NewsEditorProps {
  value: string;
  onChange: (value: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
  allowCodeBlock?: boolean;
}

type EditorMode = 'visual' | 'html';

function escapeAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function ToolbarButton({
  active = false,
  children,
  disabled = false,
  label,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={active ? 'is-active' : ''}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

export function NewsEditor({ value, onChange, onUploadImage, allowCodeBlock = true }: NewsEditorProps) {
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const sourceRef = useRef<HTMLTextAreaElement | null>(null);
  const visualInsertPositionRef = useRef<number | null>(null);
  const [mode, setMode] = useState<EditorMode>('visual');
  const [source, setSource] = useState(value);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        ...(allowCodeBlock ? {} : { code: false, codeBlock: false }),
      }),
      Image.configure({
        allowBase64: false,
        inline: false,
      }),
      Link.configure({
        autolink: true,
        defaultProtocol: 'https',
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor: currentEditor }) => {
      const nextValue = currentEditor.getHTML();
      setSource(nextValue);
      onChange(nextValue);
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (mode === 'html') {
      if (value !== source) setSource(value);
      return;
    }

    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
      setSource(value);
    }
  }, [editor, mode, source, value]);

  useEffect(() => {
    if (!isFullscreen) return;

    function closeFullscreen(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') setIsFullscreen(false);
    }

    window.addEventListener('keydown', closeFullscreen);
    return () => window.removeEventListener('keydown', closeFullscreen);
  }, [isFullscreen]);

  const wordCount = useMemo(() => {
    const plainText = value
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/&[a-z0-9#]+;/gi, ' ')
      .trim();

    return plainText ? plainText.split(/\s+/).length : 0;
  }, [value]);

  function isolateSelectedSoftBreakLine() {
    if (!editor) return;
    const { from, to, empty } = editor.state.selection;
    if (empty) return;

    const $from = editor.state.doc.resolve(from);
    const $to = editor.state.doc.resolve(to);
    if (!$from.sameParent($to) || !$from.parent.isTextblock) return;

    const blockStart = $from.start();
    const hardBreakPositions: number[] = [];
    $from.parent.descendants((node, position) => {
      if (node.type.name === 'hardBreak') hardBreakPositions.push(blockStart + position);
    });

    // If the selection crosses a soft break, the user intentionally selected
    // more than one visual line and the block format should apply to them all.
    if (hardBreakPositions.some((position) => position >= from && position < to)) return;

    const leadingBreak = hardBreakPositions.filter((position) => position < from).at(-1);
    const trailingBreak = hardBreakPositions.find((position) => position >= to);
    const boundaries = [leadingBreak, trailingBreak]
      .filter((position): position is number => position !== undefined)
      .sort((a, b) => b - a);

    if (!boundaries.length) return;

    const transaction = editor.state.tr;
    for (const boundary of boundaries) {
      const mappedBoundary = transaction.mapping.map(boundary);
      transaction.delete(mappedBoundary, mappedBoundary + 1);
      if (!canSplit(transaction.doc, mappedBoundary)) return;
      transaction.split(mappedBoundary);
    }

    const nextFrom = transaction.mapping.map(from, 1);
    const nextTo = Math.max(nextFrom, transaction.mapping.map(to, -1));
    transaction.setSelection(TextSelection.create(transaction.doc, nextFrom, nextTo));
    editor.view.dispatch(transaction);
  }

  function setParagraph() {
    if (!editor) return;
    isolateSelectedSoftBreakLine();
    editor.chain().focus().setParagraph().run();
  }

  function toggleHeading(level: 1 | 2 | 3) {
    if (!editor) return;
    isolateSelectedSoftBreakLine();
    editor.chain().focus().toggleHeading({ level }).run();
  }

  function switchMode(nextMode: EditorMode) {
    if (!editor || nextMode === mode) return;

    if (nextMode === 'html') {
      const currentHtml = editor.getHTML();
      setSource(currentHtml);
      onChange(currentHtml);
      setMode('html');
      window.requestAnimationFrame(() => sourceRef.current?.focus());
      return;
    }

    editor.commands.setContent(source, { emitUpdate: false });
    const normalizedHtml = editor.getHTML();
    setSource(normalizedHtml);
    onChange(normalizedHtml);
    setMode('visual');
    window.requestAnimationFrame(() => editor.commands.focus());
  }

  function updateSource(nextValue: string, selectionStart?: number, selectionEnd?: number) {
    setSource(nextValue);
    onChange(nextValue);

    if (selectionStart === undefined) return;
    window.requestAnimationFrame(() => {
      sourceRef.current?.focus();
      sourceRef.current?.setSelectionRange(selectionStart, selectionEnd ?? selectionStart);
    });
  }

  function insertIntoSource(markup: string) {
    const textarea = sourceRef.current;
    const start = textarea?.selectionStart ?? source.length;
    const end = textarea?.selectionEnd ?? start;
    const nextValue = `${source.slice(0, start)}${markup}${source.slice(end)}`;
    const cursor = start + markup.length;
    updateSource(nextValue, cursor);
  }

  function wrapSourceSelection(openTag: string, closeTag: string, fallback = '') {
    const textarea = sourceRef.current;
    const start = textarea?.selectionStart ?? source.length;
    const end = textarea?.selectionEnd ?? start;
    const selected = source.slice(start, end) || fallback;
    const replacement = `${openTag}${selected}${closeTag}`;
    const nextValue = `${source.slice(0, start)}${replacement}${source.slice(end)}`;
    const selectionStart = start + openTag.length;
    const selectionEnd = selectionStart + selected.length;
    updateSource(nextValue, selectionStart, selectionEnd);
  }

  function handleSourceKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    insertIntoSource('  ');
  }

  function openMediaLibrary() {
    if (!onUploadImage || uploading) return;
    visualInsertPositionRef.current = mode === 'visual' && editor ? editor.state.selection.from : null;
    uploadInputRef.current?.click();
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file || !onUploadImage) return;

    setUploading(true);
    setUploadError('');
    try {
      const url = await onUploadImage(file);
      const safeUrl = escapeAttribute(url);

      if (mode === 'html') {
        insertIntoSource(`<figure><img src="${safeUrl}" alt="${escapeAttribute(file.name)}"></figure>`);
      } else if (editor) {
        const insertionPosition = visualInsertPositionRef.current;
        const chain = editor.chain().focus();
        if (insertionPosition !== null) chain.setTextSelection(insertionPosition);
        chain.setImage({ src: url, alt: file.name }).run();
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'The image could not be uploaded.');
    } finally {
      setUploading(false);
      visualInsertPositionRef.current = null;
      event.currentTarget.value = '';
    }
  }

  function addLink() {
    const previousUrl = editor?.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter the link URL:', previousUrl || 'https://');
    if (url === null || !editor) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }

  function addImageUrl() {
    const url = window.prompt('Enter the image URL:', 'https://');
    if (!url?.trim()) return;

    if (mode === 'html') {
      insertIntoSource(`<figure><img src="${escapeAttribute(url.trim())}" alt=""></figure>`);
    } else {
      editor?.chain().focus().setImage({ src: url.trim(), alt: '' }).run();
    }
  }

  function addSourceLink() {
    const url = window.prompt('Enter the link URL:', 'https://');
    if (!url?.trim()) return;
    wrapSourceSelection(`<a href="${escapeAttribute(url.trim())}">`, '</a>', 'link text');
  }

  function wrapSourceList(tag: 'ul' | 'ol') {
    const textarea = sourceRef.current;
    const start = textarea?.selectionStart ?? source.length;
    const end = textarea?.selectionEnd ?? start;
    const selected = source.slice(start, end) || 'List item';
    const items = selected
      .split(/\r?\n/)
      .filter((line) => line.trim())
      .map((line) => `  <li>${line.trim()}</li>`)
      .join('\n');
    const replacement = `<${tag}>\n${items}\n</${tag}>`;
    const nextValue = `${source.slice(0, start)}${replacement}${source.slice(end)}`;
    updateSource(nextValue, start, start + replacement.length);
  }

  if (!editor) {
    return <LoadingIndicator compact label="Loading editor..." />;
  }

  return (
    <div className={`news-editor ${isFullscreen ? 'news-editor-fullscreen' : ''}`}>
      <div className="news-editor-head">
        <div className="news-editor-media-actions">
          {onUploadImage ? (
            <button disabled={uploading} onClick={openMediaLibrary} type="button">
              {uploading ? <span className="news-editor-spinner" aria-hidden="true" /> : <Upload size={16} />}
              {uploading ? 'Uploading...' : 'Add media'}
            </button>
          ) : null}
          <button onClick={addImageUrl} type="button">
            <ImageIcon size={16} />
            Image URL
          </button>
        </div>

        <div className="news-editor-view-actions">
          <div className="news-editor-tabs" aria-label="Editor mode">
            <button
              aria-pressed={mode === 'visual'}
              className={mode === 'visual' ? 'is-active' : ''}
              onClick={() => switchMode('visual')}
              type="button"
            >
              Visual
            </button>
            <button
              aria-pressed={mode === 'html'}
              className={mode === 'html' ? 'is-active' : ''}
              onClick={() => switchMode('html')}
              title="Edit HTML source"
              type="button"
            >
              Code
            </button>
          </div>
          <button
            aria-label={isFullscreen ? 'Exit fullscreen editor' : 'Open fullscreen editor'}
            className="news-editor-expand"
            onClick={() => setIsFullscreen((current) => !current)}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            type="button"
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </div>

      {mode === 'visual' ? (
        <div className="news-editor-toolbar" role="toolbar" aria-label="Text formatting">
          <ToolbarButton active={editor.isActive('bold')} label="Bold" onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('italic')} label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('underline')} label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <Underline size={16} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('strike')} label="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough size={16} />
          </ToolbarButton>

          <span className="separator" aria-hidden="true" />

          <ToolbarButton active={editor.isActive('paragraph')} label="Paragraph" onClick={setParagraph}>
            P
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('heading', { level: 1 })} label="Heading 1" onClick={() => toggleHeading(1)}>
            H1
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('heading', { level: 2 })} label="Heading 2" onClick={() => toggleHeading(2)}>
            H2
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('heading', { level: 3 })} label="Heading 3" onClick={() => toggleHeading(3)}>
            H3
          </ToolbarButton>

          <span className="separator" aria-hidden="true" />

          <ToolbarButton active={editor.isActive('bulletList')} label="Bulleted list" onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List size={17} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('orderedList')} label="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={17} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive('blockquote')} label="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote size={16} />
          </ToolbarButton>
          <ToolbarButton label="Horizontal line" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus size={17} />
          </ToolbarButton>

          <span className="separator" aria-hidden="true" />

          <ToolbarButton active={editor.isActive('link')} label="Add or edit link" onClick={addLink}>
            <Link2 size={16} />
          </ToolbarButton>
          {allowCodeBlock ? (
            <>
              <ToolbarButton active={editor.isActive('code')} label="Inline code" onClick={() => editor.chain().focus().toggleCode().run()}>
                <Braces size={16} />
              </ToolbarButton>
              <ToolbarButton active={editor.isActive('codeBlock')} label="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                <Code2 size={16} />
              </ToolbarButton>
            </>
          ) : null}
          <ToolbarButton label="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
            <Eraser size={16} />
          </ToolbarButton>

          <span className="separator" aria-hidden="true" />

          <ToolbarButton disabled={!editor.can().chain().focus().undo().run()} label="Undo" onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 size={16} />
          </ToolbarButton>
          <ToolbarButton disabled={!editor.can().chain().focus().redo().run()} label="Redo" onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 size={16} />
          </ToolbarButton>
        </div>
      ) : (
        <div className="news-editor-toolbar news-editor-quicktags" role="toolbar" aria-label="HTML quick tags">
          <ToolbarButton label="Bold tag" onClick={() => wrapSourceSelection('<strong>', '</strong>', 'bold text')}>b</ToolbarButton>
          <ToolbarButton label="Italic tag" onClick={() => wrapSourceSelection('<em>', '</em>', 'italic text')}>i</ToolbarButton>
          <ToolbarButton label="Link tag" onClick={addSourceLink}>link</ToolbarButton>
          <ToolbarButton label="Blockquote tag" onClick={() => wrapSourceSelection('<blockquote>', '</blockquote>', 'Quote')}>b-quote</ToolbarButton>
          <ToolbarButton label="Deleted text tag" onClick={() => wrapSourceSelection('<del>', '</del>', 'deleted text')}>del</ToolbarButton>
          <ToolbarButton label="Inserted text tag" onClick={() => wrapSourceSelection('<ins>', '</ins>', 'inserted text')}>ins</ToolbarButton>
          <ToolbarButton label="Image tag" onClick={addImageUrl}>img</ToolbarButton>
          <ToolbarButton label="Unordered list tag" onClick={() => wrapSourceList('ul')}>ul</ToolbarButton>
          <ToolbarButton label="Ordered list tag" onClick={() => wrapSourceList('ol')}>ol</ToolbarButton>
          <ToolbarButton label="List item tag" onClick={() => wrapSourceSelection('<li>', '</li>', 'List item')}>li</ToolbarButton>
          <ToolbarButton label="Inline code tag" onClick={() => wrapSourceSelection('<code>', '</code>', 'code')}>code</ToolbarButton>
          <ToolbarButton label="Code block tag" onClick={() => wrapSourceSelection('<pre><code>', '</code></pre>', 'code block')}>pre</ToolbarButton>
          <ToolbarButton label="Paragraph tag" onClick={() => wrapSourceSelection('<p>', '</p>', 'Paragraph')}>p</ToolbarButton>
          <ToolbarButton label="Heading tag" onClick={() => wrapSourceSelection('<h2>', '</h2>', 'Heading')}>h2</ToolbarButton>
          <ToolbarButton label="Horizontal rule tag" onClick={() => insertIntoSource('<hr>')}>hr</ToolbarButton>
        </div>
      )}

      {mode === 'visual' ? (
        <EditorContent editor={editor} className="news-editor-content" />
      ) : (
        <textarea
          aria-label="Article HTML source"
          className="news-editor-source"
          onChange={(event) => updateSource(event.target.value)}
          onKeyDown={handleSourceKeyDown}
          placeholder={'<h2>Your heading</h2>\n<p>Write or paste your article HTML here.</p>'}
          ref={sourceRef}
          spellCheck={false}
          value={source}
        />
      )}

      <div className="news-editor-status">
        <span>
          {uploadError ||
            (mode === 'html'
              ? 'HTML is saved directly; Visual mode may normalize advanced tags'
              : 'Images are inserted at your cursor')}
        </span>
        <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
      </div>

      {onUploadImage ? <input ref={uploadInputRef} type="file" accept="image/*" onChange={uploadImage} hidden /> : null}
    </div>
  );
}
