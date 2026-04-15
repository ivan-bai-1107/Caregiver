import { Outlet } from "react-router";
import { BottomNav } from "./BottomNav";

export function AppLayout() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
