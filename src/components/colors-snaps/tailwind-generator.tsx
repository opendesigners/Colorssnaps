import { useState, useMemo } from 'react';
import { Copy, Check, Palette as PaletteIcon } from 'lucide-react';
import chroma from 'chroma-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TailwindScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

type ExportFormat = 'tailwind' | 'css' | 'scss' | 'json';

const SHADE_KEYS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;

export function TailwindGenerator() {
  const [baseColor, setBaseColor] = useState('#8b5cf6');
  const [colorName, setColorName] = useState('primary');
  const [copiedShade, setCopiedShade] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('tailwind');

  const isValidColor = useMemo(() => {
    try {
      chroma(baseColor);
      return true;
    } catch {
      return false;
    }
  }, [baseColor]);

  const colorScale = useMemo((): TailwindScale | null => {
    if (!isValidColor) return null;

    try {
      const base = chroma(baseColor);
      
      // Generate scale by adjusting luminance
      // 50 = lightest (~95% luminance), 900 = darkest (~10% luminance)
      const luminanceValues = {
        50: 0.95,
        100: 0.90,
        200: 0.80,
        300: 0.65,
        400: 0.50,
        500: 0.40,
        600: 0.30,
        700: 0.22,
        800: 0.14,
        900: 0.08,
      };

      const scale: TailwindScale = {} as TailwindScale;
      
      SHADE_KEYS.forEach((shade) => {
        const targetLuminance = luminanceValues[shade as unknown as keyof typeof luminanceValues];
        scale[shade as unknown as keyof TailwindScale] = base.luminance(targetLuminance).hex();
      });

      // Override 500 with the actual base color for consistency
      scale['500'] = base.hex();

      return scale;
    } catch {
      return null;
    }
  }, [baseColor, isValidColor]);

  const copyShade = async (shade: string, hex: string) => {
    await navigator.clipboard.writeText(hex);
    setCopiedShade(shade);
    setTimeout(() => setCopiedShade(null), 2000);
  };

  const getExportContent = () => {
    if (!colorScale) return '';

    const name = colorName || 'primary';

    switch (exportFormat) {
      case 'tailwind':
        return `colors: {
  ${name}: {
    50: '${colorScale['50']}',
    100: '${colorScale['100']}',
    200: '${colorScale['200']}',
    300: '${colorScale['300']}',
    400: '${colorScale['400']}',
    500: '${colorScale['500']}',
    600: '${colorScale['600']}',
    700: '${colorScale['700']}',
    800: '${colorScale['800']}',
    900: '${colorScale['900']}',
  }
}`;
      case 'css':
        return `:root {
  --${name}-50: ${colorScale['50']};
  --${name}-100: ${colorScale['100']};
  --${name}-200: ${colorScale['200']};
  --${name}-300: ${colorScale['300']};
  --${name}-400: ${colorScale['400']};
  --${name}-500: ${colorScale['500']};
  --${name}-600: ${colorScale['600']};
  --${name}-700: ${colorScale['700']};
  --${name}-800: ${colorScale['800']};
  --${name}-900: ${colorScale['900']};
}`;
      case 'scss':
        return `$${name}-50: ${colorScale['50']};
$${name}-100: ${colorScale['100']};
$${name}-200: ${colorScale['200']};
$${name}-300: ${colorScale['300']};
$${name}-400: ${colorScale['400']};
$${name}-500: ${colorScale['500']};
$${name}-600: ${colorScale['600']};
$${name}-700: ${colorScale['700']};
$${name}-800: ${colorScale['800']};
$${name}-900: ${colorScale['900']};`;
      case 'json':
        return JSON.stringify(
          {
            [name]: colorScale,
          },
          null,
          2
        );
    }
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(getExportContent());
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const getContrastColor = (hex: string): string => {
    try {
      return chroma(hex).luminance() > 0.5 ? '#000000' : '#ffffff';
    } catch {
      return '#000000';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div className="flex gap-3">
          {/* Color Picker */}
          <div className="relative">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="w-12 h-10 rounded-lg border border-border cursor-pointer shadow-sm"
              style={{ backgroundColor: baseColor }}
            />
          </div>

          {/* Hex Input */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="#8b5cf6"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className={cn(
                'font-mono',
                !isValidColor && baseColor && 'border-destructive focus-visible:ring-destructive'
              )}
            />
          </div>
        </div>

        {/* Color Name Input */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Color Name (for export)
          </label>
          <Input
            type="text"
            placeholder="primary"
            value={colorName}
            onChange={(e) => setColorName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          />
        </div>

        {!isValidColor && baseColor && (
          <p className="text-xs text-destructive">Please enter a valid color (hex, rgb, or color name)</p>
        )}
      </div>

      {/* Generated Scale */}
      {colorScale && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Scale Preview */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {SHADE_KEYS.map((shade) => {
              const hex = colorScale[shade as unknown as keyof TailwindScale];
              const contrast = getContrastColor(hex);
              const isCopied = copiedShade === shade;

              return (
                <button
                  key={shade}
                  onClick={() => copyShade(shade, hex)}
                  className="group relative rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-lg"
                >
                  <div
                    className="h-16 sm:h-20 flex flex-col items-center justify-center p-1"
                    style={{ backgroundColor: hex }}
                  >
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: contrast }}
                    >
                      {shade}
                    </span>
                    <span
                      className="text-[8px] sm:text-[10px] font-mono opacity-80 hidden sm:block"
                      style={{ color: contrast }}
                    >
                      {hex.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Copy indicator */}
                  <div
                    className={cn(
                      'absolute inset-0 flex items-center justify-center transition-opacity',
                      isCopied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )}
                    style={{ backgroundColor: `${hex}cc` }}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4" style={{ color: contrast }} />
                    ) : (
                      <Copy className="h-3 w-3" style={{ color: contrast }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Export Section */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Export Color Scale</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={copyAll}
                className="gap-2"
              >
                {copiedAll ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy All
                  </>
                )}
              </Button>
            </div>

            {/* Format Selector */}
            <div className="flex gap-2 flex-wrap">
              {(['tailwind', 'css', 'scss', 'json'] as ExportFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    exportFormat === format
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  {format === 'tailwind' ? 'Tailwind Config' : format.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Code Preview */}
            <div className="bg-muted rounded-lg p-4 max-h-48 overflow-auto">
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
                {getExportContent()}
              </pre>
            </div>
          </div>

          {/* Individual Shade Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {SHADE_KEYS.map((shade) => {
              const hex = colorScale[shade as unknown as keyof TailwindScale];
              const contrast = getContrastColor(hex);
              const isCopied = copiedShade === `card-${shade}`;

              return (
                <div
                  key={`card-${shade}`}
                  className="rounded-lg overflow-hidden border border-border"
                >
                  <div
                    className="h-12 flex items-center justify-center"
                    style={{ backgroundColor: hex }}
                  >
                    <span className="text-xs font-bold" style={{ color: contrast }}>
                      {shade}
                    </span>
                  </div>
                  <div className="bg-card p-2 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {hex.toUpperCase()}
                    </span>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(hex);
                        setCopiedShade(`card-${shade}`);
                        setTimeout(() => setCopiedShade(null), 2000);
                      }}
                      className="p-1 rounded hover:bg-muted transition-colors"
                    >
                      {isCopied ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!colorScale && (
        <div className="text-center py-8">
          <div className="inline-flex p-3 rounded-full bg-muted mb-3">
            <PaletteIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Enter a valid color to generate your Tailwind scale
          </p>
        </div>
      )}
    </div>
  );
}
