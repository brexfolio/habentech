import type { ReactNode } from "react";
import BottomNavigation from "@/components/store/BottomNavigation";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <BottomNavigation />
    </>
  );
}
