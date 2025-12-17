import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

// Queries
export const useDonations = (campaignId: string) => {
  return useQuery({
    queryKey: ['donations', campaignId],
    queryFn: () => apiClient.getCampaignDonations(campaignId),
    select: (response) => response.data.data,
    enabled: !!campaignId,
  });
};

export const useUserDonations = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['user-donations', page, limit],
    queryFn: () => apiClient.getUserDonations(page, limit),
    select: (response) => response.data.data,
  });
};

export const useUserTotalDonated = () => {
  return useQuery({
    queryKey: ['user-total-donated'],
    queryFn: () => apiClient.getUserTotalDonated(),
    select: (response) => response.data.data,
  });
};

// Mutations
export const useCreateDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, data }: { campaignId: string; data: any }) =>
      apiClient.createDonation(campaignId, data),
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['donations', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-stats', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['user-donations'] });
      queryClient.invalidateQueries({ queryKey: ['user-total-donated'] });
    },
  });
};
