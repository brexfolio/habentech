"use client";

import { useState } from "react";
import { ExternalLink, ImageOff } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { apiPatch, ApiError } from "@/lib/apiClient";
import { formatDate, formatPrice } from "@/lib/utils";
import type { SellRequest, SellRequestStatus } from "@/types/sellRequest";
import MakeOfferModal from "./MakeOfferModal";

interface SellRequestDetailProps {
  sellRequest: SellRequest;
  onUpdated: (updated: SellRequest) => void;
}

export default function SellRequestDetail({ sellRequest, onUpdated }: SellRequestDetailProps) {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<SellRequestStatus | null>(null);
  const { showToast } = useToast();

  const images = [...(sellRequest.images ?? [])].sort((a, b) => a.display_order - b.display_order);
  const specs = [...(sellRequest.specifications ?? [])].sort((a, b) => a.display_order - b.display_order);
  const latestOffer = [...(sellRequest.offers ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
  const deviceName = sellRequest.product_name || `${sellRequest.brand} ${sellRequest.model}`;

  async function updateStatus(status: SellRequestStatus) {
    setUpdatingStatus(status);
    try {
      const result = await apiPatch<{ sellRequest: SellRequest }>(`/api/sell-requests/${sellRequest.id}`, {
        status,
      });
      showToast("success", `Marked as ${status}.`);
      onUpdated(result.sellRequest);
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Unable to update this request.");
    } finally {
      setUpdatingStatus(null);
    }
  }

  return (
    <div style={{ padding: "0 18px 100px" }}>
      <div className="admin-card">
        <p className="admin-list-item__title" style={{ marginBottom: 4 }}>
          {deviceName}
        </p>
        <span className={`admin-badge admin-badge--${sellRequest.status.toLowerCase().replace(/\s+/g, "-")}`}>
          {sellRequest.status}
        </span>
      </div>

      {images.length > 0 ? (
        <div className="admin-image-grid" style={{ marginBottom: 14 }}>
          {images.map((image) => (
            <div className="admin-image-thumb" key={image.id}>
              <img src={image.image_url} alt={deviceName} />
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-card" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--admin-text-muted)" }}>
          <ImageOff size={16} /> No photos submitted.
        </div>
      )}

      <div className="admin-card">
        <p className="admin-form__label" style={{ marginBottom: 8 }}>
          CUSTOMER INFORMATION
        </p>
        <p style={{ margin: "0 0 4px" }}>{sellRequest.customer_name}</p>
        {sellRequest.telegram_username && (
          <p style={{ margin: 0, color: "var(--admin-text-muted)", fontSize: 13 }}>
            @{sellRequest.telegram_username}
          </p>
        )}
        {sellRequest.telegram_username && (
          <a
            href={`https://t.me/${sellRequest.telegram_username}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-block", marginTop: 10 }}
          >
            <Button surface="admin" variant="secondary" size="sm">
              <ExternalLink size={14} />
              Contact Customer
            </Button>
          </a>
        )}
      </div>

      <div className="admin-card">
        <p className="admin-form__label" style={{ marginBottom: 8 }}>
          DEVICE INFORMATION
        </p>
        <div className="admin-list-item__meta-row" style={{ marginBottom: 8 }}>
          <span>
            Category: <strong>{sellRequest.category}</strong>
          </span>
          <span>
            Brand: <strong>{sellRequest.brand}</strong>
          </span>
          <span>
            Model: <strong>{sellRequest.model}</strong>
          </span>
          <span>
            Condition: <strong>{sellRequest.condition}</strong>
          </span>
        </div>
        {sellRequest.condition_description && (
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--admin-text-muted)" }}>
            {sellRequest.condition_description}
          </p>
        )}
      </div>

      {specs.length > 0 && (
        <div className="admin-card">
          <p className="admin-form__label" style={{ marginBottom: 8 }}>
            SPECIFICATIONS
          </p>
          <div className="spec-table spec-table--admin">
            {specs.map((spec) => (
              <div className="spec-table__row" key={spec.id}>
                <span className="spec-table__label">{spec.label}</span>
                <span className="spec-table__value">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="admin-card">
        <p className="admin-form__label" style={{ marginBottom: 8 }}>
          PRICE
        </p>
        <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800 }}>
          {formatPrice(sellRequest.expected_price, sellRequest.currency)}
        </p>
        <p style={{ margin: 0, fontSize: 12.5, color: "var(--admin-text-muted)" }}>
          {sellRequest.price_negotiable ? "Negotiable" : "Not negotiable"}
        </p>
        {latestOffer && (
          <p style={{ margin: "10px 0 0", fontSize: 13.5 }}>
            Store offer: <strong>{formatPrice(latestOffer.offer_price, latestOffer.currency)}</strong> (
            {latestOffer.status})
          </p>
        )}
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--admin-text-muted)" }}>
          Submitted {formatDate(sellRequest.created_at)}
        </p>
      </div>

      <div className="admin-list-item__actions">
        <Button
          surface="admin"
          variant="secondary"
          size="sm"
          loading={updatingStatus === "Under Review"}
          onClick={() => updateStatus("Under Review")}
        >
          Mark Under Review
        </Button>
        <Button surface="admin" variant="primary" size="sm" onClick={() => setShowOfferModal(true)}>
          Make Offer
        </Button>
        <Button
          surface="admin"
          variant="secondary"
          size="sm"
          loading={updatingStatus === "Accepted"}
          onClick={() => updateStatus("Accepted")}
        >
          Accept Device
        </Button>
        <Button
          surface="admin"
          variant="danger"
          size="sm"
          loading={updatingStatus === "Rejected"}
          onClick={() => updateStatus("Rejected")}
        >
          Reject Request
        </Button>
        <Button
          surface="admin"
          variant="secondary"
          size="sm"
          loading={updatingStatus === "Completed"}
          onClick={() => updateStatus("Completed")}
        >
          Mark Completed
        </Button>
      </div>

      <MakeOfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        sellRequest={sellRequest}
        onOfferSent={onUpdated}
      />
    </div>
  );
}
