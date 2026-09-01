import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function PublicLayout() {
  return (
    <div className="grain min-h-screen bg-[#07080B]">
      <Navbar />
      <main className="relative z-10 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
