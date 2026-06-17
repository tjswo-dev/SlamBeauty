import { BrandSidebar } from "@/components/brand/brand-sidebar";

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <BrandSidebar />
      <div className="flex-1 ml-60 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
