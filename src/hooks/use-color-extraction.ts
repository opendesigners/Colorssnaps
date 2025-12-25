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

    try {
      // Use a screenshot service to capture the website
      // For demo purposes, we'll use a public screenshot API
      const screenshotUrl = `https://api.apiflash.com/v1/urltoimage?access_key=demo&url=${encodeURIComponent(url)}&width=1280&height=800&format=jpeg`;
      
      // Try to fetch the screenshot
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => {
          // Fallback: generate colors based on URL analysis (mock for demo)
          reject(new Error('CORS_ERROR'));
        };
        img.src = screenshotUrl;
      });

      const colorThief = new ColorThief();
      const palette = colorThief.getPalette(img, 8);
      
      if (!palette) {
        throw new Error('Failed to extract colors from website');
      }

      const totalColors = palette.length;
      const extractedColors: ColorInfo[] = palette.map((rgb: number[], index: number) => {
        const percentage = Math.round((1 - (index / totalColors) * 0.5) * 100 / totalColors);
        return createColorInfo(rgb[0], rgb[1], rgb[2], percentage);
      });

      const totalPercentage = extractedColors.reduce((sum, c) => sum + (c.percentage || 0), 0);
      extractedColors.forEach(c => {
        if (c.percentage) {
          c.percentage = Math.round((c.percentage / totalPercentage) * 100);
        }
      });

      setColors(extractedColors);
    } catch (err) {
      if (err instanceof Error && err.message === 'CORS_ERROR') {
        // Fallback: Try loading the URL as an image directly (for image URLs)
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const file = new File([blob], 'image', { type: blob.type });
          await extractFromImage(file);
          return;
        } catch {
          setError('Unable to extract colors from this URL. Try uploading an image instead, or ensure the URL is accessible.');
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to extract colors from URL');
      }
    } finally {
      setIsLoading(false);
    }
  }, [extractFromImage]);

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
