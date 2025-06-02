import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { settlementService } from "@/api/services";
import type {
  CreateSettlementBody,
  Settlement,
  SettlementsListQuery,
} from "@/api/types";

export const useSettlementList = (q: SettlementsListQuery = {}) =>
  useQuery<Settlement[]>({
    queryKey: ["settlements", q],
    queryFn: () => settlementService.list(q),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });

export const useSettlementById = (id: string | undefined) =>
  useQuery<Settlement>({
    queryKey: ["settlements", id],
    queryFn: () => settlementService.get(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });

export const useSettlementMutations = () => {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: CreateSettlementBody) => settlementService.create(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["settlements"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => settlementService.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["settlements"] }),
  });

  return { create, remove };
};
