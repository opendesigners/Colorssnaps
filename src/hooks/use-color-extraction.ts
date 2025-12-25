import { useState, useCallback } from 'react';
import ColorThief from 'colorthief';
import { ColorInfo, createColorInfo } from '@/lib/color-utils';

interface UseColorExtractionResult {
  colors: ColorInfo[];
  isLoading: boolean;
  error: string | null;
  extractFromImage: (imageFile: File) => Promise<void>;
  extractFromUrl: (url: string) => Promise<void>;
  clearColors: () => void;
}

export function useColorExtraction(): UseColorExtractionResult {
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractFromImage = useCallback(async (imageFile: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      const imageUrl = URL.createObjectURL(imageFile);
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
      });

      const colorThief = new ColorThief();
      const palette = colorThief.getPalette(img, 8);
      
      if (!palette) {
        throw new Error('Failed to extract colors from image');
      }

      // Calculate approximate percentages based on color position
      const totalColors = palette.length;
      const extractedColors: ColorInfo[] = palette.map((rgb: number[], index: number) => {
        const percentage = Math.round((1 - (index / totalColors) * 0.5) * 100 / totalColors);
        return createColorInfo(rgb[0], rgb[1], rgb[2], percentage);
      });

      // Normalize percentages to sum to 100
      const totalPercentage = extractedColors.reduce((sum, c) => sum + (c.percentage || 0), 0);
      extractedColors.forEach(c => {
        if (c.percentage) {
          c.percentage = Math.round((c.percentage / totalPercentage) * 100);
        }
      });

      setColors(extractedColors);
      URL.revokeObjectURL(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract colors');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const extractFromUrl = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);

    // Helper function to check if URL is a direct image link
    const isImageUrl = (url: string): boolean => {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
      const urlLower = url.toLowerCase();
      return imageExtensions.some(ext => urlLower.includes(ext));
    };

    // Helper function to extract colors from an image element
    const extractColorsFromImage = (img: HTMLImageElement): ColorInfo[] => {
      const colorThief = new ColorThief();
      const palette = colorThief.getPalette(img, 8);
      
      if (!palette) {
        throw new Error('Failed to extract colors from image');
      }

      const totalColors = palette.length;
      const extractedColors: ColorInfo[] = palette.map((rgb: number[], index: number) => {
        const percentage = Math.round((1 - (index / totalColors) * 0.5) * 100 / totalColors);
        return createColorInfo(rgb[0], rgb[1], rgb[2], percentage);
      });

      // Normalize percentages to sum to 100
      const totalPercentage = extractedColors.reduce((sum, c) => sum + (c.percentage || 0), 0);
      extractedColors.forEach(c => {
        if (c.percentage) {
          c.percentage = Math.round((c.percentage / totalPercentage) * 100);
        }
      });

      return extractedColors;
    };

    // Helper function to load image via CORS proxy
    const loadImageWithProxy = async (imageUrl: string): Promise<HTMLImageElement> => {
      const corsProxies = [
        `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`,
      ];

      for (const proxyUrl of corsProxies) {
        try {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = proxyUrl;
          });

          return img;
        } catch {
          // Try next proxy
          continue;
        }
      }

      throw new Error('All CORS proxies failed');
    };

    try {
      // Method 1: If it's a direct image URL, try to load it via CORS proxy
      if (isImageUrl(url)) {
        try {
          const img = await loadImageWithProxy(url);
          const extractedColors = extractColorsFromImage(img);
          setColors(extractedColors);
          return;
        } catch {
          // Continue to other methods
        }
      }

      // Method 2: Use a screenshot service for website URLs
      // Using screenshotone.com API (free tier available)
      const screenshotUrl = `https://image.thum.io/get/width/1280/crop/800/noanimate/${encodeURIComponent(url)}`;
      
      try {
        const img = await loadImageWithProxy(screenshotUrl);
        const extractedColors = extractColorsFromImage(img);
        setColors(extractedColors);
        return;
      } catch {
        // Continue to fallback
      }

      // Method 3: Try direct fetch with CORS proxy for the page content and extract colors
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('image')) {
          // It's an image, convert to blob
          const blob = await response.blob();
          const file = new File([blob], 'image', { type: blob.type });
          await extractFromImage(file);
          return;
        }

        // It's HTML, try to extract colors from CSS
        const html = await response.text();
        const colorsFromCss = extractColorsFromHtml(html);
        
        if (colorsFromCss.length > 0) {
          setColors(colorsFromCss);
          return;
        }

        throw new Error('NO_COLORS_FOUND');
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.message === 'NO_COLORS_FOUND') {
          throw fetchError;
        }
        throw new Error('FETCH_FAILED');
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'NO_COLORS_FOUND') {
          setError('No colors could be extracted from this URL. Try a direct image link instead.');
        } else if (err.message === 'FETCH_FAILED') {
          setError('Could not access this URL. Make sure the URL is correct and publicly accessible.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to extract colors from URL. Try uploading an image directly.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [extractFromImage]);

  // Extract colors from HTML/CSS content
  const extractColorsFromHtml = (html: string): ColorInfo[] => {
    const colorPatterns = [
      // HEX colors
      /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/g,
      // RGB/RGBA colors
      /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g,
    ];

    const foundColors: Map<string, number> = new Map();

    // Extract HEX colors
    const hexMatches = html.match(colorPatterns[0]) || [];
    hexMatches.forEach(hex => {
      // Normalize to 6-character hex
      let normalizedHex = hex.toLowerCase();
      if (normalizedHex.length === 4) {
        normalizedHex = `#${normalizedHex[1]}${normalizedHex[1]}${normalizedHex[2]}${normalizedHex[2]}${normalizedHex[3]}${normalizedHex[3]}`;
      }
      // Skip common non-colors like white, black, transparent values
      if (!['#ffffff', '#000000', '#fff', '#000'].includes(normalizedHex)) {
        foundColors.set(normalizedHex, (foundColors.get(normalizedHex) || 0) + 1);
      }
    });

    // Extract RGB colors
    const rgbRegex = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g;
    let rgbMatch;
    while ((rgbMatch = rgbRegex.exec(html)) !== null) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      if (r <= 255 && g <= 255 && b <= 255) {
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        if (!['#ffffff', '#000000'].includes(hex)) {
          foundColors.set(hex, (foundColors.get(hex) || 0) + 1);
        }
      }
    }

    // Sort by frequency and take top 8
    const sortedColors = Array.from(foundColors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    if (sortedColors.length === 0) {
      return [];
    }

    const totalOccurrences = sortedColors.reduce((sum, [, count]) => sum + count, 0);

    return sortedColors.map(([hex, count]) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const percentage = Math.round((count / totalOccurrences) * 100);
      return createColorInfo(r, g, b, percentage);
    });
  };

  const clearColors = useCallback(() => {
    setColors([]);
    setError(null);
  }, []);

  return {
    colors,
    isLoading,
    error,
    extractFromImage,
    extractFromUrl,
    clearColors,
  };
}
