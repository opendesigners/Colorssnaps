import { useState, useMemo } from 'react';
import { Copy, Check, Palette as PaletteIcon } from 'lucide-react';
import chroma from 'chroma-js';
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
    <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shadow-sm p-6 md:p-8 space-y-8">
      {/* Input Section */}
      <div className="space-y-5">
        <div className="flex gap-4">
          {/* Color Picker */}
          <div className="relative">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="w-14 h-12 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 cursor-pointer shadow-sm transition-all hover:scale-105"
              style={{ backgroundColor: baseColor }}
            />
          </div>

          {/* Hex Input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="#8b5cf6"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className={cn(
                'w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border font-mono text-base',
                !isValidColor && baseColor 
                  ? 'border-red-300 dark:border-red-800 focus:ring-red-500' 
                  : 'border-zinc-200 dark:border-zinc-700 focus:ring-zinc-500',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition-all'
              )}
            />
          </div>
        </div>

        {/* Color Name Input */}
        <div>
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">
            Color Name (for export)
          </label>
          <input
            type="text"
            placeholder="primary"
            value={colorName}
            onChange={(e) => setColorName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition-all text-base"
          />
        </div>

        {!isValidColor && baseColor && (
          <p className="text-sm text-red-500 dark:text-red-400">Please enter a valid color (hex, rgb, or color name)</p>
        )}
      </div>

      {/* Generated Scale */}
      {colorScale && (
        <div className="space-y-6 animate-fade-in">
          {/* Scale Preview */}
          <div className="rounded-2xl overflow-hidden">
            <div className="grid grid-cols-5 sm:grid-cols-10">
              {SHADE_KEYS.map((shade) => {
                const hex = colorScale[shade as unknown as keyof TailwindScale];
                const contrast = getContrastColor(hex);
                const isCopied = copiedShade === shade;

                return (
                  <button
                    key={shade}
                    onClick={() => copyShade(shade, hex)}
                    className="group relative transition-all duration-200 hover:scale-105 hover:z-10"
                  >
                    <div
                      className="h-20 sm:h-24 flex flex-col items-center justify-center p-1"
                      style={{ backgroundColor: hex }}
                    >
                      <span
                        className="text-xs font-semibold"
                        style={{ color: contrast }}
                      >
                        {shade}
                      </span>
                      <span
                        className="text-[9px] font-mono opacity-70 hidden sm:block mt-1"
                        style={{ color: contrast }}
                      >
                        {hex.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Copy indicator */}
                    <div
                      className={cn(
                        'absolute inset-0 flex items-center justify-center backdrop-blur-sm transition-opacity',
                        isCopied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      )}
                      style={{ backgroundColor: `${hex}dd` }}
                    >
                      {isCopied ? (
                        <Check className="h-5 w-5" style={{ color: contrast }} />
                      ) : (
                        <Copy className="h-4 w-4" style={{ color: contrast }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Section */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Export Color Scale</h3>
              <button
                onClick={copyAll}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  copiedAll 
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-600"
                )}
              >
                {copiedAll ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy All
                  </>
                )}
              </button>
            </div>

            {/* Format Selector */}
            <div className="flex gap-2 flex-wrap">
              {(['tailwind', 'css', 'scss', 'json'] as ExportFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                    exportFormat === format
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg shadow-zinc-500/20'
                      : 'bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-foreground border border-zinc-200 dark:border-zinc-600'
                  )}
                >
                  {format === 'tailwind' ? 'Tailwind' : format.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Code Preview */}
            <div className="bg-zinc-900 dark:bg-zinc-950 rounded-xl p-5 max-h-52 overflow-auto">
              <pre className="text-sm font-mono text-zinc-300 whitespace-pre-wrap">
                {getExportContent()}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!colorScale && (
        <div className="text-center py-12">
          <div className="inline-flex p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
            <PaletteIcon className="h-8 w-8 text-zinc-400" />
          </div>
          <p className="text-base text-zinc-500">
            Enter a valid color to generate your Tailwind scale
          </p>
        </div>
      )}
    </div>
  );
}
