import { initials as toInitials } from '@/shared/lib/format';

export interface AvatarProps {
  name: string;
  size?: number;
  radius?: number;
  /** Draws the face-detection corner brackets used in attendance tables. */
  brackets?: boolean;
  onClick?: () => void;
}

export function Avatar({ name, size = 38, radius, brackets = false, onClick }: AvatarProps) {
  const bracket = Math.max(6, Math.round(size * 0.19));
  return (
    <span
      onClick={onClick}
      style={{
        position: 'relative',
        width: size,
        height: size,
        flex: 'none',
        borderRadius: radius ?? Math.round(size * 0.29),
        background: 'var(--gradient-brand-soft)',
        border: '1px solid var(--border-default)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.max(10, Math.round(size * 0.33)),
        fontWeight: 700,
        color: 'var(--text-brand)',
        cursor: onClick ? 'pointer' : undefined,
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {toInitials(name)}
      {brackets && (
        <>
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 3,
              top: 3,
              width: bracket,
              height: bracket,
              borderLeft: '1.5px solid var(--brand-teal-500)',
              borderTop: '1.5px solid var(--brand-teal-500)',
            }}
          />
          <span
            aria-hidden
            style={{
              position: 'absolute',
              right: 3,
              bottom: 3,
              width: bracket,
              height: bracket,
              borderRight: '1.5px solid var(--brand-teal-500)',
              borderBottom: '1.5px solid var(--brand-teal-500)',
            }}
          />
        </>
      )}
    </span>
  );
}
