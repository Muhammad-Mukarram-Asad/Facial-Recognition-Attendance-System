'use client';

export interface SegmentOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  options: Array<SegmentOption | string>;
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  ariaLabel?: string;
}

function normalize(option: SegmentOption | string): SegmentOption {
  return typeof option === 'string' ? { value: option, label: option } : option;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  size = 'md',
  ariaLabel,
}: SegmentedControlProps) {
  const height = size === 'sm' ? 32 : 38;
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: 3,
        borderRadius: 'var(--radius-pill)',
        background: 'var(--surface-sunken)',
        whiteSpace: 'nowrap',
      }}
    >
      {options.map((raw) => {
        const option = normalize(raw);
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            style={{
              height,
              padding: size === 'sm' ? '0 12px' : '0 15px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              fontSize: size === 'sm' ? 12.5 : 13.5,
              fontWeight: 600,
              color: active ? 'var(--text-strong)' : 'var(--text-muted)',
              background: active ? 'var(--surface-card)' : 'transparent',
              boxShadow: active ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--duration-fast) var(--ease-out)',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
