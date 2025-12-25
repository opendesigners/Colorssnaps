// Color utility functions for Colors Snaps

export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  percentage?: number;
  name?: string;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function createColorInfo(r: number, g: number, b: number, percentage?: number): ColorInfo {
  return {
    hex: rgbToHex(r, g, b),
    rgb: { r, g, b },
    hsl: rgbToHsl(r, g, b),
    percentage,
  };
}

// Generate complementary color
export function getComplementary(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
}

// Generate analogous colors
export function getAnalogous(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [hex];
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const colors: string[] = [];
  
  [-30, 30].forEach(offset => {
    let h = (hsl.h + offset + 360) % 360;
    const color = hslToRgb(h, hsl.s, hsl.l);
    colors.push(rgbToHex(color.r, color.g, color.b));
  });
  
  return colors;
}

// Generate triadic colors
export function getTriadic(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [hex];
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const colors: string[] = [];
  
  [120, 240].forEach(offset => {
    let h = (hsl.h + offset) % 360;
    const color = hslToRgb(h, hsl.s, hsl.l);
    colors.push(rgbToHex(color.r, color.g, color.b));
  });
  
  return colors;
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export interface SavedPalette {
  id: string;
  name: string;
  colors: ColorInfo[];
  source: 'image' | 'url';
  sourceName: string;
  createdAt: string;
}

export function savePalette(palette: Omit<SavedPalette, 'id' | 'createdAt'>): SavedPalette {
  const savedPalettes = getSavedPalettes();
  const newPalette: SavedPalette = {
    ...palette,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  savedPalettes.unshift(newPalette);
  localStorage.setItem('colorsnaps_palettes', JSON.stringify(savedPalettes));
  return newPalette;
}

export function getSavedPalettes(): SavedPalette[] {
  const stored = localStorage.getItem('colorsnaps_palettes');
  return stored ? JSON.parse(stored) : [];
}

export function deletePalette(id: string): void {
  const palettes = getSavedPalettes().filter(p => p.id !== id);
  localStorage.setItem('colorsnaps_palettes', JSON.stringify(palettes));
}

export function exportAsJSON(colors: ColorInfo[]): string {
  return JSON.stringify(colors, null, 2);
}

export function exportAsCSS(colors: ColorInfo[]): string {
  return `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`;
}

export function exportAsFigma(colors: ColorInfo[]): string {
  const figmaColors = colors.map((c, i) => ({
    name: `Color ${i + 1}`,
    type: 'SOLID',
    color: {
      r: c.rgb.r / 255,
      g: c.rgb.g / 255,
      b: c.rgb.b / 255,
    },
  }));
  return JSON.stringify(figmaColors, null, 2);
}
