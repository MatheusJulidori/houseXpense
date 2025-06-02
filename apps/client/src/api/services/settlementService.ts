import apiClient from "@/api/client";
import { API_ROUTES } from "@/api/config";
import type {
  CreateSettlementBody,
  Settlement,
  SettlementsListQuery,
} from "@/api/types";

export const settlementService = {
  async list(q: SettlementsListQuery = {}): Promise<Settlement[]> {
    const response = await apiClient.get(API_ROUTES.settlements.base, {
      params: q,
    });
    return response.data;
  },

  async get(id: string): Promise<Settlement> {
    const response = await apiClient.get(API_ROUTES.settlements.byId(id));
    return response.data;
  },

  async create(body: CreateSettlementBody): Promise<Settlement> {
    const response = await apiClient.post(API_ROUTES.settlements.base, body);
    return response.data;
  },

  async remove(id: string): Promise<Settlement> {
    const response = await apiClient.delete(API_ROUTES.settlements.byId(id));
    return response.data;
  },
};
