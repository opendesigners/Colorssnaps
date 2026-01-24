import { useState } from 'react';
import { Globe, ArrowRight, Loader2 } from 'lucide-react';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }

    try {
      new URL(processedUrl);
      onSubmit(processedUrl);
    } catch {
      setError('Please enter a valid URL');
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shadow-sm p-8 md:p-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            <Globe className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Enter website URL or image link..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            disabled={isLoading}
            className="w-full pl-12 pr-5 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition-all duration-200 text-base"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Extracting colors...</span>
            </>
          ) : (
            <>
              <span>Extract Colors</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        <p className="text-xs text-zinc-400 text-center">
          Tip: For best results, enter a direct image URL (ending in .jpg, .png, etc.)
        </p>
      </form>
    </div>
  );
}
