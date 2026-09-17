'use client';

import * as React from 'react';
import * as RechartsPrimitive from 'recharts';

const THEMES = { light: '', dark: '.dark' } as const;

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> });
};

type ChartContextProps = { config: ChartConfig };

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error('Chart components must be used within a <ChartContainer />');
  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={className}
        style={{ display: 'flex', flexDirection: 'column', aspectRatio: 16 / 9, width: '100%' }}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, cfg]) => cfg.theme || cfg.color);

  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ?? itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join('\n')}
}
`,
          )
          .join('\n'),
      }}
    />
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  color,
  nameKey,
  labelKey,
}: Partial<RechartsPrimitive.TooltipContentProps> & {
  className?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: 'line' | 'dot' | 'dashed';
  color?: string;
  nameKey?: string;
  labelKey?: string;
}) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) return null;

    const [item] = payload;
    const key = String(labelKey ?? item?.dataKey ?? item?.name ?? 'value');
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === 'string' ? (config[label as keyof typeof config]?.label ?? label) : itemConfig?.label;

    if (labelFormatter) {
      return <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{labelFormatter(value, payload)}</div>;
    }

    if (!value) return null;

    return <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{value}</div>;
  }, [label, labelFormatter, payload, hideLabel, labelKey, config]);

  if (!active || !payload?.length) return null;

  const nestLabel = payload.length === 1 && indicator !== 'dot';

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        minWidth: '9rem',
        gap: 6,
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)',
        background: 'var(--surface-card)',
        boxShadow: 'var(--shadow-md)',
        padding: '8px 10px',
        fontSize: 12.5,
      }}
    >
      {!nestLabel ? tooltipLabel : null}
      <div style={{ display: 'grid', gap: 6 }}>
        {payload.map((item, index) => {
          const key = String(nameKey ?? item.name ?? item.dataKey ?? 'value');
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color ?? item.payload?.fill ?? item.color;

          return (
            <div
              key={String(item.dataKey ?? index)}
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}
            >
              {!hideIndicator ? (
                <span
                  style={{
                    flexShrink: 0,
                    width: indicator === 'dot' ? 8 : 3,
                    height: indicator === 'dot' ? 8 : '100%',
                    minHeight: indicator === 'dashed' ? 14 : undefined,
                    borderRadius: indicator === 'dot' ? '50%' : 2,
                    background: indicator !== 'dashed' ? indicatorColor : undefined,
                    border: indicator === 'dashed' ? `1.5px dashed ${indicatorColor}` : undefined,
                  }}
                />
              ) : null}
              <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', gap: 12, lineHeight: 1.3 }}>
                <div style={{ display: 'grid', gap: 1 }}>
                  {nestLabel ? tooltipLabel : null}
                  <span style={{ color: 'var(--text-muted)' }}>{itemConfig?.label ?? item.name}</span>
                </div>
                {item.value !== undefined ? (
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-strong)' }}>
                    {item.value.toLocaleString()}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: Pick<RechartsPrimitive.DefaultLegendContentProps, 'payload' | 'verticalAlign'> & {
  className?: string;
  hideIcon?: boolean;
  nameKey?: string;
}) {
  const { config } = useChart();

  if (!payload?.length) return null;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        paddingTop: verticalAlign === 'top' ? 0 : 12,
        paddingBottom: verticalAlign === 'top' ? 12 : 0,
      }}
    >
      {payload.map((item) => {
        const key = String(nameKey ?? item.dataKey ?? 'value');
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}
          >
            {!hideIcon ? (
              <span
                style={{ width: 8, height: 8, borderRadius: 2, background: item.color }}
              />
            ) : null}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== 'object' || payload === null) return undefined;

  const payloadPayload =
    'payload' in payload && typeof (payload as Record<string, unknown>).payload === 'object' && (payload as Record<string, unknown>).payload !== null
      ? ((payload as Record<string, unknown>).payload as Record<string, unknown>)
      : undefined;

  let configLabelKey: string = key;

  if (key in (payload as Record<string, unknown>) && typeof (payload as Record<string, unknown>)[key] === 'string') {
    configLabelKey = (payload as Record<string, unknown>)[key] as string;
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key] === 'string') {
    configLabelKey = payloadPayload[key] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config];
}

export { ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent, useChart };
