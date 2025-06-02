import apiClient from "@/api/client";
import { API_ROUTES } from "@/api/config";
import type { HealthResponse } from "@/api/types";

export const healthService = {
  async ping(): Promise<HealthResponse> {
    const response = await apiClient.get(API_ROUTES.health);
    return response.data;
  },
};
