"use client";

import { usePathname } from "next/navigation";
import { BrandSidebar } from "@/components/brand/brand-sidebar";

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/brand/login") {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <BrandSidebar />
      <div className="flex-1 ml-60 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
