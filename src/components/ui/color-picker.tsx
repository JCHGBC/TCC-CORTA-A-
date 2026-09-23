"use client";

import { Check } from "lucide-react";
import { COLOR_OPTIONS } from "@/config/constants";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  error?: string;
}

export function ColorPicker({ value, onChange, label = "Cor", error }: ColorPickerProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-medium text-slate-700">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {COLOR_OPTIONS.map((color) => {
          const selected = color === value;
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              aria-label={`Cor ${color}`}
              aria-pressed={selected}
              className={cn(
                "flex size-8 items-center justify-center rounded-full ring-offset-2 transition-transform hover:scale-110",
                selected && "ring-2 ring-slate-900",
              )}
              style={{ backgroundColor: color }}
            >
              {selected && <Check className="size-4 text-white" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </fieldset>
  );
}
