import { Outlet } from "react-router";
import { BottomNav } from "./BottomNav";

export function AppLayout() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="app-scroll-shell flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
