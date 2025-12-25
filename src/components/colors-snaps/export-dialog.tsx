import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Palette</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format selector */}
          <div className="flex gap-2">
            {(['css', 'json', 'figma'] as ExportFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  format === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="bg-muted rounded-lg p-4 max-h-64 overflow-auto">
            <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
              {getExportContent()}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            <Button size="sm" onClick={downloadFile}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
