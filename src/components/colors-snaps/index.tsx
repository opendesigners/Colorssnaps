import { useState, useCallback } from 'react';
import { Palette, Image, Globe, Moon, Sun, Sparkles, Sliders } from 'lucide-react';
import { useColorExtraction } from '@/hooks/use-color-extraction';
import { ColorInfo } from '@/lib/color-utils';
import { UploadZone } from './upload-zone';
import { UrlInput } from './url-input';
import { TailwindGenerator } from './tailwind-generator';
import { ColorCard } from './color-card';
import { ColorHarmony } from './color-harmony';
import { ExportDialog } from './export-dialog';
import { SavePaletteDialog } from './save-palette-dialog';
import { SavedPalettes } from './saved-palettes';
import { cn } from '@/lib/utils';

type InputMode = 'image' | 'url' | 'tailwind';

export function ColorsSnaps() {
  const [mode, setMode] = useState<InputMode>('image');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { colors, isLoading, error, extractFromImage, extractFromUrl, clearColors } = useColorExtraction();

  const handleFileSelect = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSourceName(file.name);
    await extractFromImage(file);
  }, [extractFromImage]);

  const handleUrlSubmit = useCallback(async (url: string) => {
    setSourceName(url);
    await extractFromUrl(url);
  }, [extractFromUrl]);

  const handleClearPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSourceName('');
    clearColors();
  }, [previewUrl, clearColors]);

  const handleSelectPalette = useCallback((selectedColors: ColorInfo[]) => {
    clearColors();
  }, [clearColors]);

  const handlePaletteSaved = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={cn('min-h-screen bg-background transition-colors duration-300')}>
      {/* Header - Minimal & Clean */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/20">
              <Palette className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">Colors Snaps</span>
          </div>
          
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl text-zinc-500 hover:text-foreground hover:bg-secondary transition-all duration-200"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        {/* Hero Section - Generous Whitespace */}
        <section className="text-center py-16 md:py-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Extract beautiful palettes instantly
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
            Discover Colors from
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Images & Websites
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Upload an image or enter a URL to instantly extract a beautiful color palette. 
            Perfect for designers, developers, and creatives.
          </p>
        </section>

        {/* Input Section - Clean Card Design */}
        <section className="max-w-2xl mx-auto mb-16 md:mb-24">
          {/* Mode Toggle - iOS Style Segmented Control */}
          <div className="flex p-1.5 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-2xl mb-8">
            <button
              onClick={() => setMode('image')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                mode === 'image'
                  ? 'bg-white dark:bg-zinc-900 text-foreground shadow-sm'
                  : 'text-zinc-500 hover:text-foreground'
              )}
            >
              <Image className="h-4 w-4" />
              <span>Image</span>
            </button>
            <button
              onClick={() => setMode('url')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                mode === 'url'
                  ? 'bg-white dark:bg-zinc-900 text-foreground shadow-sm'
                  : 'text-zinc-500 hover:text-foreground'
              )}
            >
              <Globe className="h-4 w-4" />
              <span>URL</span>
            </button>
            <button
              onClick={() => setMode('tailwind')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                mode === 'tailwind'
                  ? 'bg-white dark:bg-zinc-900 text-foreground shadow-sm'
                  : 'text-zinc-500 hover:text-foreground'
              )}
            >
              <Sliders className="h-4 w-4" />
              <span>Tailwind</span>
            </button>
          </div>

          {/* Input Component */}
          <div className="animate-fade-in">
            {mode === 'image' && (
              <UploadZone
                onFileSelect={handleFileSelect}
                previewUrl={previewUrl}
                onClearPreview={handleClearPreview}
                isLoading={isLoading}
              />
            )}
            {mode === 'url' && (
              <UrlInput onSubmit={handleUrlSubmit} isLoading={isLoading} />
            )}
            {mode === 'tailwind' && (
              <TailwindGenerator />
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </section>

        {/* Colors Display */}
        {colors.length > 0 && mode !== 'tailwind' && (
          <section className="space-y-8 pb-16 animate-fade-in">
            {/* Actions Bar */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                Extracted Palette
                <span className="text-zinc-400 dark:text-zinc-500 font-normal ml-2">({colors.length})</span>
              </h2>
              <div className="flex gap-3">
                <SavePaletteDialog
                  colors={colors}
                  source={mode}
                  sourceName={sourceName}
                  onSaved={handlePaletteSaved}
                />
                <ExportDialog colors={colors} />
              </div>
            </div>

            {/* Color Grid - Responsive */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {colors.map((color, index) => (
                <ColorCard key={index} color={color} index={index} />
              ))}
            </div>

            {/* Color Harmony */}
            {colors[0] && <ColorHarmony baseColor={colors[0]} />}
          </section>
        )}

        {/* Saved Palettes */}
        {mode !== 'tailwind' && (
          <section className="pb-16">
            <SavedPalettes
              onSelectPalette={handleSelectPalette}
              refreshTrigger={refreshTrigger}
            />
          </section>
        )}

        {/* Empty State */}
        {colors.length === 0 && !isLoading && mode !== 'tailwind' && (
          <section className="text-center py-16 md:py-24">
            <div className="inline-flex p-5 rounded-3xl bg-zinc-100 dark:bg-zinc-800/50 mb-6">
              <Palette className="h-10 w-10 text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              No colors extracted yet
            </h3>
            <p className="text-base text-zinc-500 max-w-md mx-auto leading-relaxed">
              Upload an image or enter a URL above to extract a beautiful color palette
            </p>
          </section>
        )}
      </main>

      {/* Footer - Minimal */}
      <footer className="border-t border-border/50 mt-8">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8">
          <p className="text-center text-sm text-zinc-400">
            Colors Snaps — Extract beautiful palettes from any image or website
          </p>
        </div>
      </footer>
    </div>
  );
}
