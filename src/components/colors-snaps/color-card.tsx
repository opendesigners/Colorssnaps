import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { ColorInfo, getContrastColor } from '@/lib/color-utils';
import { cn } from '@/lib/utils';

interface ColorCardProps {
  color: ColorInfo;
  index: number;
}

type ColorFormat = 'hex' | 'rgb' | 'hsl';

export function ColorCard({ color, index }: ColorCardProps) {
  const [copiedFormat, setCopiedFormat] = useState<ColorFormat | null>(null);
  const contrastColor = getContrastColor(color.hex);

  const copyToClipboard = async (format: ColorFormat) => {
    let value = '';
    switch (format) {
      case 'hex':
        value = color.hex;
        break;
      case 'rgb':
        value = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
        break;
      case 'hsl':
        value = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
        break;
    }

    await navigator.clipboard.writeText(value);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Color swatch */}
      <div
        className="h-28 md:h-36 w-full relative"
        style={{ backgroundColor: color.hex }}
      >
        {color.percentage && (
          <span
            className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm"
            style={{
              backgroundColor: `${contrastColor}15`,
              color: contrastColor,
            }}
          >
            {color.percentage}%
          </span>
        )}
        
        {/* Quick copy on hover */}
        <button
          onClick={() => copyToClipboard('hex')}
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
          )}
        >
          {copiedFormat === 'hex' ? (
            <div className="p-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-lg">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-lg">
              <Copy className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </div>
          )}
        </button>
      </div>

      {/* Color info */}
      <div className="p-4 space-y-3">
        {/* HEX - Primary */}
        <div>
          <p className="text-base font-semibold font-mono text-foreground tracking-tight">
            {color.hex.toUpperCase()}
          </p>
        </div>

        {/* RGB & HSL - Secondary */}
        <div className="space-y-1.5">
          <ColorValue
            label="RGB"
            value={`${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`}
            onCopy={() => copyToClipboard('rgb')}
            copied={copiedFormat === 'rgb'}
          />
          <ColorValue
            label="HSL"
            value={`${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%`}
            onCopy={() => copyToClipboard('hsl')}
            copied={copiedFormat === 'hsl'}
          />
        </div>
      </div>
    </div>
  );
}

interface ColorValueProps {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}

function ColorValue({ label, value, onCopy, copied }: ColorValueProps) {
  return (
    <div className="flex items-center justify-between gap-2 group/item">
      <div className="min-w-0 flex-1 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium w-7">
          {label}
        </span>
        <p className="text-xs font-mono truncate text-zinc-500 dark:text-zinc-400">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className={cn(
          "p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover/item:opacity-100",
          copied
            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 opacity-100"
            : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        )}
      >
        {copied ? (
          <Check className="h-3 w-3" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}
