"use client";

import { Badge } from "@/components/ui/badge";
import { useRegion } from "@/contexts/RegionContext";
import RegionSelect from "@/components/RegionSelect";

export default function RegionIndicator() {
  const { region, regionLabel } = useRegion();

  return (
    <div className="relative z-10 mt-3 flex items-center gap-2 text-xs text-ink-muted">
      <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
      <span>{regionLabel}</span>
      <span className="text-ink-ghost">·</span>
      <RegionSelect />
    </div>
  );
}
