export function formatPrice(price: number, currency = "ETB"): string {
  return `${Number(price).toLocaleString("en-US")} ${currency}`;
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getCustomerDisplayName(user: {
  first_name?: string;
  last_name?: string;
}): string {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || "Telegram User";
}

/** Small helper to keep API route error responses consistent and safe. */
export function apiError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}
