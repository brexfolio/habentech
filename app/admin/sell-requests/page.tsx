"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminGate from "@/components/admin/AdminGate";
import AdminNavigation from "@/components/admin/AdminNavigation";
import SellRequestsList from "@/components/admin/SellRequestsList";
import SellRequestDetail from "@/components/admin/SellRequestDetail";
import type { SellRequest } from "@/types/sellRequest";

export default function AdminSellRequestsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<SellRequest | null>(null);
  const [listKey, setListKey] = useState(0);

  function handleBack() {
    if (selected) {
      setSelected(null);
      setListKey((k) => k + 1);
      return;
    }
    router.push("/admin");
  }

  return (
    <AdminGate>
      <div className="admin-shell">
        <AdminNavigation
          title={selected ? selected.product_name || `${selected.brand} ${selected.model}` : "Sell Requests"}
          subtitle={selected ? undefined : "Review devices submitted by customers"}
          onBack={handleBack}
        />

        {selected ? (
          <SellRequestDetail sellRequest={selected} onUpdated={setSelected} />
        ) : (
          <SellRequestsList key={listKey} onSelect={setSelected} />
        )}
      </div>
    </AdminGate>
  );
}
