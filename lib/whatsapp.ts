// lib/whatsapp.ts
// أدوات مشتركة لإرسال رسائل تأكيد الطلب عبر واتساب (wa.me)

/**
 * تحويل الرقم المصري للصيغة الدولية المطلوبة في روابط wa.me
 *
 *  01012345678    →  201012345678
 *  +20 101 234 5678 →  201012345678
 *  00201012345678 →  201012345678
 *
 * بيرجّع null لو الرقم مش صالح، عشان نقدر نخفي الزرار بدل ما نفتح رابط غلط.
 */
export function normalizeEgyptianPhone(phone?: string | null): string | null {
    if (!phone) return null;

    // شيل أي رموز أو مسافات أو شرطات
    let cleaned = String(phone).replace(/\D/g, "");

    if (!cleaned) return null;

    // 00201... → 201...
    if (cleaned.startsWith("00")) cleaned = cleaned.slice(2);

    // 01... → 201...
    if (cleaned.startsWith("0")) cleaned = "20" + cleaned.slice(1);

    // 1012345678 → 201012345678
    if (!cleaned.startsWith("20")) cleaned = "20" + cleaned;

    // الرقم المصري الصحيح: 20 + 10 أرقام = 12 رقم
    return cleaned.length === 12 ? cleaned : null;
}

/**
 * استخراج رقم العميل من الطلب.
 * deliveryInfo.phone هو الحقل المعتمد، والباقي احتياطي
 * (لطلبات قديمة أو طلبات الزوار).
 */
export function getOrderPhone(order: any): string | null {
    const raw =
        order?.deliveryInfo?.phone ||
        order?.deliveryInfo?.phoneNumber ||
        order?.buyer?.phone ||
        order?.guestPhone ||
        null;

    return normalizeEgyptianPhone(raw);
}

/** تحويل كود اللون لاسم عربي مفهوم للعميل */
export function getArabicColorName(color?: any): string {
    if (!color) return "";

    // اللون ممكن يكون string أو object فيه name/value
    const value =
        typeof color === "string" ? color : color.name || color.value || "";

    if (!value) return "";

    const colorMap: Record<string, string> = {
        "#000000": "أسود",
        "#ffffff": "أبيض",
        "#ff0000": "أحمر",
        "#0000ff": "أزرق",
        "#808080": "رمادي",
        "#ffff00": "أصفر",
        "#008000": "أخضر",
        "#ffc0cb": "وردي",
        "#a52a2a": "بني",
        "#f5f5dc": "بيج",
        "#ffa500": "برتقالي",
        "#800080": "بنفسجي",
        "#c0c0c0": "فضي",
        "#ffd700": "ذهبي",
    };

    return colorMap[value.toLowerCase()] || value;
}

/** استخراج عنوان التسليم سواء توصيل منزل أو استلام من نقطة */
export function getOrderAddress(order: any): string {
    if (order?.deliveryMethod === "home") {
        return order?.deliveryInfo?.address || "";
    }

    return (
        order?.deliveryInfo?.pickupPoint?.address ||
        order?.deliveryInfo?.pickupPoint?.stationName ||
        order?.deliveryInfo?.address ||
        ""
    );
}

/**
 * بناء نص رسالة تأكيد الطلب.
 * بيشتغل مع شكل الطلب في لوحة الأدمن وصفحة تفاصيل الطلب.
 */
export function buildOrderConfirmationMessage(order: any): string {
    if (!order) return "";

    const productsText = (order.items || [])
        .map((item: any) => {
            const productName = item?.product?.title || "المنتج";
            const color = getArabicColorName(item?.color);
            const size = item?.size;

            const lines = [
                productName,
                color ? `اللون: ${color}` : null,
                size ? `المقاس: ${size}` : null,
                `الكمية: ${item?.quantity ?? 1}`,
            ].filter(Boolean);

            return lines.join("\n");
        })
        .join("\n\n");

    const address = getOrderAddress(order);
    const orderRef = order.orderNumber || order._id?.slice(0, 8) || "";

    return `السلام عليكم ورحمة الله وبركاته،

مع حضرتك فريق MIRVORY.

بنأكد لحضرتك طلبك رقم ${orderRef} الخاص بـ:

${productsText}

إجمالي الطلب: ${order.total} جنيه شامل الشحن.

العنوان: ${address}

برجاء تأكيد الطلب بالرد على الرسالة بـ "تأكيد"، وسيتم البدء في تجهيزه للشحن.
لو فيه أي استفسار من حضرتك إحنا مع حضرتك.

شكرًا لثقتك في MIRVORY.`;
}

/**
 * بناء رابط wa.me جاهز للفتح.
 * بيرجّع null لو مفيش رقم صالح.
 */
export function buildWhatsAppUrl(order: any, customMessage?: string): string | null {
    const to = getOrderPhone(order);
    if (!to) return null;

    const message = customMessage ?? buildOrderConfirmationMessage(order);

    return `https://wa.me/${to}?text=${encodeURIComponent(message)}`;
}

/**
 * فتح واتساب برسالة التأكيد.
 * على الموبايل بيفتح تطبيق واتساب، وعلى الديسكتوب بيفتح WhatsApp Web.
 * بيرجّع false لو الرقم غير صالح عشان نعرض رسالة خطأ.
 */
export function openWhatsAppConfirmation(order: any, customMessage?: string): boolean {
    const url = buildWhatsAppUrl(order, customMessage);
    if (!url) return false;

    window.open(url, "_blank", "noopener,noreferrer");
    return true;
}