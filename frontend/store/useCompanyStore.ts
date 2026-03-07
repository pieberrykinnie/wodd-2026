"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompanyProfile {
  companyName: string;
  city: string;
  cityId: string;
  cityCoords: [number, number] | null;
  industry: string;
  employees: number;
  salaryBand: string;
  avgSalary: number;
}

interface CompanyState extends CompanyProfile {
  hasOnboarded: boolean;
  selectedZoneId: string | null;
  setProfile: (profile: Partial<CompanyProfile>) => void;
  setHasOnboarded: (v: boolean) => void;
  setSelectedZoneId: (id: string) => void;
  reset: () => void;
}

const defaults: CompanyProfile = {
  companyName: "",
  city: "Toronto",
  cityId: "toronto",
  cityCoords: null,
  industry: "",
  employees: 50,
  salaryBand: "$75K–$100K",
  avgSalary: 87500,
};

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      ...defaults,
      hasOnboarded: false,
      selectedZoneId: null,
      setProfile: (profile) => set((s) => ({ ...s, ...profile })),
      setHasOnboarded: (hasOnboarded) => set({ hasOnboarded }),
      setSelectedZoneId: (selectedZoneId) => set({ selectedZoneId }),
      reset: () => set({ ...defaults, hasOnboarded: false, selectedZoneId: null }),
    }),
    { name: "winnipeg-relocation-company" }
  )
);
