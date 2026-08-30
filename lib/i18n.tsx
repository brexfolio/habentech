"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getTelegramUser } from "./telegram";

export type Language = "en" | "am";

const STORAGE_KEY = "habentech_language";

const en = {
  language: {
    title: "Language",
    english: "English",
    amharic: "አማርኛ",
  },
  nav: {
    home: "Home",
    sell: "Sell",
    favorites: "Favorites",
    orders: "Orders",
  },
  header: {
    greeting: "Hey, {name} 👋",
  },
  home: {
    heroTitle: "Find Your Next Device",
    heroSubtitle: "Browse the latest electronics available in our store.",
    filterByCategory: "Filter by category",
    telegramUser: "Telegram User",
  },
  search: {
    placeholder: "Search products...",
    clear: "Clear search",
  },
  product: {
    notFoundTitle: "Product not found.",
    notFoundDescription: "This product may have been removed or is no longer available.",
    backToStore: "Back to store",
    condition: "Condition",
    category: "Category",
    specifications: "Specifications",
    description: "Description",
    requestProduct: "Request Product",
    orderNow: "Order Now",
    confirmRequest: "Confirm Request",
    confirmOrder: "Confirm Order",
    cancel: "Cancel",
    sendRequest: "Send Request",
    confirmOrderButton: "Confirm Order",
    product: "Product",
    price: "Price",
    yourName: "Your name",
    quantity: "Quantity",
    total: "Total",
    requestSent: "Request sent successfully!",
    orderPlaced: "Order placed successfully!",
    unableToSendRequest: "Unable to send request.",
    unableToPlaceOrder: "Unable to place order.",
    noProducts: "No products available right now.",
    noProductsHint: "Try a different search term or check back later for new arrivals.",
    emptyName: "Product",
    goBack: "Go back",
    previousImage: "Previous image",
    nextImage: "Next image",
    goToImage: "Go to image {index}",
  },
  favorites: {
    title: "Favorites",
    emptyTitle: "No favorites yet.",
    emptyDescription: "Tap the heart icon on any product to save it here.",
    remove: "Remove from favorites",
    add: "Add to favorites",
  },
  orders: {
    title: "My Orders",
    emptyTitle: "No orders yet.",
    emptyDescription: "Orders you place will show up here so you can track their status.",
    quantityPrefix: "Quantity:",
    totalPrefix: "Total:",
  },
  sell: {
    title: "Sell Your Device",
    mySubmissions: "My Submissions",
    backToStore: "Back to Store",
    submittedTitle: "Device submitted!",
    submittedDescription:
      "Your device has been submitted successfully. The store will review it and contact you soon.",
    review: "Review",
    step: "Step {step} of {total}",
    reviewAndSubmit: "Review & Submit",
    step1: "Device Information",
    step2: "Device Condition",
    step3: "Specifications",
    step4: "Expected Price",
    step5: "Device Photos",
    step6: "Your Information",
    deviceCategory: "Device Category",
    brand: "Brand",
    brandPlaceholder: "Enter brand name",
    modelName: "Model Name",
    modelPlaceholder: "e.g. iPhone 14 Pro",
    productName: "Product Name (optional)",
    productNamePlaceholder: "Leave blank if the model name is clear enough",
    overallCondition: "Overall Condition",
    conditionDescriptionLabel: "Tell us about the condition of your device",
    conditionDescriptionPlaceholder:
      "Scratches, cracks, repairs, missing parts, physical damage, other issues...",
    specifications: "Specifications",
    specNamePlaceholder: "Specification Name",
    specValuePlaceholder: "Specification Value",
    removeSpecification: "Remove specification",
    addSpecification: "Add Specification",
    expectedPriceLabel: "Expected Selling Price (ETB)",
    pricePlaceholder: "e.g. 45000",
    priceNegotiable: "Price Negotiable",
    devicePhotos: "Device Photos",
    photosHint:
      "Recommended: front, back, sides, screen, accessories, and any damaged areas.",
    addPhoto: "Add Photo",
    uploading: "Uploading...",
    removePhoto: "Remove photo",
    moveEarlier: "Move earlier",
    moveLater: "Move later",
    telegramIdentity: "TELEGRAM IDENTITY",
    telegramIdentityHint:
      "We use your Telegram account to identify you — no need to type anything here. This is verified securely by our server when you submit.",
    device: "DEVICE",
    price: "PRICE",
    photoCount: "PHOTOS ({count})",
    productNameLabel: "Product Name",
    category: "Category",
    brandLabel: "Brand",
    model: "Model",
    condition: "Condition",
    expectedPrice: "Expected Price",
    negotiable: "Negotiable",
    yes: "Yes",
    no: "No",
    back: "Back",
    next: "Next",
    submitForReview: "Submit Device for Review",
    brandRequired: "Brand is required.",
    modelRequired: "Model name is required.",
    priceRequired: "Expected price must be greater than zero.",
    photoRequired: "At least one device photo is required.",
    uploadFailed: "Image upload failed.",
    submitFailed: "Unable to submit your device.",
  },
  sellRequests: {
    title: "My Sell Requests",
    backToSell: "Back to Sell Device",
    emptyTitle: "No sell requests yet.",
    emptyDescription:
      "Devices you submit for sale will show up here so you can track their status.",
    sellADevice: "Sell a Device",
    expectedPrefix: "Expected:",
    storeOfferPrefix: "Store Offer:",
    acceptOffer: "Accept Offer",
    rejectOffer: "Reject Offer",
    offerAccepted: "Offer accepted.",
    offerRejected: "Offer rejected.",
    unableToRespond: "Unable to respond to this offer.",
  },
  availability: {
    Available: "Available",
    "Low Stock": "Low Stock",
    Sold: "Sold",
    Unavailable: "Unavailable",
    "Out of Stock": "Out of Stock",
  },
  productCategory: {
    All: "All",
    Smartphones: "Smartphones",
    Laptops: "Laptops",
    Tablets: "Tablets",
    Accessories: "Accessories",
    "Smart Watches": "Smart Watches",
    Gaming: "Gaming",
    Other: "Other",
  },
  condition: {
    "Brand New": "Brand New",
    Used: "Used",
    Refurbished: "Refurbished",
  },
  sellCategory: {
    Smartphone: "Smartphone",
    Laptop: "Laptop",
    Tablet: "Tablet",
    "Smart Watch": "Smart Watch",
    "Gaming Device": "Gaming Device",
    Accessory: "Accessory",
    Other: "Other",
  },
  sellCondition: {
    "Like New": "Like New",
    Excellent: "Excellent",
    Good: "Good",
    Fair: "Fair",
    Damaged: "Damaged",
  },
  orderStatus: {
    Pending: "Pending",
    Confirmed: "Confirmed",
    Completed: "Completed",
    Cancelled: "Cancelled",
  },
  sellRequestStatus: {
    Pending: "Pending",
    "Under Review": "Under Review",
    "Offer Sent": "Offer Sent",
    Accepted: "Accepted",
    Rejected: "Rejected",
    Completed: "Completed",
  },
  brand: {
    Other: "Other",
  },
  specLabel: {
    Storage: "Storage",
    RAM: "RAM",
    "Battery Health Percentage": "Battery Health Percentage",
    "Screen Condition": "Screen Condition",
    "Body Condition": "Body Condition",
    "Camera Condition": "Camera Condition",
    "Face ID / Fingerprint Working": "Face ID / Fingerprint Working",
    "Network / SIM Working": "Network / SIM Working",
    "Charging Working": "Charging Working",
    "Accessories Included": "Accessories Included",
    Processor: "Processor",
    Graphics: "Graphics",
    "Screen Size": "Screen Size",
    "Battery Condition": "Battery Condition",
    "Keyboard Condition": "Keyboard Condition",
    "Charger Included": "Charger Included",
    "Operating System": "Operating System",
  },
};

const am: typeof en = {
  language: {
    title: "ቋንቋ",
    english: "English",
    amharic: "አማርኛ",
  },
  nav: {
    home: "መነሻ",
    sell: "ሽጥ",
    favorites: "የተወደዱ",
    orders: "ትዕዛዞች",
  },
  header: {
    greeting: "ሰላም፣ {name} 👋",
  },
  home: {
    heroTitle: "የሚቀጥለውን መሳሪያ ያግኙ",
    heroSubtitle: "በመደብራችን ውስጥ ያሉትን አዳዲስ የኤሌክትሮኒክስ ዕቃዎች ያስሱ።",
    filterByCategory: "በምድብ ያጣሩ",
    telegramUser: "የቴሌግራም ተጠቃሚ",
  },
  search: {
    placeholder: "ምርቶችን ይፈልጉ...",
    clear: "ፍለጋን ያጽዱ",
  },
  product: {
    notFoundTitle: "ምርቱ አልተገኘም።",
    notFoundDescription: "ይህ ምርት ተወግዶ ወይም ከእንግዲህ የማይገኝ ሊሆን ይችላል።",
    backToStore: "ወደ መደብር ተመለስ",
    condition: "ሁኔታ",
    category: "ምድብ",
    specifications: "ዝርዝሮች",
    description: "መግለጫ",
    requestProduct: "ምርቱን ጠይቅ",
    orderNow: "አሁኑኑ ይዘዙ",
    confirmRequest: "ጥያቄዎን ያረጋግጡ",
    confirmOrder: "ትዕዛዝ ያረጋግጡ",
    cancel: "ተወው",
    sendRequest: "ጥያቄ ላክ",
    confirmOrderButton: "ትዕዛዝ አረጋግጥ",
    product: "ምርት",
    price: "ዋጋ",
    yourName: "ስምዎ",
    quantity: "ብዛት",
    total: "ጠቅላላ",
    requestSent: "ጥያቄዎ በተሳካ ሁኔታ ተልኳል!",
    orderPlaced: "ትዕዛዝዎ በተሳካ ሁኔታ ቀርቧል!",
    unableToSendRequest: "ጥያቄ መላክ አልተቻለም።",
    unableToPlaceOrder: "ትዕዛዝ ማስቀመጥ አልተቻለም።",
    noProducts: "በአሁኑ ጊዜ ምንም ምርት የለም።",
    noProductsHint: "የተለየ የፍለጋ ቃል ይሞክሩ ወይም ለአዳዲስ መምጣቶች በኋላ ይመለሱ።",
    emptyName: "ምርት",
    goBack: "ተመለስ",
    previousImage: "የቀደመ ምስል",
    nextImage: "የሚቀጥል ምስል",
    goToImage: "ወደ ምስል {index} ሂድ",
  },
  favorites: {
    title: "የተወደዱ",
    emptyTitle: "እስካሁን የተወደዱ የሉም።",
    emptyDescription: "እዚህ ለማስቀመጥ በማንኛውም ምርት ላይ ያለውን የልብ አዶ ይንኩ።",
    remove: "ከተወደዱ አስወግድ",
    add: "በተወደዱ ውስጥ ጨምር",
  },
  orders: {
    title: "የእኔ ትዕዛዞች",
    emptyTitle: "እስካሁን ምንም ትዕዛዝ የለም።",
    emptyDescription: "የሚያደርጓቸው ትዕዛዞች ሁኔታቸውን ለመከታተል እዚህ ይታያሉ።",
    quantityPrefix: "ብዛት፡",
    totalPrefix: "ጠቅላላ፡",
  },
  sell: {
    title: "መሳሪያዎን ይሽጡ",
    mySubmissions: "የእኔ አቅርቦቶች",
    backToStore: "ወደ መደብር ተመለስ",
    submittedTitle: "መሳሪያው ቀርቧል!",
    submittedDescription:
      "መሳሪያዎ በተሳካ ሁኔታ ቀርቧል። መደብሩ ይመረምረዋል እና በቅርቡ ያገናኝዎታል።",
    review: "ክለሳ",
    step: "ደረጃ {step} ከ {total}",
    reviewAndSubmit: "ክለሳ እና አስገባ",
    step1: "የመሳሪያ መረጃ",
    step2: "የመሳሪያ ሁኔታ",
    step3: "ዝርዝሮች",
    step4: "የሚጠበቅ ዋጋ",
    step5: "የመሳሪያ ፎቶዎች",
    step6: "የእርስዎ መረጃ",
    deviceCategory: "የመሳሪያ ምድብ",
    brand: "ብራንድ",
    brandPlaceholder: "የብራንድ ስም ያስገቡ",
    modelName: "የሞዴል ስም",
    modelPlaceholder: "ለምሳሌ iPhone 14 Pro",
    productName: "የምርት ስም (አማራጭ)",
    productNamePlaceholder: "የሞዴል ስሙ ግልጽ ከሆነ ባዶ ይተዉት",
    overallCondition: "አጠቃላይ ሁኔታ",
    conditionDescriptionLabel: "የመሳሪያዎን ሁኔታ ይንገሩን",
    conditionDescriptionPlaceholder:
      "ጭረቶች፣ ስንጥቆች፣ ጥገናዎች፣ የጎደሉ ክፍሎች፣ አካላዊ ጉዳት፣ ሌሎች ችግሮች...",
    specifications: "ዝርዝሮች",
    specNamePlaceholder: "የዝርዝር ስም",
    specValuePlaceholder: "የዝርዝር ዋጋ",
    removeSpecification: "ዝርዝር አስወግድ",
    addSpecification: "ዝርዝር ጨምር",
    expectedPriceLabel: "የሚጠበቅ የሽያጭ ዋጋ (ETB)",
    pricePlaceholder: "ለምሳሌ 45000",
    priceNegotiable: "ዋጋው የሚደራደር",
    devicePhotos: "የመሳሪያ ፎቶዎች",
    photosHint:
      "የሚመከር፦ ፊት፣ ጀርባ፣ ጎኖች፣ ስክሪን፣ መለዋወጫዎች እና የተጎዱ ቦታዎች።",
    addPhoto: "ፎቶ ጨምር",
    uploading: "በመጫን ላይ...",
    removePhoto: "ፎቶ አስወግድ",
    moveEarlier: "ወደ ፊት አንቀሳቅስ",
    moveLater: "ወደ ኋላ አንቀሳቅስ",
    telegramIdentity: "የቴሌግራም ማንነት",
    telegramIdentityHint:
      "እርስዎን ለመለየት የቴሌግራም መለያዎን እንጠቀማለን — እዚህ ምንም መተየብ አያስፈልገዎትም። ይህ ሲያስገቡ በአገልጋያችን በደህንነት የተረጋገጠ ነው።",
    device: "መሳሪያ",
    price: "ዋጋ",
    photoCount: "ፎቶዎች ({count})",
    productNameLabel: "የምርት ስም",
    category: "ምድብ",
    brandLabel: "ብራንድ",
    model: "ሞዴል",
    condition: "ሁኔታ",
    expectedPrice: "የሚጠበቅ ዋጋ",
    negotiable: "የሚደራደር",
    yes: "አዎ",
    no: "አይ",
    back: "ተመለስ",
    next: "ቀጣይ",
    submitForReview: "ለክለሳ አስገባ",
    brandRequired: "ብራንድ ያስፈልጋል።",
    modelRequired: "የሞዴል ስም ያስፈልጋል።",
    priceRequired: "የሚጠበቅ ዋጋ ከዜሮ በላይ መሆን አለበት።",
    photoRequired: "ቢያንስ አንድ የመሳሪያ ፎቶ ያስፈልጋል።",
    uploadFailed: "ምስል መጫን አልተሳካም።",
    submitFailed: "መሳሪያዎን መላክ አልተቻለም።",
  },
  sellRequests: {
    title: "የእኔ የሽያጭ ጥያቄዎች",
    backToSell: "ወደ መሳሪያ ሽያጭ ተመለስ",
    emptyTitle: "እስካሁን ምንም የሽያጭ ጥያቄ የለም።",
    emptyDescription:
      "ለሽያጭ ያቀረቡት መሳሪያዎች ሁኔታቸውን ለመከታተል እዚህ ይታያሉ።",
    sellADevice: "መሳሪያ ይሽጡ",
    expectedPrefix: "የሚጠበቅ፡",
    storeOfferPrefix: "የመደብር ቅናሽ፡",
    acceptOffer: "ቅናሹን ተቀበል",
    rejectOffer: "ቅናሹን ውድቅ አድርግ",
    offerAccepted: "ቅናሹ ተቀባይነት አግኝቷል።",
    offerRejected: "ቅናሹ ውድቅ ተደርጓል።",
    unableToRespond: "ለዚህ ቅናሽ ምላሽ መስጠት አልተቻለም።",
  },
  availability: {
    Available: "አለ",
    "Low Stock": "አነስተኛ ክምችት",
    Sold: "ተሽጧል",
    Unavailable: "አይገኝም",
    "Out of Stock": "ክምችት የለም",
  },
  productCategory: {
    All: "ሁሉም",
    Smartphones: "ስማርትፎኖች",
    Laptops: "ላፕቶፖች",
    Tablets: "ታብሌቶች",
    Accessories: "መለዋወጫዎች",
    "Smart Watches": "ስማርት ዌቾች",
    Gaming: "ጌሚንግ",
    Other: "ሌላ",
  },
  condition: {
    "Brand New": "አዲስ",
    Used: "ያገለገለ",
    Refurbished: "የታደሰ",
  },
  sellCategory: {
    Smartphone: "ስማርትፎን",
    Laptop: "ላፕቶፕ",
    Tablet: "ታብሌት",
    "Smart Watch": "ስማርት ዌች",
    "Gaming Device": "የጨዋታ መሳሪያ",
    Accessory: "መለዋወጫ",
    Other: "ሌላ",
  },
  sellCondition: {
    "Like New": "አዲስ የሚመስል",
    Excellent: "እጅግ ጥሩ",
    Good: "ጥሩ",
    Fair: "ምክንያታዊ",
    Damaged: "የተጎዳ",
  },
  orderStatus: {
    Pending: "በመጠባበቅ ላይ",
    Confirmed: "የተረጋገጠ",
    Completed: "የተጠናቀቀ",
    Cancelled: "ተሰርዟል",
  },
  sellRequestStatus: {
    Pending: "በመጠባበቅ ላይ",
    "Under Review": "በክለሳ ላይ",
    "Offer Sent": "ቅናሽ ተልኳል",
    Accepted: "ተቀባይነት አግኝቷል",
    Rejected: "ውድቅ ተደርጓል",
    Completed: "የተጠናቀቀ",
  },
  brand: {
    Other: "ሌላ",
  },
  specLabel: {
    Storage: "ማከማቻ",
    RAM: "ራም",
    "Battery Health Percentage": "የባትሪ ጤና መቶኛ",
    "Screen Condition": "የስክሪን ሁኔታ",
    "Body Condition": "አካላዊ ሁኔታ",
    "Camera Condition": "የካሜራ ሁኔታ",
    "Face ID / Fingerprint Working": "ፌስ አይዲ / አሻራ ይሰራል",
    "Network / SIM Working": "ኔትወርክ / ሲም ይሰራል",
    "Charging Working": "ቻርጅ መሙላት ይሰራል",
    "Accessories Included": "መለዋወጫዎች ተካትተዋል",
    Processor: "ፕሮሰሰር",
    Graphics: "ግራፊክስ",
    "Screen Size": "የስክሪን መጠን",
    "Battery Condition": "የባትሪ ሁኔታ",
    "Keyboard Condition": "የቁልፍ ሰሌዳ ሁኔታ",
    "Charger Included": "ቻርጀር ተካቷል",
    "Operating System": "ኦፕሬቲንግ ሲስተም",
  },
};

type Messages = Record<string, unknown>;

function resolveKey(messages: Messages, key: string): string {
  let current: unknown = messages;
  for (const part of key.split(".")) {
    if (typeof current !== "object" || current === null) return key;
    current = (current as Record<string, unknown>)[part];
    if (current === undefined) return key;
  }
  return typeof current === "string" ? current : key;
}

function interpolate(
  text: string,
  params?: Record<string, string | number>
): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}

function detectInitialLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "am") return stored;
  } catch {
    // localStorage unavailable — fall through to Telegram detection.
  }
  const code = getTelegramUser()?.language_code?.toLowerCase() ?? "";
  return code.startsWith("am") ? "am" : "en";
}

interface LanguageContextValue {
  lang: Language;
  setLang: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tv: (prefix: string, value: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLanguage] = useState<Language>("en");

  useEffect(() => {
    setLanguage(detectInitialLanguage());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "am" ? "am" : "en";
  }, [lang]);

  const changeLanguage = useCallback((language: Language) => {
    setLanguage(language);
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Persisting the choice may be unavailable; in-memory language still applies.
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict: Messages = lang === "am" ? am : en;
      let text = resolveKey(dict, key);
      if (text === key) text = resolveKey(en, key);
      if (text === key) return key;
      return interpolate(text, params);
    },
    [lang]
  );

  const tv = useCallback(
    (prefix: string, value: string): string => {
      if (lang === "en") return value;
      const key = `${prefix}.${value}`;
      const translation = resolveKey(am, key);
      return translation === key ? value : translation;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider
      value={{ lang, setLang: changeLanguage, t, tv }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider.");
  }
  return ctx;
}