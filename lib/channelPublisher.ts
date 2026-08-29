import type { Product } from "@/types/product";
import { getSupabaseAdmin } from "./supabase";
import {
  sendTelegramMessage,
  sendTelegramPhoto,
  sendTelegramMediaGroup,
  editTelegramMessageCaption,
  editTelegramMessageText,
  deleteTelegramMessage,
  type InlineKeyboardButton,
} from "./telegramBot";

export interface ChannelPublishResult {
  success: boolean;
  channelId?: string;
  messageId?: string;
  mediaMessageIds?: string[];
  error?: string;
}

/**
 * Resolves which Telegram channel to publish to: the value stored
 * in `store_settings.telegram_channel` takes priority (editable by
 * the admin from Settings), falling back to the TELEGRAM_CHANNEL_ID
 * environment variable.
 */
export async function resolveChannelId(): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("store_settings")
      .select("telegram_channel")
      .limit(1)
      .maybeSingle();
    if (data?.telegram_channel) return data.telegram_channel;
  } catch {
    // Fall through to env var.
  }
  return process.env.TELEGRAM_CHANNEL_ID ?? null;
}

/**
 * Builds the deep link used by the "View Product" button. When the
 * bot username and Mini App short name are configured, this opens
 * the product directly inside the Telegram Mini App. Otherwise it
 * falls back to a plain web link to the hosted product page.
 */
export function createProductLink(product: Pick<Product, "id">): string {
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const appName = process.env.NEXT_PUBLIC_TELEGRAM_APP_NAME;
  const startParam = `product_${product.id}`;

  if (botUsername && appName) {
    return `https://t.me/${botUsername}/${appName}?startapp=${startParam}`;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${baseUrl}/products/${product.id}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Formats the HTML caption/message body used for the channel post.
 */
export function formatProductMessage(product: Product): string {
  const lines: string[] = [];

  lines.push(`📱 <b>${escapeHtml(product.name)}</b>`);
  lines.push("");
  lines.push(`💰 Price: <b>${Number(product.price).toLocaleString()} ${product.currency}</b>`);
  lines.push(`📂 Category: ${escapeHtml(product.category)}`);
  lines.push(`✨ Condition: ${escapeHtml(product.condition)}`);

  const specs = product.specifications ?? [];
  if (specs.length > 0) {
    lines.push("");
    lines.push("📦 Specifications:");
    for (const spec of specs) {
      lines.push(`• ${escapeHtml(spec.label)}: ${escapeHtml(spec.value)}`);
    }
  }

  lines.push("");
  const availabilityEmoji = product.availability === "Available" ? "🟢" : "🔴";
  lines.push(`${availabilityEmoji} ${escapeHtml(product.availability)}`);

  if (product.description) {
    lines.push("");
    lines.push(escapeHtml(product.description));
  }

  return lines.join("\n");
}

function buildViewProductKeyboard(product: Product): { inline_keyboard: InlineKeyboardButton[][] } {
  return {
    inline_keyboard: [[{ text: "🛍 View Product", url: createProductLink(product) }]],
  };
}

/**
 * Publishes a product to the configured public Telegram channel.
 * Uses `sendPhoto` for a single image, `sendMediaGroup` for
 * multiple images (Telegram media groups do not support inline
 * keyboards, so a short follow-up message carries the "View
 * Product" button), and a plain text message when there are no
 * images at all. Reuses existing Telegram `file_id`s when present
 * instead of re-uploading images.
 */
export async function publishProductToChannel(product: Product): Promise<ChannelPublishResult> {
  const channelId = await resolveChannelId();
  if (!channelId) {
    return { success: false, error: "No Telegram channel configured." };
  }

  const caption = formatProductMessage(product);
  const keyboard = buildViewProductKeyboard(product);
  const images = [...(product.images ?? [])].sort((a, b) => a.display_order - b.display_order);

  try {
    if (images.length === 0) {
      const result = await sendTelegramMessage(channelId, caption, { replyMarkup: keyboard });
      return {
        success: true,
        channelId,
        messageId: String(result.message_id),
        mediaMessageIds: [String(result.message_id)],
      };
    }

    if (images.length === 1) {
      const media = images[0].telegram_file_id || images[0].image_url;
      const result = await sendTelegramPhoto(channelId, media, caption, { replyMarkup: keyboard });
      return {
        success: true,
        channelId,
        messageId: String(result.message_id),
        mediaMessageIds: [String(result.message_id)],
      };
    }

    const mediaGroup = images.map((image, index) => ({
      type: "photo" as const,
      media: image.telegram_file_id || image.image_url,
      ...(index === 0 ? { caption, parse_mode: "HTML" as const } : {}),
    }));

    const groupResults = await sendTelegramMediaGroup(channelId, mediaGroup);
    const mediaMessageIds = groupResults.map((r) => String(r.message_id));

    const buttonMessage = await sendTelegramMessage(channelId, `📱 ${product.name}`, {
      replyMarkup: keyboard,
    });

    return {
      success: true,
      channelId,
      messageId: String(buttonMessage.message_id),
      mediaMessageIds: [...mediaMessageIds, String(buttonMessage.message_id)],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown Telegram error.",
    };
  }
}

/**
 * Updates an existing channel post after the product was edited.
 * Simple text/single-photo posts are edited in place. Multi-image
 * posts (media groups) cannot be swapped atomically via the Bot
 * API, so the old messages are deleted and the product is
 * republished as a new post — the new IDs are returned so the
 * caller can persist them and avoid duplicate posts on next edit.
 */
export async function updateChannelProduct(product: Product): Promise<ChannelPublishResult> {
  if (!product.channel_published || !product.telegram_channel_id || !product.telegram_channel_message_id) {
    return publishProductToChannel(product);
  }

  const channelId = product.telegram_channel_id;
  const images = [...(product.images ?? [])].sort((a, b) => a.display_order - b.display_order);
  const mediaMessageIds = product.telegram_channel_media_message_ids ?? [];
  const wasSinglePost = mediaMessageIds.length <= 1;

  try {
    if (wasSinglePost && images.length <= 1) {
      const caption = formatProductMessage(product);
      const keyboard = buildViewProductKeyboard(product);

      if (images.length === 1) {
        await editTelegramMessageCaption(channelId, product.telegram_channel_message_id, caption, {
          replyMarkup: keyboard,
        });
      } else {
        await editTelegramMessageText(channelId, product.telegram_channel_message_id, caption, {
          replyMarkup: keyboard,
        });
      }

      return {
        success: true,
        channelId,
        messageId: product.telegram_channel_message_id,
        mediaMessageIds: [product.telegram_channel_message_id],
      };
    }

    // Structure changed (image count crossed a single/multi boundary)
    // or it was already a media group — safest path is delete + repost.
    await deleteChannelMessages(channelId, mediaMessageIds);
    return publishProductToChannel(product);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown Telegram error.",
    };
  }
}

async function deleteChannelMessages(channelId: string, messageIds: string[]): Promise<void> {
  const unique = Array.from(new Set(messageIds));
  await Promise.all(unique.map((id) => deleteTelegramMessage(channelId, id)));
}

const PRODUCT_SELECT = "*, images:product_images(*), specifications:product_specifications(*)";

/**
 * Fetches a product by ID, publishes it (or refreshes its existing
 * post) to the Telegram channel, persists the resulting channel
 * fields on the row, and returns the up-to-date product. Shared by
 * the automatic publish-on-create flow and the manual retry routes.
 */
export async function publishProductById(
  productId: string
): Promise<{ product: Product; warning: string | null }> {
  const supabase = getSupabaseAdmin();

  const { data: product, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", productId)
    .single();

  if (error || !product) {
    throw new Error("Product not found.");
  }

  const result = product.channel_published
    ? await updateChannelProduct(product as Product)
    : await publishProductToChannel(product as Product);

  let warning: string | null = null;

  if (result.success) {
    await supabase
      .from("products")
      .update({
        channel_published: true,
        telegram_channel_id: result.channelId,
        telegram_channel_message_id: result.messageId,
        telegram_channel_media_message_ids: result.mediaMessageIds,
        channel_published_at: new Date().toISOString(),
      })
      .eq("id", productId);
  } else {
    warning = result.error ?? "Failed to publish to the Telegram channel.";
  }

  const { data: finalProduct } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", productId)
    .single();

  return { product: (finalProduct ?? product) as Product, warning };
}

/**
 * Deletes all Telegram messages associated with a product's
 * channel post (used when an admin deletes a product and opts to
 * also remove its channel post).
 */
export async function deleteChannelPost(product: Product): Promise<ChannelPublishResult> {
  if (!product.telegram_channel_id) {
    return { success: false, error: "Product was never published to a channel." };
  }

  const ids = product.telegram_channel_media_message_ids?.length
    ? product.telegram_channel_media_message_ids
    : product.telegram_channel_message_id
      ? [product.telegram_channel_message_id]
      : [];

  await deleteChannelMessages(product.telegram_channel_id, ids);
  return { success: true, channelId: product.telegram_channel_id };
}
