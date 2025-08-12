import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  CompetitorData, 
  Comment, 
  Lead, 
  ClusterPainPoint 
} from '@/types';
import { 
  competitorsData, 
  commentsData, 
  leadsData, 
  painPointsData 
} from '@/data/mock-data';

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
  addCompetitor: (name: string) => void;
  removeCompetitor: (id: string) => void;
  selectCompetitor: (id: string | null) => void;
  togglePlatform: (platform: string) => void;
  toggleNotifications: () => void;
  toggleEmailDigests: () => void;
  updateLeadStatus: (id: string, status: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      competitors: competitorsData,
      comments: commentsData,
      leads: leadsData,
      painPoints: painPointsData,
      selectedCompetitor: null,
      platforms: ['Reddit', 'Twitter', 'G2'],
      notifications: true,
      emailDigests: true,

      // Actions
      addCompetitor: (name: string) =>
        set((state) => ({
          competitors: [
            ...state.competitors,
            {
              id: Date.now().toString(),
              name,
              totalMentions: 0,
              negativeSentiment: 0,
              trendingComplaints: [],
              mentionsOverTime: [],
              alternativesMentioned: [],
            },
          ],
        })),

      removeCompetitor: (id: string) =>
        set((state) => ({
          competitors: state.competitors.filter((comp) => comp.id !== id),
        })),

      selectCompetitor: (id: string | null) =>
        set({ selectedCompetitor: id }),

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

      updateLeadStatus: (id: string, status: string) =>
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id ? { ...lead, status } : lead
          ),
        })),
    }),
    {
      name: 'insight-miner-storage',
    }
  )
);