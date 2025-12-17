import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

// Queries
export const useLoans = (params?: { status?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['loans', params],
    queryFn: () => apiClient.getLoans(params),
    select: (response) => response.data.data,
  });
};

export const useLoan = (id: string) => {
  return useQuery({
    queryKey: ['loan', id],
    queryFn: () => apiClient.getLoan(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
};

export const useUserLoans = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['user-loans', page, limit],
    queryFn: () => apiClient.getUserLoans(page, limit),
    select: (response) => response.data.data,
  });
};

export const useLoanRepayments = (id: string) => {
  return useQuery({
    queryKey: ['loan-repayments', id],
    queryFn: () => apiClient.getLoanRepayments(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
};

export const useLoanFundings = (id: string) => {
  return useQuery({
    queryKey: ['loan-fundings', id],
    queryFn: () => apiClient.getLoanFundings(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
};

// Mutations
export const useCreateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.createLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['user-loans'] });
    },
  });
};

export const useApproveLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.approveLoan(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['loan', id] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
};

export const useFundLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      apiClient.fundLoan(id, { amount }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['loan', id] });
      queryClient.invalidateQueries({ queryKey: ['loan-fundings', id] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
};
