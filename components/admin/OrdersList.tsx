"use client";

import { useCallback, useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { apiGet, apiPatch, ApiError } from "@/lib/apiClient";
import { formatDate, formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import Select from "@/components/ui/Select";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/types/order";

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadOrders = useCallback(() => {
    setIsLoading(true);
    apiGet<{ orders: Order[] }>("/api/orders")
      .then((data) => setOrders(data.orders))
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    const previous = orders;
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    try {
      await apiPatch(`/api/orders/${orderId}`, { status });
      showToast("success", `Order marked as ${status}.`);
    } catch (error) {
      setOrders(previous);
      showToast("error", error instanceof ApiError ? error.message : "Unable to update order.");
    }
  }

  if (isLoading) {
    return (
      <div className="loading-page">
        <Spinner surface="admin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        surface="admin"
        icon={<ShoppingBag size={24} />}
        title="No orders yet."
        description="Customer orders will appear here as they come in."
      />
    );
  }

  return (
    <div className="admin-list">
      {orders.map((order) => (
        <div className="admin-list-item" key={order.id}>
          <div className="admin-list-item__top">
            <div>
              <p className="admin-list-item__title">{order.product?.name ?? "Product"}</p>
              <p className="admin-list-item__subtitle">
                {order.customer_name}
                {order.username ? ` · @${order.username}` : ""}
              </p>
            </div>
            <span className={`admin-badge admin-badge--${order.status.toLowerCase()}`}>
              {order.status}
            </span>
          </div>
          <div className="admin-list-item__meta-row">
            <span>
              Qty: <strong>{order.quantity}</strong>
            </span>
            <span>
              Total: <strong>{formatPrice(order.total_price, order.product?.currency ?? "ETB")}</strong>
            </span>
            <span>{formatDate(order.created_at)}</span>
          </div>
          <Select
            surface="admin"
            aria-label="Update order status"
            value={order.status}
            onChange={(value) => updateStatus(order.id, value as OrderStatus)}
            options={ORDER_STATUSES.map((status) => ({ value: status, label: status }))}
          />
        </div>
      ))}
    </div>
  );
}
