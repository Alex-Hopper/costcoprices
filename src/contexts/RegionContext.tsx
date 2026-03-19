"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type RegionCode = "WC" | "EC";

type RegionContextValue = {
  region: RegionCode;
  regionLabel: string;
  setRegion: (region: RegionCode) => void;
};

const RegionContext = createContext<RegionContextValue | undefined>(undefined);

function labelForRegion(region: RegionCode) {
  return region === "WC" ? "Western Canada" : "Eastern Canada";
}

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegion] = useState<RegionCode>("WC");

  useEffect(() => {
    const stored = window.localStorage.getItem("cp_region");
    if (stored === "WC" || stored === "EC") {
      setRegion(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("cp_region", region);
  }, [region]);

  const value = useMemo<RegionContextValue>(
    () => ({
      region,
      regionLabel: labelForRegion(region),
      setRegion,
    }),
    [region]
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error("useRegion must be used within a RegionProvider");
  }
  return context;
}
