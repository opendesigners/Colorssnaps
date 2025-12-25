declare module 'chroma-js' {
  interface ChromaStatic {
    (color: string | number | number[]): Chroma;
    valid(color: string): boolean;
    scale(colors: string[]): Scale;
    mix(color1: string, color2: string, ratio?: number, mode?: string): Chroma;
  }

  interface Chroma {
    hex(): string;
    rgb(round?: boolean): [number, number, number];
    hsl(): [number, number, number];
    luminance(): number;
    luminance(lum: number): Chroma;
    darken(value?: number): Chroma;
    brighten(value?: number): Chroma;
    saturate(value?: number): Chroma;
    desaturate(value?: number): Chroma;
    set(channel: string, value: number | string): Chroma;
  }

  interface Scale {
    colors(n: number): string[];
    mode(m: string): Scale;
    domain(domain: number[]): Scale;
  }

  const chroma: ChromaStatic;
  export default chroma;
}
