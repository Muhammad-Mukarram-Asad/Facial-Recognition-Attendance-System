import Image from 'next/image';
import type { CSSProperties } from 'react';

/** Intrinsic size of public/logo.svg. Both axes must be set together so
 * Next.js doesn't warn that only one dimension was changed. */
const INTRINSIC_WIDTH = 211;
const INTRINSIC_HEIGHT = 60;

export function Logo({
  height,
  locked = false,
}: {
  height: number;
  /** Sign-in: no drag, selection, or pointer cursor on the mark. */
  locked?: boolean;
}) {
  const width = Math.round((height * INTRINSIC_WIDTH) / INTRINSIC_HEIGHT);
  const style = {
    width,
    height,
    display: 'block',
    flex: 'none',
    WebkitUserDrag: 'none',
    ...(locked ? { pointerEvents: 'none', userSelect: 'none' } : {}),
  };

  return (
    <Image
      src="/logo.svg"
      alt="JBS logo"
      width={INTRINSIC_WIDTH}
      height={INTRINSIC_HEIGHT}
      loading="eager"
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
      style={style as CSSProperties}
    />
  );
}
