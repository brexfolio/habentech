"use client";

import { useEffect, useState } from "react";
import { PackageX } from "lucide-react";
import Header from "@/components/store/Header";
import BottomNavigation from "@/components/store/BottomNavigation";
import EmptyState from "@/components/ui/EmptyState";
import { LoadingPage } from "@/components/ui/Loading";
import { apiGet } from "@/lib/apiClient";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Order } from "@/types/order";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<{ orders: Order[] }>("/api/orders")
      .then((data) => setOrders(data.orders))
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="store-shell">
      <Header />
      <div className="page-header">
        <h1 className="page-header__title">My Orders</h1>
      </div>

      {isLoading ? (
        <LoadingPage />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<PackageX size={26} />}
          title="No orders yet."
          description="Orders you place will show up here so you can track their status."
        />
      ) : (
        orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-card__top">
              <p className="order-card__name">{order.product?.name ?? "Product"}</p>
              <span className={`status-pill status-pill--${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            <p className="order-card__meta">Quantity: {order.quantity}</p>
            <p className="order-card__meta">
              Total: {formatPrice(order.total_price, order.product?.currency ?? "ETB")}
            </p>
            <p className="order-card__meta">{formatDate(order.created_at)}</p>
          </div>
        ))
      )}

      <BottomNavigation />
    </div>
  );
}
