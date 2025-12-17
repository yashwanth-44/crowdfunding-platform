import { create } from 'zustand';
import { Campaign } from '../types/index';

interface CampaignState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  isLoading: boolean;
  error: string | null;

  setCampaigns: (campaigns: Campaign[]) => void;
  setSelectedCampaign: (campaign: Campaign | null) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaigns: [],
  selectedCampaign: null,
  isLoading: false,
  error: null,

  setCampaigns: (campaigns) => set({ campaigns }),

  setSelectedCampaign: (campaign) => set({ selectedCampaign: campaign }),

  addCampaign: (campaign) =>
    set((state) => ({ campaigns: [campaign, ...state.campaigns] })),

  updateCampaign: (id, updates) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
}));
