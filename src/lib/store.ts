import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CompetitorData, Comment, Lead, ClusterPainPoint } from "@/types";

interface AppState {
  competitors: CompetitorData[];
  comments: Comment[];
  leads: Lead[];
  painPoints: ClusterPainPoint[];
  selectedCompetitor: string | null;
  platforms: string[];
  notifications: boolean;
  emailDigests: boolean;

  // Actions
  addCompetitor: (competitor: CompetitorData) => void;
  removeCompetitor: (id: string) => void;
  selectCompetitor: (id: string | null) => void;
  togglePlatform: (platform: string) => void;
  toggleNotifications: () => void;
  toggleEmailDigests: () => void;
  updateLeadStatus: (
    id: string,
    status: "new" | "contacted" | "responded"
  ) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      competitors: [],
      comments: [],
      leads: [],
      painPoints: [],
      selectedCompetitor: null,
      platforms: ["Reddit", "Twitter", "G2"],
      notifications: true,
      emailDigests: true,

      // Actions
      addCompetitor: (competitor: CompetitorData) =>
        set((state) => ({
          competitors: [...state.competitors, competitor],
        })),

      removeCompetitor: (id: string) =>
        set((state) => ({
          competitors: state.competitors.filter((comp) => comp.id !== id),
        })),

      selectCompetitor: (id: string | null) => set({ selectedCompetitor: id }),

      togglePlatform: (platform: string) =>
        set((state) => ({
          platforms: state.platforms.includes(platform)
            ? state.platforms.filter((p) => p !== platform)
            : [...state.platforms, platform],
        })),

      toggleNotifications: () =>
        set((state) => ({ notifications: !state.notifications })),

      toggleEmailDigests: () =>
        set((state) => ({ emailDigests: !state.emailDigests })),

      updateLeadStatus: (
        id: string,
        status: "new" | "contacted" | "responded"
      ) =>
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id ? { ...lead, status } : lead
          ),
        })),
    }),
    {
      name: "insight-miner-storage",
    }
  )
);
