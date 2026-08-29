"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch, ApiError } from "@/lib/apiClient";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";
import type { StoreSettings } from "@/types/settings";

export default function SettingsForm() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [telegramChannel, setTelegramChannel] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    apiGet<{ settings: StoreSettings | null }>("/api/settings")
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings);
          setStoreName(data.settings.store_name);
          setStoreDescription(data.settings.store_description);
          setTelegramChannel(data.settings.telegram_channel ?? "");
          setContactPhone(data.settings.contact_phone ?? "");
          setContactEmail(data.settings.contact_email ?? "");
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await apiPatch<{ settings: StoreSettings }>("/api/settings", {
        store_name: storeName.trim(),
        store_description: storeDescription.trim(),
        telegram_channel: telegramChannel.trim() || null,
        contact_phone: contactPhone.trim() || null,
        contact_email: contactEmail.trim() || null,
      });
      setSettings(result.settings);
      showToast("success", "Store settings saved.");
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : "Unable to save settings.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="loading-page">
        <Spinner surface="admin" />
      </div>
    );
  }

  return (
    <form className="admin-form" onSubmit={handleSave}>
      <Input surface="admin" label="Store Name" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
      <Textarea
        surface="admin"
        label="Store Description"
        value={storeDescription}
        onChange={(e) => setStoreDescription(e.target.value)}
        rows={3}
      />
      <Input
        surface="admin"
        label="Telegram Channel"
        value={telegramChannel}
        onChange={(e) => setTelegramChannel(e.target.value)}
        placeholder="@my_electronics_store"
      />
      <Input
        surface="admin"
        label="Contact Phone"
        value={contactPhone}
        onChange={(e) => setContactPhone(e.target.value)}
        placeholder="+251..."
      />
      <Input
        surface="admin"
        label="Contact Email"
        type="email"
        value={contactEmail}
        onChange={(e) => setContactEmail(e.target.value)}
        placeholder="store@example.com"
      />
      <span className="admin-form__hint">
        Sensitive credentials (bot token, database keys) are managed via environment variables and cannot be
        edited here.
      </span>
      <Button surface="admin" variant="primary" block type="submit" loading={isSaving}>
        Save Settings
      </Button>
      {settings === null && (
        <span className="admin-form__hint">No settings row found yet — saving will create one.</span>
      )}
    </form>
  );
}
