import { useState, useEffect } from 'react';
import { Trash2, Image, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SavedPalette, getSavedPalettes, deletePalette, ColorInfo } from '@/lib/color-utils';
import { cn } from '@/lib/utils';

interface SavedPalettesProps {
  onSelectPalette: (colors: ColorInfo[]) => void;
  refreshTrigger?: number;
}

export function SavedPalettes({ onSelectPalette, refreshTrigger }: SavedPalettesProps) {
  const [palettes, setPalettes] = useState<SavedPalette[]>([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    setPalettes(getSavedPalettes());
  }, [refreshTrigger]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deletePalette(id);
    setPalettes(getSavedPalettes());
  };

  if (palettes.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <h3 className="text-sm font-semibold text-foreground">
          Saved Palettes ({palettes.length})
        </h3>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="p-4 pt-0 space-y-3">
          {palettes.map((palette) => (
            <div
              key={palette.id}
              className="group p-3 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => onSelectPalette(palette.colors)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {palette.source === 'image' ? (
                    <Image className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
                    {palette.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDelete(palette.id, e)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>

              {/* Color preview */}
              <div className="flex gap-0.5 h-6 rounded overflow-hidden">
                {palette.colors.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>

              <p className="text-[10px] text-muted-foreground mt-1.5">
                {new Date(palette.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
