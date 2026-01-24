import { useState } from 'react';
import { Save, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ColorInfo, savePalette, SavedPalette } from '@/lib/color-utils';
import { cn } from '@/lib/utils';

interface SavePaletteDialogProps {
  colors: ColorInfo[];
  source: 'image' | 'url';
  sourceName: string;
  onSaved: (palette: SavedPalette) => void;
}

export function SavePaletteDialog({ colors, source, sourceName, onSaved }: SavePaletteDialogProps) {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const palette = savePalette({
      name: name || `Palette ${new Date().toLocaleDateString()}`,
      colors,
      source,
      sourceName,
    });
    setSaved(true);
    onSaved(palette);
    setTimeout(() => {
      setOpen(false);
      setSaved(false);
      setName('');
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-sm transition-all duration-200 shadow-lg shadow-zinc-500/20">
          <Save className="h-4 w-4" />
          Save
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl border-zinc-200/50 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Save Palette</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Color preview */}
          <div className="flex gap-1 h-14 rounded-2xl overflow-hidden">
            {colors.map((color, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Palette Name
            </label>
            <input
              placeholder="My awesome palette"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition-all text-base"
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saved}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-base transition-all duration-200",
              saved 
                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-lg shadow-zinc-500/20"
            )}
          >
            {saved ? (
              <>
                <Check className="h-5 w-5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Palette
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
