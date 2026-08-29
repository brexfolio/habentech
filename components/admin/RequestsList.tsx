"use client";

import { useEffect, useState } from "react";
import { MessageSquareText, ExternalLink } from "lucide-react";
import { apiGet, apiPatch, ApiError } from "@/lib/apiClient";
import { formatDate, formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import type { ProductRequest, RequestStatus } from "@/types/request";

export default function RequestsList() {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    apiGet<{ requests: ProductRequest[] }>("/api/requests")
      .then((data) => setRequests(data.requests))
      .catch(() => setRequests([]))
      .finally(() => setIsLoading(false));
  }, []);

  async function updateStatus(id: string, status: RequestStatus) {
    const previous = requests;
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await apiPatch(`/api/requests/${id}`, { status });
      showToast("success", `Request marked as ${status}.`);
    } catch (error) {
      setRequests(previous);
      showToast("error", error instanceof ApiError ? error.message : "Unable to update request.");
    }
  }

  if (isLoading) {
    return (
      <div className="loading-page">
        <Spinner surface="admin" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        surface="admin"
        icon={<MessageSquareText size={24} />}
        title="No product requests yet."
        description="Customer requests for products will appear here."
      />
    );
  }

  return (
    <div className="admin-list">
      {requests.map((request) => (
        <div className="admin-list-item" key={request.id}>
          <div className="admin-list-item__top">
            <div>
              <p className="admin-list-item__title">{request.product?.name ?? "Product"}</p>
              <p className="admin-list-item__subtitle">
                {request.customer_name}
                {request.username ? ` · @${request.username}` : ""}
              </p>
            </div>
            <span className={`admin-badge admin-badge--${request.status.toLowerCase()}`}>
              {request.status}
            </span>
          </div>
          <div className="admin-list-item__meta-row">
            {request.product && (
              <span>
                Price: <strong>{formatPrice(request.product.price, request.product.currency)}</strong>
              </span>
            )}
            <span>{formatDate(request.created_at)}</span>
          </div>
          <div className="admin-list-item__actions">
            {request.username && (
              <a href={`https://t.me/${request.username}`} target="_blank" rel="noopener noreferrer">
                <Button surface="admin" variant="secondary" size="sm">
                  <ExternalLink size={14} />
                  Contact Customer
                </Button>
              </a>
            )}
            <Button surface="admin" variant="secondary" size="sm" onClick={() => updateStatus(request.id, "Completed")}>
              Mark Completed
            </Button>
            <Button surface="admin" variant="secondary" size="sm" onClick={() => updateStatus(request.id, "Sold")}>
              Mark Sold
            </Button>
            <Button surface="admin" variant="secondary" size="sm" onClick={() => updateStatus(request.id, "Unavailable")}>
              Mark Unavailable
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
