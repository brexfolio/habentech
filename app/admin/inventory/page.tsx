"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminGate from "@/components/admin/AdminGate";
import AdminNavigation from "@/components/admin/AdminNavigation";
import InventoryList from "@/components/admin/InventoryList";
import InventoryDetail from "@/components/admin/InventoryDetail";
import type { InventoryRecord } from "@/types/inventory";

export default function AdminInventoryPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<InventoryRecord | null>(null);
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
          title={selected ? selected.product?.name ?? "Inventory" : "Inventory"}
          subtitle={selected ? undefined : "Stock quantities, cost & history"}
          onBack={handleBack}
        />

        {selected ? (
          <InventoryDetail inventory={selected} onUpdated={setSelected} />
        ) : (
          <InventoryList key={listKey} onSelect={setSelected} />
        )}
      </div>
    </AdminGate>
  );
}
