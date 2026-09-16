import { icons } from 'lucide-react';

import type { LucideProps } from 'lucide-react';

/** Design uses kebab-case lucide names; convert to lucide's PascalCase export. */
function toPascal(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: string;
  size?: number;
}

export function Icon({ name, size = 18, strokeWidth = 2, ...rest }: IconProps) {
  const Cmp = icons[toPascal(name) as keyof typeof icons];
  if (!Cmp) return null;
  return <Cmp size={size} strokeWidth={strokeWidth} aria-hidden {...rest} />;
}
