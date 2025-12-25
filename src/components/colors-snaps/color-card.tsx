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
      className="group relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Color swatch */}
      <div
        className="h-32 sm:h-40 w-full relative"
        style={{ backgroundColor: color.hex }}
      >
        {color.percentage && (
          <span
            className="absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${contrastColor}20`,
              color: contrastColor,
            }}
          >
            {color.percentage}%
          </span>
        )}
      </div>

      {/* Color info */}
      <div className="bg-card p-3 space-y-2">
        {/* HEX */}
        <ColorValue
          label="HEX"
          value={color.hex.toUpperCase()}
          onCopy={() => copyToClipboard('hex')}
          copied={copiedFormat === 'hex'}
        />

        {/* RGB */}
        <ColorValue
          label="RGB"
          value={`${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`}
          onCopy={() => copyToClipboard('rgb')}
          copied={copiedFormat === 'rgb'}
        />

        {/* HSL */}
        <ColorValue
          label="HSL"
          value={`${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%`}
          onCopy={() => copyToClipboard('hsl')}
          copied={copiedFormat === 'hsl'}
        />
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
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0 flex-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          {label}
        </span>
        <p className="text-xs font-mono truncate text-foreground">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          copied
            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
