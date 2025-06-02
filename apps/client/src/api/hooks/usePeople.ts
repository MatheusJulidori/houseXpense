import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { peopleService } from "@/api/services";
import type {
  CreatePersonBody,
  PeopleDashboardQuery,
  PeopleListQuery,
  Person,
  PersonLedger,
  UpdatePersonBody,
} from "@/api/types";

/* ────────── queries ───────── */

export const usePeopleList = (q: PeopleListQuery = {}) =>
  useQuery<Person[]>({
    queryKey: ["people", q],
    queryFn: () => peopleService.list(q),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

export const usePeopleDashboard = (q: PeopleDashboardQuery) =>
  useQuery<PersonLedger[]>({
    queryKey: ["people", "dashboard", q.householdId],
    queryFn: () => peopleService.dashboard(q),
    enabled: Boolean(q.householdId),
    staleTime: 1000 * 60 * 2,
  });

export const usePersonById = (id: string | undefined) =>
  useQuery<Person>({
    queryKey: ["people", id],
    queryFn: () => peopleService.get(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });

/* ────────── mutations ───────── */

export const usePeopleMutations = () => {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: CreatePersonBody) => peopleService.create(body),
    onSuccess: (_, { householdId }) => {
      void qc.invalidateQueries({ queryKey: ["people"] });
      void qc.invalidateQueries({
        queryKey: ["people", "dashboard", householdId],
      });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePersonBody }) =>
      peopleService.update(id, body),
    onSuccess: (_, { id, body }) => {
      void qc.invalidateQueries({ queryKey: ["people"] });
      void qc.invalidateQueries({ queryKey: ["people", id] });
      if (body.householdId) {
        void qc.invalidateQueries({
          queryKey: ["people", "dashboard", body.householdId],
        });
      }
    },
  });

  const remove = useMutation({
    mutationFn: ({ id, settle }: { id: string; settle?: boolean }) =>
      peopleService.remove(id, settle),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: ["people"] });
      void qc.invalidateQueries({ queryKey: ["people", id] });
    },
  });

  return { create, update, remove };
};
