import { Outlet } from 'react-router-dom';
export default function Layout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F5F6F8] text-[#1A2332]">
      <Outlet />
    </div>
  );
}