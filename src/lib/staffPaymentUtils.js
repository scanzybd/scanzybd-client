/** Staff create-order payment helpers */

export const STAFF_PAYMENT_IDS = {
  CASH: "cash",
  BKASH_MANUAL: "bkash_manual",
  BKASH_ONLINE: "bkash_online",
  SSL_ONLINE: "sslcommerz_online",
};

export function isStaffOnlinePayment(method) {
  return (
    method === STAFF_PAYMENT_IDS.BKASH_ONLINE ||
    method === STAFF_PAYMENT_IDS.SSL_ONLINE
  );
}

export function getStaffPaymentRedirect(data) {
  return data?.redirectURL || data?.bkashURL || null;
}

export function buildStaffPaymentOptions(gateways) {
  const options = [
    { id: STAFF_PAYMENT_IDS.CASH, label: "Cash" },
    { id: STAFF_PAYMENT_IDS.BKASH_MANUAL, label: "Manual bKash" },
  ];
  if (gateways?.bkash) {
    options.push({ id: STAFF_PAYMENT_IDS.BKASH_ONLINE, label: "bKash Online" });
  }
  if (gateways?.sslcommerz) {
    options.push({
      id: STAFF_PAYMENT_IDS.SSL_ONLINE,
      label: "SSL Commerz",
    });
  }
  return options;
}

export function staffSubmitButtonLabel(method, loading) {
  if (loading) return "Processing...";
  if (isStaffOnlinePayment(method)) return "Create order & pay online";
  return "Create order";
}
