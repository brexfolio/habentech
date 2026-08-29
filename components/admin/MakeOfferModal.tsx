"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { apiPost, ApiError } from "@/lib/apiClient";
import type { SellRequest } from "@/types/sellRequest";

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellRequest: SellRequest;
  onOfferSent: (updated: SellRequest) => void;
}

export default function MakeOfferModal({ isOpen, onClose, sellRequest, onOfferSent }: MakeOfferModalProps) {
  const [offerPrice, setOfferPrice] = useState(String(sellRequest.expected_price));
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { showToast } = useToast();

  async function handleSend() {
    const price = Number(offerPrice);
    if (!price || price <= 0) {
      showToast("error", "Offer price must be greater than zero.");
      return;
    }

    setIsSending(true);
    try {
      const result = await apiPost<{ sellRequest: SellRequest }>(`/api/sell-requests/${sellRequest.id}/offer`, {
        offer_price: price,
        message: message.trim() || undefined,
      });
      showToast("success", "Offer sent successfully.");
      onOfferSent(result.sellRequest);
      onClose();
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Unable to send offer.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Make Offer"
      surface="admin"
      footer={
        <>
          <Button surface="admin" variant="secondary" block onClick={onClose}>
            Cancel
          </Button>
          <Button surface="admin" variant="primary" block loading={isSending} onClick={handleSend}>
            Send Offer
          </Button>
        </>
      }
    >
      <Input
        surface="admin"
        label={`Offer Price (${sellRequest.currency})`}
        type="number"
        min="0"
        step="0.01"
        value={offerPrice}
        onChange={(e) => setOfferPrice(e.target.value)}
      />
      <Textarea
        surface="admin"
        label="Optional Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="We are interested in your device and would like to offer you this amount."
        rows={3}
      />
    </Modal>
  );
}
