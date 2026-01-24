import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ColorInfo, exportAsJSON, exportAsCSS, exportAsFigma } from '@/lib/color-utils';
import { cn } from '@/lib/utils';

interface ExportDialogProps {
  colors: ColorInfo[];
}

type ExportFormat = 'json' | 'css' | 'figma';

export function ExportDialog({ colors }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('css');
  const [copied, setCopied] = useState(false);

  const getExportContent = () => {
    switch (format) {
      case 'json':
        return exportAsJSON(colors);
      case 'css':
        return exportAsCSS(colors);
      case 'figma':
        return exportAsFigma(colors);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(getExportContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const content = getExportContent();
    const extension = format === 'css' ? 'css' : 'json';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium text-sm transition-all duration-200">
          <Download className="h-4 w-4" />
          Export
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-3xl border-zinc-200/50 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Export Palette</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Format selector */}
          <div className="flex gap-2">
            {(['css', 'json', 'figma'] as ExportFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                  format === f
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                )}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="bg-zinc-900 dark:bg-zinc-950 rounded-2xl p-5 max-h-64 overflow-auto">
            <pre className="text-sm font-mono text-zinc-300 whitespace-pre-wrap">
              {getExportContent()}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={copyToClipboard}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                copied 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              )}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={downloadFile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-sm hover:opacity-90 transition-all duration-200 shadow-lg shadow-purple-500/20"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
