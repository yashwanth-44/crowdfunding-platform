import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Campaign, CampaignStats } from '../types/index';

// Queries
export const useCampaigns = (params?: { status?: string; category?: string; search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: () => apiClient.getCampaigns(params),
    select: (response) => response.data.data,
  });
};

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => apiClient.getCampaign(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
};

export const useCampaignStats = (id: string) => {
  return useQuery({
    queryKey: ['campaign-stats', id],
    queryFn: () => apiClient.getCampaignStats(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
};

// Mutations
export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateCampaign(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const usePublishCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.publishCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useCancelCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.cancelCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};
