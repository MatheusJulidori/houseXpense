import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { householdService } from "@/api/services";
import type {
  CreateHouseholdBody,
  Household,
  HouseholdSummaryResponse,
  UpdateHouseholdBody,
} from "@/api/types";

/* ───────────── queries ───────────── */

export const useHouseholdList = () =>
  useQuery<Household[]>({
    queryKey: ["households"],
    queryFn: householdService.list,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

export const useHousehold = (id: string | undefined) =>
  useQuery<Household>({
    queryKey: ["households", id],
    queryFn: () => householdService.get(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });

export const useHouseholdSummary = (id: string | undefined) =>
  useQuery<HouseholdSummaryResponse>({
    queryKey: ["households", id, "summary"],
    queryFn: () => householdService.summary(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });

/* ──────────── mutations ──────────── */

export const useHouseholdMutations = () => {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: CreateHouseholdBody) => householdService.create(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["households"] }),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateHouseholdBody }) =>
      householdService.update(id, body),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: ["households"] });
      void qc.invalidateQueries({ queryKey: ["households", id] });
      void qc.invalidateQueries({ queryKey: ["households", id, "summary"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => householdService.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["households"] }),
  });

  return { create, update, remove };
};
