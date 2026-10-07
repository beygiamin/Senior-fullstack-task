import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestApi } from '../api/requestApi';
import type { CreateRequestPayload } from '../types/request';

export const requestQueryKeys = {
  all: ['requests'] as const,
};

export function useRequests() {
  return useQuery({
    queryKey: requestQueryKeys.all,
    queryFn: requestApi.getAll,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRequestPayload) => requestApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: requestQueryKeys.all });
    },
  });
}

export function useReviewRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: 'Approved' | 'Rejected' }) => {
      if (decision === 'Approved') {
        return requestApi.approve(id);
      }

      return requestApi.reject(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: requestQueryKeys.all });
    },
  });
}
