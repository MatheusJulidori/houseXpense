import apiClient from "@/api/client";
import { API_ROUTES } from "@/api/config";
import type {
  CreateHouseholdBody,
  Household,
  HouseholdSummaryResponse,
  UpdateHouseholdBody,
} from "@/api/types";

export const householdService = {
  async list(): Promise<Household[]> {
    const response = await apiClient.get(API_ROUTES.households.base);
    return response.data;
  },

  async get(id: string): Promise<Household> {
    const response = await apiClient.get(API_ROUTES.households.byId(id));
    return response.data;
  },

  async summary(id: string): Promise<HouseholdSummaryResponse> {
    const response = await apiClient.get(API_ROUTES.households.summary(id));
    return response.data;
  },

  async create(body: CreateHouseholdBody): Promise<Household> {
    const response = await apiClient.post(API_ROUTES.households.base, body);
    return response.data;
  },

  async update(id: string, body: UpdateHouseholdBody): Promise<Household> {
    const response = await apiClient.put(API_ROUTES.households.byId(id), body);
    return response.data;
  },

  async remove(id: string): Promise<Household> {
    const response = await apiClient.delete(API_ROUTES.households.byId(id));
    return response.data;
  },
};
