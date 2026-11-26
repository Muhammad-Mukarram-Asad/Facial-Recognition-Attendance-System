import Image from 'next/image';
import type { CSSProperties } from 'react';

/** Intrinsic size of public/logo.svg. Both axes must be set together so
 * Next.js doesn't warn that only one dimension was changed. */
const INTRINSIC_WIDTH = 211;
const INTRINSIC_HEIGHT = 60;

export function Logo({
  height,
  locked = false,
  surface = 'dark',
}: {
  height: number;
  /** Sign-in: no drag, selection, or pointer cursor on the mark. */
  locked?: boolean;
  /**
   * What the logo sits on. `dark` (sidebar, brand panel) uses the white
   * lettering. `light` (e.g. the mobile sign-in screen) uses the dark
   * lettering in the light theme and the white one in the dark theme.
   */
  surface?: 'dark' | 'light';
}) {
  const width = Math.round((height * INTRINSIC_WIDTH) / INTRINSIC_HEIGHT);
  const style = {
    width,
    height,
    flex: 'none',
    WebkitUserDrag: 'none',
    ...(locked ? { pointerEvents: 'none', userSelect: 'none' } : {}),
  } as CSSProperties;

  const mark = (src: string, className?: string) => (
    <Image
      src={src}
      alt="JBS logo"
      width={INTRINSIC_WIDTH}
      height={INTRINSIC_HEIGHT}
      loading="eager"
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
      className={className}
      style={style}
    />
  );

  if (surface === 'dark') return mark('/logo.svg', 'ft-logo');

  // Both are rendered; globals.css shows the one that matches the theme.
  return (
    <>
      {mark('/logo-dark.svg', 'ft-logo ft-logo--on-light-theme')}
      {mark('/logo.svg', 'ft-logo ft-logo--on-dark-theme')}
    </>
  );
}
