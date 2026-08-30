const TELEGRAM_API_BASE = "https://api.telegram.org";

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  return token;
}

async function callTelegramApi<T = unknown>(
  method: string,
  payload: Record<string, unknown>
): Promise<T> {
  const token = getBotToken();
  const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Telegram API ${method} failed: ${data.description ?? "unknown error"}`);
  }
  return data.result as T;
}

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export interface SendMessageResult {
  message_id: number;
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options: {
    parseMode?: "HTML" | "MarkdownV2";
    replyMarkup?: { inline_keyboard: InlineKeyboardButton[][] };
  } = {}
): Promise<SendMessageResult> {
  return callTelegramApi<SendMessageResult>("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: options.parseMode ?? "HTML",
    reply_markup: options.replyMarkup,
    disable_web_page_preview: true,
  });
}

export interface SendPhotoResult {
  message_id: number;
}

export async function sendTelegramPhoto(
  chatId: string | number,
  photo: string,
  caption: string,
  options: {
    parseMode?: "HTML" | "MarkdownV2";
    replyMarkup?: { inline_keyboard: InlineKeyboardButton[][] };
  } = {}
): Promise<SendPhotoResult> {
  return callTelegramApi<SendPhotoResult>("sendPhoto", {
    chat_id: chatId,
    photo,
    caption,
    parse_mode: options.parseMode ?? "HTML",
    reply_markup: options.replyMarkup,
  });
}

export interface MediaGroupItem {
  type: "photo";
  media: string;
  caption?: string;
  parse_mode?: "HTML" | "MarkdownV2";
}

export interface MediaGroupMessage {
  message_id: number;
}

export async function sendTelegramMediaGroup(
  chatId: string | number,
  media: MediaGroupItem[]
): Promise<MediaGroupMessage[]> {
  return callTelegramApi<MediaGroupMessage[]>("sendMediaGroup", {
    chat_id: chatId,
    media,
  });
}

export async function editTelegramMessageCaption(
  chatId: string | number,
  messageId: string | number,
  caption: string,
  options: {
    parseMode?: "HTML" | "MarkdownV2";
    replyMarkup?: { inline_keyboard: InlineKeyboardButton[][] };
  } = {}
): Promise<void> {
  await callTelegramApi("editMessageCaption", {
    chat_id: chatId,
    message_id: messageId,
    caption,
    parse_mode: options.parseMode ?? "HTML",
    reply_markup: options.replyMarkup,
  });
}

export async function editTelegramMessageText(
  chatId: string | number,
  messageId: string | number,
  text: string,
  options: {
    parseMode?: "HTML" | "MarkdownV2";
    replyMarkup?: { inline_keyboard: InlineKeyboardButton[][] };
  } = {}
): Promise<void> {
  await callTelegramApi("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: options.parseMode ?? "HTML",
    reply_markup: options.replyMarkup,
  });
}

export async function deleteTelegramMessage(
  chatId: string | number,
  messageId: string | number
): Promise<void> {
  try {
    await callTelegramApi("deleteMessage", { chat_id: chatId, message_id: messageId });
  } catch {
    // Message may already be deleted or too old to delete — safe to ignore.
  }
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
): Promise<void> {
  try {
    await callTelegramApi("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      text,
    });
  } catch {
    // Non-critical — ignore failures acknowledging the callback.
  }
}

export async function setTelegramWebhook(url: string, secretToken: string): Promise<void> {
  await callTelegramApi("setWebhook", {
    url,
    secret_token: secretToken,
    allowed_updates: ["message", "callback_query"],
  });
}

export interface BotCommand {
  command: string;
  description: string;
}

export type BotCommandScope =
  | { type: "default" }
  | { type: "all_private_chats" }
  | { type: "chat"; chat_id: string | number };

export async function setTelegramMyCommands(
  commands: BotCommand[],
  scope: BotCommandScope
): Promise<void> {
  await callTelegramApi("setMyCommands", { commands, scope });
}

export async function setTelegramChatMenuButtonToCommands(): Promise<void> {
  await callTelegramApi("setChatMenuButton", { menu_button: { type: "commands" } });
}
