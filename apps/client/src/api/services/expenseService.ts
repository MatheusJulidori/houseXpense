import apiClient from "@/api/client";
import { API_ROUTES } from "@/api/config";
import type {
  CreateExpenseBody,
  Expense,
  ExpensesListQuery,
  UpdateExpenseBody,
} from "@/api/types";

export const expenseService = {
  async list(q: ExpensesListQuery = {}): Promise<Expense[]> {
    const response = await apiClient.get(API_ROUTES.expenses.base, {
      params: q,
    });
    return response.data;
  },

  async get(id: string): Promise<Expense> {
    const response = await apiClient.get(API_ROUTES.expenses.byId(id));
    return response.data;
  },

  async create(body: CreateExpenseBody): Promise<Expense> {
    const response = await apiClient.post(API_ROUTES.expenses.base, body);
    return response.data;
  },

  async update(id: string, body: UpdateExpenseBody): Promise<Expense> {
    const response = await apiClient.put(API_ROUTES.expenses.byId(id), body);
    return response.data;
  },

  async remove(id: string): Promise<Expense> {
    const response = await apiClient.delete(API_ROUTES.expenses.byId(id));
    return response.data;
  },
};
