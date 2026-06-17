"use client";

import { usePathname } from "next/navigation";
import { InfluencerSidebar } from "@/components/influencer/influencer-sidebar";

export default function InfluencerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noSidebar = pathname === "/influencer/login" || pathname === "/influencer/onboarding";

  if (noSidebar) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-50">
      <InfluencerSidebar />
      <div className="md:ml-60">
        {children}
      </div>
    </div>
  );
}
