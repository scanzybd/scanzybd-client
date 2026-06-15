export const DEFAULT_CONTACT_INFO = {
  phone: "01850000000",
  phoneEnabled: true,
  whatsapp: "01850000000",
  whatsappEnabled: false,
  email: "scanzybd@gmail.com",
  addressLine1: "Dhaka",
  addressLine2: "Bangladesh",
  businessHours: "10 AM – 8 PM (Sat–Thu)",
};

export function formatPhoneDisplay(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 11 && digits.startsWith("01")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return digits;
}

export function phoneTelHref(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 11 && digits.startsWith("0")) {
    return `tel:+88${digits}`;
  }
  return `tel:${digits}`;
}

export function whatsappHref(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  const intl = digits.startsWith("0") ? `88${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
}
