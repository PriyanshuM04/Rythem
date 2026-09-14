import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import TopNav from "../components/layout/TopNav";

export default function AppLayout() {
  return (
    <div className="h-screen bg-surface-base flex flex-col overflow-hidden">
      <TopNav />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 min-h-0 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}