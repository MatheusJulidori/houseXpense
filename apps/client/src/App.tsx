import { useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";

import { useHealthPing } from "@/api/hooks/useHealthcheck";
import FullScreenSpinner from "@/components/ui/fullscreen-spinner";

const NotFoundPage = lazy(() => import("@/pages/error/404"));
const ApiDownPage = lazy(() => import("@/pages/error/api_down"));

const HomePage = lazy(() => import("@/pages/main/homePage"));
const Dashboard = lazy(() => import("@/pages/main/householdPage"));
const PeoplePage = lazy(() => import("@/pages/main/peoplePage"));

export default function App() {
  const { data, isLoading, isError } = useHealthPing();
  const location = useLocation();
  const queryCache = useQueryClient();

  useEffect(() => {
    void queryCache.invalidateQueries({ queryKey: ["health", "ping"] });
  }, [location.pathname, queryCache]);

  if (isLoading) return <FullScreenSpinner />;
  if (isError || data?.ok === false) {
    return (
      <Suspense fallback={<FullScreenSpinner />}>
        <ApiDownPage />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <Routes>
        {/* home */}
        <Route path="/" element={<HomePage />} />

        {/* household routes */}
        <Route path="households/:id" element={<Dashboard />}>
          <Route path="people" element={<PeoplePage />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
