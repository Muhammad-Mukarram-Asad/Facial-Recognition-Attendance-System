import type { ReactNode } from 'react';

/** Row of filters/actions that sits above a page's content. */
export function PageToolbar({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>{children}</div>
  );
}

export function ToolbarSpacer() {
  return <span style={{ flex: 1, minWidth: 0 }} />;
}
