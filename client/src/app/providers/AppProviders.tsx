import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "@/app/routes";
import { getUserPreferences } from "@/features/profile/services/profile.service";
import { getAuthToken } from "@/shared/lib/auth";

export function AppProviders() {
  useEffect(() => {
    if (!getAuthToken()) {
      return;
    }

    void getUserPreferences().catch(() => {
      // Preference loading is best-effort; route data must continue to render.
    });
  }, []);

  return <RouterProvider router={router} />;
}
