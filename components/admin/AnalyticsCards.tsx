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
import { useLanguage } from "@/lib/i18n";

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
  const { t } = useLanguage();

  useEffect(() => {
    apiGet<Analytics>("/api/analytics")
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : t("admin.analyticsCards.loadError")))
      .finally(() => setIsLoading(false));
  }, [t]);

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
        title={t("admin.analyticsCards.loadError")}
        description={error ?? t("admin.analyticsCards.retryHint")}
      />
    );
  }

  const cards = [
    { icon: Package, label: t("admin.analyticsCards.totalProducts"), value: data.totalProducts },
    { icon: CheckCircle2, label: t("admin.analyticsCards.availableProducts"), value: data.availableProducts },
    { icon: XCircle, label: t("admin.analyticsCards.soldProducts"), value: data.soldProducts },
    { icon: ShoppingBag, label: t("admin.analyticsCards.totalOrders"), value: data.totalOrders },
    { icon: Clock, label: t("admin.analyticsCards.pendingOrders"), value: data.pendingOrders },
    { icon: MessageSquareText, label: t("admin.analyticsCards.productRequests"), value: data.productRequests },
    { icon: Smartphone, label: t("admin.analyticsCards.sellRequests"), value: data.pendingSellRequests },
    { icon: Boxes, label: t("admin.analyticsCards.totalUnits"), value: data.totalUnitsInStock },
    { icon: AlertTriangle, label: t("admin.analyticsCards.lowStock"), value: data.lowStockProducts },
    { icon: PackageX, label: t("admin.analyticsCards.outOfStock"), value: data.outOfStockProducts },
    { icon: Coins, label: t("admin.analyticsCards.inventoryValue"), value: formatPrice(data.inventoryValue) },
  ];

  return (
    <div className="admin-stat-grid">
      {cards.map(({ icon: Icon, label, value }) => (
        <div className="admin-stat-card" key={label}>
          <div className="admin-stat-card__icon">
            <Icon size={14} />
          </div>
          <p className="admin-stat-card__value">{value}</p>
          <p className="admin-stat-card__label">{label}</p>
        </div>
      ))}
    </div>
  );
}
