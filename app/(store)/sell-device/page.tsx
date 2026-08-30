"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  CheckCircle2,
  User as UserIcon,
  ClipboardList,
} from "lucide-react";
import {
  SELL_DEVICE_CATEGORIES,
  SELL_DEVICE_CONDITIONS,
  DEVICE_BRANDS,
  type SellDeviceCategory,
  type SellDeviceCondition,
} from "@/types/sellRequest";
import { CATEGORY_SPEC_FIELDS, hasPredefinedSpecs } from "@/lib/sellDeviceSpecs";
import Header from "@/components/store/Header";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useTelegramUser } from "@/lib/useTelegramUser";
import { getCustomerDisplayName, formatPrice } from "@/lib/utils";
import { apiPost, apiUpload, ApiError } from "@/lib/apiClient";

interface ImageDraft {
  telegram_file_id: string | null;
  image_url: string;
}

interface SpecDraft {
  label: string;
  value: string;
}

const TOTAL_STEPS = 6;

const STEP_TITLES = [
  "Device Information",
  "Device Condition",
  "Specifications",
  "Expected Price",
  "Device Photos",
  "Your Information",
];

export default function SellDevicePage() {
  const router = useRouter();
  const { user } = useTelegramUser();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [reviewing, setReviewing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<SellDeviceCategory>("Smartphone");
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [model, setModel] = useState("");
  const [productName, setProductName] = useState("");

  const [condition, setCondition] = useState<SellDeviceCondition>("Good");
  const [conditionDescription, setConditionDescription] = useState("");

  const [specs, setSpecs] = useState<SpecDraft[]>([]);
  const [customSpecs, setCustomSpecs] = useState<SpecDraft[]>([{ label: "", value: "" }]);

  const [expectedPrice, setExpectedPrice] = useState("");
  const [priceNegotiable, setPriceNegotiable] = useState(true);

  const [images, setImages] = useState<ImageDraft[]>([]);

  const effectiveBrand = brand === "Other" ? customBrand.trim() : brand;
  const predefined = hasPredefinedSpecs(category);

  function updatePredefinedSpec(label: string, value: string) {
    setSpecs((prev) => {
      const existing = prev.find((s) => s.label === label);
      if (existing) return prev.map((s) => (s.label === label ? { ...s, value } : s));
      return [...prev, { label, value }];
    });
  }

  function getPredefinedValue(label: string) {
    return specs.find((s) => s.label === label)?.value ?? "";
  }

  function updateCustomSpec(index: number, field: "label" | "value", value: string) {
    setCustomSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function addCustomSpec() {
    setCustomSpecs((prev) => [...prev, { label: "", value: "" }]);
  }

  function removeCustomSpec(index: number) {
    setCustomSpecs((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await apiUpload<{ telegram_file_id: string; image_url: string }>(
          "/api/sell-requests/upload-image",
          formData
        );
        setImages((prev) => [...prev, { telegram_file_id: result.telegram_file_id, image_url: result.image_url }]);
      }
    } catch (uploadError) {
      showToast("error", uploadError instanceof ApiError ? uploadError.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function validateStep(current: number): string | null {
    if (current === 1) {
      if (!effectiveBrand) return "Brand is required.";
      if (!model.trim()) return "Model name is required.";
    }
    if (current === 4) {
      const price = Number(expectedPrice);
      if (!price || price <= 0) return "Expected price must be greater than zero.";
    }
    if (current === 5) {
      if (images.length === 0) return "At least one device photo is required.";
    }
    return null;
  }

  function goNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      showToast("error", validationError);
      return;
    }
    setError(null);
    if (step === TOTAL_STEPS) {
      setReviewing(true);
    } else {
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    if (reviewing) {
      setReviewing(false);
      return;
    }
    if (step === 1) {
      router.push("/");
      return;
    }
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  function buildFinalSpecs(): SpecDraft[] {
    if (predefined) {
      return specs.filter((s) => s.value.trim());
    }
    return customSpecs.filter((s) => s.label.trim() && s.value.trim());
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await apiPost("/api/sell-requests", {
        category,
        brand: effectiveBrand,
        model: model.trim(),
        product_name: productName.trim() || undefined,
        condition,
        condition_description: conditionDescription.trim(),
        expected_price: Number(expectedPrice),
        currency: "ETB",
        price_negotiable: priceNegotiable,
        specifications: buildFinalSpecs(),
        images,
      });
      setSubmitted(true);
    } catch (submitError) {
      showToast("error", submitError instanceof ApiError ? submitError.message : "Unable to submit your device.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="store-shell">
        <Header />
        <div style={{ padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
          <div className="empty-state__icon" style={{ background: "var(--store-success-bg)", color: "var(--store-success)", width: 64, height: 64 }}>
            <CheckCircle2 size={30} />
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Device submitted!</h1>
          <p style={{ fontSize: 14, color: "var(--store-text-muted)", maxWidth: 300, lineHeight: 1.5 }}>
            Your device has been submitted successfully. The store will review it and contact you soon.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Link href="/my-sell-requests">
              <Button variant="secondary">My Submissions</Button>
            </Link>
            <Button variant="primary" onClick={() => router.push("/")}>
              Back to Store
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="store-shell">
      <Header />

      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="page-header__title">Sell Your Device</h1>
        <Link href="/my-sell-requests" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--store-primary)", display: "flex", alignItems: "center", gap: 4 }}>
          <ClipboardList size={14} />
          My Submissions
        </Link>
      </div>

      <div className="step-header">
        <p className="step-header__eyebrow">
          {reviewing ? "Review" : `Step ${step} of ${TOTAL_STEPS}`}
        </p>
        <p className="step-header__title">{reviewing ? "Review & Submit" : STEP_TITLES[step - 1]}</p>
        <div className="step-progress">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div className="step-progress__bar" key={index}>
              <div
                className="step-progress__bar-fill"
                style={{ width: reviewing || index < step ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="sell-form">
        {error && <p className="form-error">{error}</p>}

        {!reviewing && step === 1 && (
          <>
            <div className="field">
              <span className="field__label">Device Category</span>
              <div className="option-grid">
                {SELL_DEVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`option-card ${category === cat ? "option-card--active" : ""}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <span className="field__label">Brand</span>
              <div className="option-grid">
                {DEVICE_BRANDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`option-card ${brand === b ? "option-card--active" : ""}`}
                    onClick={() => setBrand(b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
              {brand === "Other" && (
                <Input
                  placeholder="Enter brand name"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                />
              )}
            </div>

            <Input
              label="Model Name"
              placeholder="e.g. iPhone 14 Pro"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />

            <Input
              label="Product Name (optional)"
              placeholder="Leave blank if the model name is clear enough"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </>
        )}

        {!reviewing && step === 2 && (
          <>
            <div className="field">
              <span className="field__label">Overall Condition</span>
              <div className="option-grid">
                {SELL_DEVICE_CONDITIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`option-card ${condition === c ? "option-card--active" : ""}`}
                    onClick={() => setCondition(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              label="Tell us about the condition of your device"
              placeholder="Scratches, cracks, repairs, missing parts, physical damage, other issues..."
              value={conditionDescription}
              onChange={(e) => setConditionDescription(e.target.value)}
              rows={5}
            />
          </>
        )}

        {!reviewing && step === 3 && (
          <>
            {predefined ? (
              CATEGORY_SPEC_FIELDS[category]!.map((label) => (
                <Input
                  key={label}
                  label={label}
                  value={getPredefinedValue(label)}
                  onChange={(e) => updatePredefinedSpec(label, e.target.value)}
                />
              ))
            ) : (
              <div className="field">
                <span className="field__label">Specifications</span>
                {customSpecs.map((spec, index) => (
                  <div className="store-spec-row" key={index} style={{ marginBottom: 8 }}>
                    <Input
                      placeholder="Specification Name"
                      value={spec.label}
                      onChange={(e) => updateCustomSpec(index, "label", e.target.value)}
                      aria-label="Specification name"
                    />
                    <Input
                      placeholder="Specification Value"
                      value={spec.value}
                      onChange={(e) => updateCustomSpec(index, "value", e.target.value)}
                      aria-label="Specification value"
                    />
                    <button
                      type="button"
                      className="store-spec-remove"
                      onClick={() => removeCustomSpec(index)}
                      aria-label="Remove specification"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                <button type="button" className="store-add-row-btn" onClick={addCustomSpec}>
                  <Plus size={16} />
                  Add Specification
                </button>
              </div>
            )}
          </>
        )}

        {!reviewing && step === 4 && (
          <>
            <Input
              label="Expected Selling Price (ETB)"
              type="number"
              min="0"
              step="0.01"
              value={expectedPrice}
              onChange={(e) => setExpectedPrice(e.target.value)}
              placeholder="e.g. 45000"
            />
            <div className="store-toggle-row">
              <span className="store-toggle-row__label">Price Negotiable</span>
              <label className="store-switch">
                <input type="checkbox" checked={priceNegotiable} onChange={(e) => setPriceNegotiable(e.target.checked)} />
                <span className="store-switch__track" />
              </label>
            </div>
          </>
        )}

        {!reviewing && step === 5 && (
          <div className="field">
            <span className="field__label">Device Photos</span>
            <span className="form-hint" style={{ display: "block", marginBottom: 8 }}>
              Recommended: front, back, sides, screen, accessories, and any damaged areas.
            </span>
            <div className="photo-grid">
              {images.map((image, index) => (
                <div className="photo-thumb" key={`${image.image_url}-${index}`}>
                  <img src={image.image_url} alt={`Device photo ${index + 1}`} />
                  <button type="button" className="photo-thumb__remove" onClick={() => removeImage(index)} aria-label="Remove photo">
                    <Trash2 size={12} />
                  </button>
                  <div style={{ position: "absolute", bottom: 4, right: 4, display: "flex", gap: 4 }}>
                    {index > 0 && (
                      <button type="button" className="photo-thumb__remove" onClick={() => moveImage(index, -1)} aria-label="Move earlier">
                        <ArrowUp size={12} />
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button type="button" className="photo-thumb__remove" onClick={() => moveImage(index, 1)} aria-label="Move later">
                        <ArrowDown size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" className="photo-upload-tile" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                <Camera size={20} />
                {isUploading ? "Uploading..." : "Add Photo"}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              hidden
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
          </div>
        )}

        {!reviewing && step === 6 && (
          <div className="review-card">
            <p className="review-card__title">TELEGRAM IDENTITY</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="empty-state__icon" style={{ width: 42, height: 42 }}>
                <UserIcon size={18} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>
                  {user ? getCustomerDisplayName(user) : "Telegram User"}
                </p>
                {user?.username && (
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--store-text-muted)" }}>@{user.username}</p>
                )}
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--store-text-muted)", marginTop: 12, marginBottom: 0 }}>
              We use your Telegram account to identify you — no need to type anything here. This is verified
              securely by our server when you submit.
            </p>
          </div>
        )}

        {reviewing && (
          <>
            <div className="review-card">
              <p className="review-card__title">DEVICE</p>
              <div className="review-row">
                <span className="review-row__label">Product Name</span>
                <span className="review-row__value">{productName || `${effectiveBrand} ${model}`}</span>
              </div>
              <div className="review-row">
                <span className="review-row__label">Category</span>
                <span className="review-row__value">{category}</span>
              </div>
              <div className="review-row">
                <span className="review-row__label">Brand</span>
                <span className="review-row__value">{effectiveBrand}</span>
              </div>
              <div className="review-row">
                <span className="review-row__label">Model</span>
                <span className="review-row__value">{model}</span>
              </div>
              <div className="review-row">
                <span className="review-row__label">Condition</span>
                <span className="review-row__value">{condition}</span>
              </div>
            </div>

            {buildFinalSpecs().length > 0 && (
              <div className="review-card">
                <p className="review-card__title">SPECIFICATIONS</p>
                {buildFinalSpecs().map((spec) => (
                  <div className="review-row" key={spec.label}>
                    <span className="review-row__label">{spec.label}</span>
                    <span className="review-row__value">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="review-card">
              <p className="review-card__title">PRICE</p>
              <div className="review-row">
                <span className="review-row__label">Expected Price</span>
                <span className="review-row__value">{formatPrice(Number(expectedPrice) || 0)}</span>
              </div>
              <div className="review-row">
                <span className="review-row__label">Negotiable</span>
                <span className="review-row__value">{priceNegotiable ? "Yes" : "No"}</span>
              </div>
            </div>

            <div className="review-card">
              <p className="review-card__title">PHOTOS ({images.length})</p>
              <div className="photo-grid">
                {images.map((image, index) => (
                  <div className="photo-thumb" key={index}>
                    <img src={image.image_url} alt={`Device photo ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="form-inline-actions">
          <Button variant="secondary" block onClick={goBack} disabled={isSubmitting}>
            <ArrowLeft size={16} />
            Back
          </Button>
          {reviewing ? (
            <Button variant="primary" block loading={isSubmitting} onClick={handleSubmit}>
              Submit Device for Review
            </Button>
          ) : (
            <Button variant="primary" block onClick={goNext}>
              Next
              <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
