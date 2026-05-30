import { connectDB } from "@/src/lib/db";
import productModel from "@/src/models/Product";
import stockAlertModel from "@/src/models/StockAlert";
import { Resend } from "resend";
import { MAIL_FROM, mailTo } from "@/src/services/email";
import { renderBackInStockEmail } from "@/src/lib/emailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "";

/**
 * Compare a product's stock BEFORE and AFTER an admin update and return what
 * just came back in stock:
 *  - restockedSizes: sizes that went from 0 → >0
 *  - overallRestocked: total stock went from 0 → >0 (covers non-sized products
 *    and "any variant" alerts)
 */
export function diffRestock(
  before: { stock?: number; sizeStock?: { size: string; stock: number }[] },
  after: { stock?: number; sizeStock?: { size: string; stock: number }[] },
): { restockedSizes: string[]; overallRestocked: boolean } {
  const beforeBySize = new Map(
    (before.sizeStock ?? []).map((s) => [s.size, s.stock ?? 0]),
  );
  const restockedSizes: string[] = [];
  for (const s of after.sizeStock ?? []) {
    const old = beforeBySize.get(s.size) ?? 0;
    if (old <= 0 && (s.stock ?? 0) > 0) restockedSizes.push(s.size);
  }
  const overallRestocked = (before.stock ?? 0) <= 0 && (after.stock ?? 0) > 0;
  return { restockedSizes, overallRestocked };
}

/**
 * Email everyone waiting on this product (matching the restocked sizes, plus
 * any "any variant" waiters when the overall stock returns) and clear those
 * alerts. Emails are AWAITED so they actually send on serverless. Best-effort:
 * a failure here must never break the product save that triggered it.
 */
export async function fulfillStockAlerts(
  productId: string,
  restock: { restockedSizes: string[]; overallRestocked: boolean },
): Promise<void> {
  const { restockedSizes, overallRestocked } = restock;
  if (restockedSizes.length === 0 && !overallRestocked) return;

  await connectDB();

  const or: Record<string, unknown>[] = [];
  if (restockedSizes.length) or.push({ size: { $in: restockedSizes } });
  if (overallRestocked) or.push({ size: "" });
  if (or.length === 0) return;

  const alerts = await stockAlertModel.find({ product: productId, $or: or }).lean();
  if (alerts.length === 0) return;

  const product: any = await productModel
    .findById(productId)
    .select("name slug image")
    .lean();
  if (!product) return;

  const url = SITE ? `${SITE}/product/${product.slug ?? productId}` : "";

  for (const alert of alerts as any[]) {
    try {
      await resend.emails.send({
        from: MAIL_FROM,
        to: mailTo(alert.email),
        subject: `${product.name} is back in stock`,
        html: renderBackInStockEmail({
          productName: product.name,
          url,
          size: alert.size || "",
          color: alert.color || "",
          image: product.image || "",
        }),
      });
    } catch (e) {
      console.error("Back-in-stock email error:", e);
    }
  }

  // Clear the alerts we just (attempted to) notify, so re-subscribing works.
  const ids = (alerts as any[]).map((a) => a._id);
  await stockAlertModel.deleteMany({ _id: { $in: ids } });
}
