"use client";

import type { RegionCode } from "@/contexts/RegionContext";
import { useRegion } from "@/contexts/RegionContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const REGION_OPTIONS: Array<{ code: RegionCode; label: string }> = [
  { code: "WC", label: "Western Canada" },
  { code: "EC", label: "Eastern Canada" },
];

type RegionSelectProps = {
  className?: string;
  triggerLabel?: string;
};

export default function RegionSelect({
  className = "",
  triggerLabel = "change",
}: RegionSelectProps) {
  const { region, setRegion } = useRegion();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`inline-flex items-center text-xs text-ink underline underline-offset-2 transition-opacity hover:opacity-70 focus-visible:outline-none ${className}`}
      >
        {triggerLabel}
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={8}>
        <DropdownMenuRadioGroup
          value={region}
          onValueChange={(value) => setRegion(value as RegionCode)}
        >
          {REGION_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.code} value={option.code}>
              <span className="flex w-full items-center justify-between gap-3">
                <span>{option.label}</span>
                {/* <span className="text-xs text-muted-foreground">{option.code}</span> */}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
