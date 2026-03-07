"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompanyProfile {
  companyName: string;
  city: string;
  cityId: string;
  industry: string;
  employees: number;
  salaryBand: string;
  avgSalary: number;
}

interface CompanyState extends CompanyProfile {
  hasOnboarded: boolean;
  setProfile: (profile: Partial<CompanyProfile>) => void;
  setHasOnboarded: (v: boolean) => void;
  reset: () => void;
}

const defaults: CompanyProfile = {
  companyName: "",
  city: "Toronto",
  cityId: "toronto",
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
      setProfile: (profile) => set((s) => ({ ...s, ...profile })),
      setHasOnboarded: (hasOnboarded) => set({ hasOnboarded }),
      reset: () => set({ ...defaults, hasOnboarded: false }),
    }),
    { name: "winnipeg-relocation-company" }
  )
);
