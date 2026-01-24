import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  onClearPreview: () => void;
  isLoading: boolean;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

export function UploadZone({ onFileSelect, previewUrl, onClearPreview, isLoading }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSelectFile = useCallback((file: File) => {
    setError(null);
    
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a JPG, PNG, SVG, or WebP image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSelectFile(file);
    }
  }, [validateAndSelectFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  }, [validateAndSelectFile]);

  if (previewUrl) {
    return (
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shadow-sm">
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-80 object-contain bg-zinc-50 dark:bg-zinc-900"
        />
        {!isLoading && (
          <button
            onClick={onClearPreview}
            className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-lg">
              <div className="h-5 w-5 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-foreground">Extracting colors...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer min-h-[320px] flex items-center justify-center',
          isDragging
            ? 'border-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 scale-[1.01]'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
        )}
      >
        <input
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="p-12 md:p-16 flex flex-col items-center justify-center text-center">
          <div className={cn(
            'p-5 rounded-2xl mb-6 transition-all duration-300',
            isDragging 
              ? 'bg-zinc-200 dark:bg-zinc-700' 
              : 'bg-zinc-100 dark:bg-zinc-800'
          )}>
            {isDragging ? (
              <Upload className="h-12 w-12 text-zinc-700 dark:text-zinc-300" />
            ) : (
              <ImageIcon className="h-12 w-12 text-zinc-400" />
            )}
          </div>
          
          <p className="text-lg font-semibold text-foreground mb-2">
            {isDragging ? 'Drop your image here' : 'Drag & drop an image'}
          </p>
          <p className="text-sm text-zinc-500">
            or click to browse
          </p>
          <p className="text-xs text-zinc-400 mt-3">
            Supports JPG, PNG, SVG, WebP up to 10MB
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
