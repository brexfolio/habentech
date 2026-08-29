"use client";

import { useEffect, useState } from "react";
import {
  Package,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Clock,
  MessageSquareText,
  Smartphone,
  Boxes,
  AlertTriangle,
  PackageX,
  Coins,
} from "lucide-react";
import { apiGet, ApiError } from "@/lib/apiClient";
import { Spinner } from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import { formatPrice } from "@/lib/utils";

interface Analytics {
  totalProducts: number;
  availableProducts: number;
  soldProducts: number;
  totalOrders: number;
  pendingOrders: number;
  productRequests: number;
  pendingSellRequests: number;
  totalUnitsInStock: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  inventoryValue: number;
}

export default function AnalyticsCards() {
  const [data, setData] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Analytics>("/api/analytics")
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Unable to load analytics."))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="loading-page">
        <Spinner surface="admin" />
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        surface="admin"
        icon={<AlertTriangle size={24} />}
        title="Unable to load analytics."
        description={error ?? "Please try again in a moment."}
      />
    );
  }

  const cards = [
    { icon: Package, label: "Total Products", value: data.totalProducts },
    { icon: CheckCircle2, label: "Available Products", value: data.availableProducts },
    { icon: XCircle, label: "Sold Products", value: data.soldProducts },
    { icon: ShoppingBag, label: "Total Orders", value: data.totalOrders },
    { icon: Clock, label: "Pending Orders", value: data.pendingOrders },
    { icon: MessageSquareText, label: "Product Requests", value: data.productRequests },
    { icon: Smartphone, label: "Sell Requests", value: data.pendingSellRequests },
    { icon: Boxes, label: "Total Units in Stock", value: data.totalUnitsInStock },
    { icon: AlertTriangle, label: "Low Stock Products", value: data.lowStockProducts },
    { icon: PackageX, label: "Out of Stock Products", value: data.outOfStockProducts },
    { icon: Coins, label: "Inventory Value", value: formatPrice(data.inventoryValue) },
  ];

  return (
    <div className="admin-stat-grid">
      {cards.map(({ icon: Icon, label, value }) => (
        <div className="admin-stat-card" key={label}>
          <div className="admin-stat-card__icon">
            <Icon size={18} />
          </div>
          <p className="admin-stat-card__value">{value}</p>
          <p className="admin-stat-card__label">{label}</p>
        </div>
      ))}
    </div>
  );
}
