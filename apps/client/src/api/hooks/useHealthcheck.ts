import { useQuery } from "@tanstack/react-query";

import { healthService } from "@/api/services";
import type { HealthResponse } from "@/api/types";

export const useHealthPing = () =>
  useQuery<HealthResponse>({
    queryKey: ["health", "ping"],
    queryFn: healthService.ping,
    staleTime: 1000 * 60,
    retry: false,
  });
