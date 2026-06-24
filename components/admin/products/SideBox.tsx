import type { ReactNode } from 'react';

export function SideBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="wp-box">
      <h2>
        {title}
       
      </h2>
      {children}
    </div>
  );
}
