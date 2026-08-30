"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch, ApiError } from "@/lib/apiClient";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/i18n";
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
  const { t } = useLanguage();

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
      showToast("success", t("admin.settingsForm.saved"));
    } catch (error) {
      showToast("error", error instanceof ApiError ? error.message : t("admin.settingsForm.saveError"));
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
      <Input surface="admin" label={t("admin.settingsForm.storeName")} value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
      <Textarea
        surface="admin"
        label={t("admin.settingsForm.storeDescription")}
        value={storeDescription}
        onChange={(e) => setStoreDescription(e.target.value)}
        rows={3}
      />
      <Input
        surface="admin"
        label={t("admin.settingsForm.telegramChannel")}
        value={telegramChannel}
        onChange={(e) => setTelegramChannel(e.target.value)}
        placeholder={t("admin.settingsForm.channelPlaceholder")}
      />
      <Input
        surface="admin"
        label={t("admin.settingsForm.contactPhone")}
        value={contactPhone}
        onChange={(e) => setContactPhone(e.target.value)}
        placeholder={t("admin.settingsForm.phonePlaceholder")}
      />
      <Input
        surface="admin"
        label={t("admin.settingsForm.contactEmail")}
        type="email"
        value={contactEmail}
        onChange={(e) => setContactEmail(e.target.value)}
        placeholder={t("admin.settingsForm.emailPlaceholder")}
      />
      <span className="admin-form__hint">{t("admin.settingsForm.credentialsHint")}</span>
      <Button surface="admin" variant="primary" block type="submit" loading={isSaving}>
        {t("admin.settingsForm.save")}
      </Button>
      {settings === null && <span className="admin-form__hint">{t("admin.settingsForm.noSettingsHint")}</span>}
    </form>
  );
}
