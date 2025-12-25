import { useState, useCallback } from 'react';
import { Palette, Image, Globe, Moon, Sun, Sparkles, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useColorExtraction } from '@/hooks/use-color-extraction';
import { ColorInfo, SavedPalette } from '@/lib/color-utils';
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
    // This will display colors from a saved palette
    clearColors();
    // We need to update the colors state - for now we'll just scroll to palette section
  }, [clearColors]);

  const handlePaletteSaved = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={cn('min-h-screen bg-background transition-colors')}>
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500">
              <Palette className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">Colors Snaps</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Extract beautiful palettes instantly
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Discover Colors from
            <br />
            <span className="bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Images, Websites & Generate Scales
            </span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Upload an image or enter a URL to instantly extract a beautiful color palette. 
            Perfect for designers, developers, and creatives.
          </p>
        </section>

        {/* Input Section */}
        <section className="max-w-xl mx-auto mb-12">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg mb-6">
            <button
              onClick={() => setMode('image')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-all',
                mode === 'image'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Image</span>
            </button>
            <button
              onClick={() => setMode('url')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-all',
                mode === 'url'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">URL</span>
            </button>
            <button
              onClick={() => setMode('tailwind')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-all',
                mode === 'tailwind'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Sliders className="h-4 w-4" />
              <span className="hidden sm:inline">Tailwind</span>
            </button>
          </div>

          {/* Input Component */}
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

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </section>

        {/* Colors Display */}
        {colors.length > 0 && mode !== 'tailwind' && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Actions Bar */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Extracted Palette ({colors.length} colors)
              </h2>
              <div className="flex gap-2">
                <SavePaletteDialog
                  colors={colors}
                  source={mode}
                  sourceName={sourceName}
                  onSaved={handlePaletteSaved}
                />
                <ExportDialog colors={colors} />
              </div>
            </div>

            {/* Color Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
          <section className="mt-12">
            <SavedPalettes
              onSelectPalette={handleSelectPalette}
              refreshTrigger={refreshTrigger}
            />
          </section>
        )}

        {/* Empty State */}
        {colors.length === 0 && !isLoading && mode !== 'tailwind' && (
          <section className="text-center py-12">
            <div className="inline-flex p-4 rounded-full bg-muted mb-4">
              <Palette className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No colors extracted yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Upload an image or enter a URL above to extract a beautiful color palette
            </p>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Colors Snaps — Extract beautiful palettes from any image or website
          </p>
        </div>
      </footer>
    </div>
  );
}
