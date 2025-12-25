import { ColorInfo, getComplementary, getAnalogous, getTriadic, getContrastColor } from '@/lib/color-utils';
import { cn } from '@/lib/utils';

interface ColorHarmonyProps {
  baseColor: ColorInfo;
}

export function ColorHarmony({ baseColor }: ColorHarmonyProps) {
  const complementary = getComplementary(baseColor.hex);
  const analogous = getAnalogous(baseColor.hex);
  const triadic = getTriadic(baseColor.hex);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Color Harmonies</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <HarmonyGroup
          title="Complementary"
          colors={[baseColor.hex, complementary]}
        />
        <HarmonyGroup
          title="Analogous"
          colors={[analogous[0], baseColor.hex, analogous[1]]}
        />
        <HarmonyGroup
          title="Triadic"
          colors={[baseColor.hex, ...triadic]}
        />
      </div>
    </div>
  );
}

interface HarmonyGroupProps {
  title: string;
  colors: string[];
}

function HarmonyGroup({ title, colors }: HarmonyGroupProps) {
  return (
    <div className="bg-card rounded-lg p-3 border border-border">
      <p className="text-xs font-medium text-muted-foreground mb-2">{title}</p>
      <div className="flex gap-1.5">
        {colors.map((color, i) => (
          <div
            key={i}
            className="flex-1 h-10 rounded-md shadow-sm transition-transform hover:scale-105 cursor-pointer"
            style={{ backgroundColor: color }}
            onClick={async () => {
              await navigator.clipboard.writeText(color);
            }}
            title={`Click to copy: ${color}`}
          />
        ))}
      </div>
    </div>
  );
}
