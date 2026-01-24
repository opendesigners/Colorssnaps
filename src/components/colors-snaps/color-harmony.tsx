import { ColorInfo, getComplementary, getAnalogous, getTriadic } from '@/lib/color-utils';

interface ColorHarmonyProps {
  baseColor: ColorInfo;
}

export function ColorHarmony({ baseColor }: ColorHarmonyProps) {
  const complementary = getComplementary(baseColor.hex);
  const analogous = getAnalogous(baseColor.hex);
  const triadic = getTriadic(baseColor.hex);

  return (
    <div className="space-y-6 mt-12">
      <h3 className="text-xl font-semibold text-foreground">Color Harmonies</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/50 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">{title}</p>
      <div className="flex gap-2 h-16 rounded-xl overflow-hidden">
        {colors.map((color, i) => (
          <div
            key={i}
            className="flex-1 transition-transform duration-200 hover:scale-105 cursor-pointer"
            style={{ backgroundColor: color }}
            onClick={async () => {
              await navigator.clipboard.writeText(color);
            }}
            title={`Click to copy: ${color}`}
          />
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        {colors.map((color, i) => (
          <p key={i} className="flex-1 text-[10px] font-mono text-zinc-400 text-center">
            {color.toUpperCase()}
          </p>
        ))}
      </div>
    </div>
  );
}
