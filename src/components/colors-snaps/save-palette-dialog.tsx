import { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ColorInfo, savePalette, SavedPalette } from '@/lib/color-utils';

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
        <Button variant="outline" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Palette</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Color preview */}
          <div className="flex gap-1 h-12 rounded-lg overflow-hidden">
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
            <label className="text-sm font-medium text-foreground">
              Palette Name
            </label>
            <Input
              placeholder="My awesome palette"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Save button */}
          <Button onClick={handleSave} className="w-full" disabled={saved}>
            {saved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Palette
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
