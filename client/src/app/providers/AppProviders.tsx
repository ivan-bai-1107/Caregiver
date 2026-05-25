import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "@/app/routes";
import { applyThemeMode, getStoredThemeMode } from "@/shared/theme/themeMode";

export function AppProviders() {
  useEffect(() => {
    applyThemeMode(getStoredThemeMode());
  }, []);

  return <RouterProvider router={router} />;
}
