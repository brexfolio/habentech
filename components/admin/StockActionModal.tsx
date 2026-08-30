"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { apiPost, ApiError } from "@/lib/apiClient";
import { REMOVE_STOCK_REASONS, type InventoryRecord, type InventoryTransaction } from "@/types/inventory";

export type StockAction = "add" | "remove" | "adjust";

interface StockActionModalProps {
  action: StockAction | null;
  inventory: InventoryRecord;
  onClose: () => void;
  onApplied: (inventory: InventoryRecord, transaction: InventoryTransaction) => void;
}

const TITLES: Record<StockAction, string> = {
  add: "Add Stock",
  remove: "Remove Stock",
  adjust: "Adjust Stock",
};

const ENDPOINTS: Record<StockAction, string> = {
  add: "add-stock",
  remove: "remove-stock",
  adjust: "adjust-stock",
};

export default function StockActionModal({ action, inventory, onClose, onApplied }: StockActionModalProps) {
  const [quantity, setQuantity] = useState("1");
  const [newQuantity, setNewQuantity] = useState(String(inventory.quantity));
  const [costPrice, setCostPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [reason, setReason] = useState(REMOVE_STOCK_REASONS[0]);
  const [adjustReason, setAdjustReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  if (!action) return null;
  const currentAction: StockAction = action;

  async function handleSubmit() {
    setIsSaving(true);
    try {
      let payload: Record<string, unknown>;

      if (action === "add") {
        const qty = Number(quantity);
        if (!qty || qty <= 0) {
          showToast("error", "Quantity to add must be greater than zero.");
          setIsSaving(false);
          return;
        }
        payload = {
          quantity: qty,
          cost_price: costPrice ? Number(costPrice) : undefined,
          supplier: supplier.trim() || undefined,
          notes: notes.trim() || undefined,
        };
      } else if (action === "remove") {
        const qty = Number(quantity);
        if (!qty || qty <= 0) {
          showToast("error", "Quantity must be greater than zero.");
          setIsSaving(false);
          return;
        }
        payload = { quantity: qty, reason, notes: notes.trim() || undefined };
      } else {
        const qty = Number(newQuantity);
        if (qty < 0 || Number.isNaN(qty)) {
          showToast("error", "New quantity cannot be negative.");
          setIsSaving(false);
          return;
        }
        if (!adjustReason.trim()) {
          showToast("error", "A reason is required for stock adjustments.");
          setIsSaving(false);
          return;
        }
        payload = { new_quantity: qty, reason: adjustReason.trim(), notes: notes.trim() || undefined };
      }

      const result = await apiPost<{ inventory: InventoryRecord; transaction: InventoryTransaction }>(
        `/api/inventory/${inventory.product_id}/${ENDPOINTS[currentAction]}`,
        payload
      );

      showToast(
        "success",
        action === "add" ? "Stock added successfully." : action === "remove" ? "Stock removed successfully." : "Inventory updated successfully."
      );
      onApplied(result.inventory, result.transaction);
      onClose();
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Unable to update inventory.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={TITLES[action]}
      surface="admin"
      footer={
        <>
          <Button surface="admin" variant="secondary" block onClick={onClose}>
            Cancel
          </Button>
          <Button surface="admin" variant="primary" block loading={isSaving} onClick={handleSubmit}>
            {TITLES[action]}
          </Button>
        </>
      }
    >
      <p style={{ margin: 0, fontSize: 13, color: "var(--admin-text-muted)" }}>
        Current Quantity: <strong style={{ color: "var(--admin-text)" }}>{inventory.quantity}</strong>
      </p>

      {action === "add" && (
        <>
          <Input surface="admin" label="Quantity to Add" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <div className="admin-form__row">
            <Input
              surface="admin"
              label="Cost Price"
              type="number"
              min="0"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
            />
            <Input surface="admin" label="Supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
          </div>
          {quantity && Number(quantity) > 0 && (
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--admin-text-muted)" }}>
              New Quantity: <strong>{inventory.quantity + (Number(quantity) || 0)}</strong>
            </p>
          )}
        </>
      )}

      {action === "remove" && (
        <>
          <Input surface="admin" label="Quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <Select
            surface="admin"
            label="Reason"
            value={reason}
            onChange={(value) => setReason(value)}
            options={REMOVE_STOCK_REASONS.map((r) => ({ value: r, label: r }))}
          />
        </>
      )}

      {action === "adjust" && (
        <>
          <Input
            surface="admin"
            label="New Quantity"
            type="number"
            min="0"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
          />
          <Input
            surface="admin"
            label="Reason"
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
            placeholder="e.g. Physical stock count correction"
          />
        </>
      )}

      <Textarea surface="admin" label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
    </Modal>
  );
}
