import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { expenseService } from "@/api/services";
import type {
  CreateExpenseBody,
  Expense,
  ExpensesListQuery,
  UpdateExpenseBody,
} from "@/api/types";

export const useExpenseList = (q: ExpensesListQuery = {}) =>
  useQuery<Expense[]>({
    queryKey: ["expenses", q],
    queryFn: () => expenseService.list(q),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });

export const useExpenseById = (id: string | undefined) =>
  useQuery<Expense>({
    queryKey: ["expenses", id],
    queryFn: () => expenseService.get(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });

export const useExpenseMutations = () => {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: CreateExpenseBody) => expenseService.create(body),
    onSuccess: (_, { householdId }) => {
      void qc.invalidateQueries({ queryKey: ["expenses"] });
      if (householdId)
        void qc.invalidateQueries({
          queryKey: ["expenses", { householdId }],
        });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateExpenseBody }) =>
      expenseService.update(id, body),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: ["expenses"] });
      void qc.invalidateQueries({ queryKey: ["expenses", id] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => expenseService.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["expenses"] }),
  });

  return { create, update, remove };
};
