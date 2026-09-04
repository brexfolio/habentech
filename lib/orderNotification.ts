import { getSupabaseAdmin } from "@/lib/supabase";
import { sendTelegramMessage, sendTelegramMessageWithWebApp } from "@/lib/telegramBot";

export async function notifyCustomerOfOrderStatus(orderId: string, status: string): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();

    const { data: order, error } = await supabase
      .from("orders")
      .select("telegram_user_id, customer_name, quantity, total_price, product:products(name, currency)")
      .eq("id", orderId)
      .single();

    if (error || !order?.telegram_user_id) return;

    const productArr = order.product as unknown as Array<{ name: string; currency: string }> | { name: string; currency: string } | null;
    const product = Array.isArray(productArr) ? productArr[0] : productArr;
    const productName = product?.name?.trim() || "your ordered product";
    const customerName = order.customer_name?.trim() || "there";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

    let message: string;
    switch (status) {
      case "Confirmed":
        message = `✅ <b>Order Confirmed!</b>\n\nHi ${customerName}, your order for <b>${productName}</b> (Qty: ${order.quantity}) has been <b>confirmed</b> by Habentech. We are preparing your item now.`;
        break;
      case "Completed":
        message = `🎉 <b>Order Completed!</b>\n\nHi ${customerName}, your order for <b>${productName}</b> (Qty: ${order.quantity}) is marked as <b>completed</b>. Thank you for shopping with Habentech!`;
        break;
      case "Cancelled":
        message = `❌ <b>Order Status Update</b>\n\nHi ${customerName}, your order for <b>${productName}</b> has been <b>cancelled</b>. If you have any questions, please contact support.`;
        break;
      default:
        message = `ℹ️ <b>Order Status Update</b>\n\nHi ${customerName}, your order for <b>${productName}</b> status is now <b>${status}</b>.`;
    }

    if (appUrl) {
      const ordersUrl = `${appUrl}/orders`;
      await sendTelegramMessageWithWebApp(Number(order.telegram_user_id), message, [
        [{ text: "📦 View My Orders", web_app: { url: ordersUrl } }],
      ]);
    } else {
      await sendTelegramMessage(Number(order.telegram_user_id), message);
    }
  } catch (error) {
    console.error("Failed to notify customer of order status:", error);
  }
}
