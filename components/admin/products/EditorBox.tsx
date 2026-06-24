import type { ReactNode } from 'react';

export function EditorBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="classic-editor-box">
      <h2>{title}</h2>
      <div className="classic-toolbar">
        <button type="button">Add Media</button>
        <button type="button">b</button>
        <button type="button">i</button>
        <button type="button">link</button>
        <button type="button">b-quote</button>
        <button type="button">img</button>
        <button type="button">ul</button>
        <button type="button">ol</button>
        <button type="button">code</button>
        <span>Visual</span>
        <span>Code</span>
      </div>
      {children}
    </div>
  );
}
