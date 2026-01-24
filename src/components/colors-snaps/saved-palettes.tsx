import { useState, useEffect } from 'react';
import { Trash2, Image, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { SavedPalette, getSavedPalettes, deletePalette, ColorInfo } from '@/lib/color-utils';

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
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <h3 className="text-base font-semibold text-foreground">
          Saved Palettes
          <span className="text-zinc-400 font-normal ml-2">({palettes.length})</span>
        </h3>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-zinc-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-zinc-400" />
        )}
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-4">
          {palettes.map((palette) => (
            <div
              key={palette.id}
              className="group p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 hover:border-purple-300 dark:hover:border-purple-800 transition-all duration-200 cursor-pointer hover:shadow-sm"
              onClick={() => onSelectPalette(palette.colors)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-700">
                    {palette.source === 'image' ? (
                      <Image className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                    ) : (
                      <Globe className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                    {palette.name}
                  </span>
                </div>
                <button
                  className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200"
                  onClick={(e) => handleDelete(palette.id, e)}
                >
                  <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                </button>
              </div>

              {/* Color preview */}
              <div className="flex gap-1 h-10 rounded-xl overflow-hidden">
                {palette.colors.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 first:rounded-l-lg last:rounded-r-lg"
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>

              <p className="text-xs text-zinc-400 mt-3">
                {new Date(palette.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
