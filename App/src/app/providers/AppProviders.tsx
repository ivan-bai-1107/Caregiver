import { RouterProvider } from "react-router";
import { router } from "@/app/routes";

export function AppProviders() {
  return <RouterProvider router={router} />;
}
