import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

export default function usePaymentGateways() {
  return useQuery({
    queryKey: ["payment-gateways"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/api/payment/gateways`, {
        params: { _t: Date.now() },
      });
      return res.data?.gateways ?? {
        bkash: true,
        sslcommerz: false,
        manualBkash: false,
        manualBkashConfig: null,
        defaultGateway: "bkash",
        enabled: ["bkash"],
        hasOnlinePayment: true,
        hasAnyPayment: true,
      };
    },
    staleTime: 0,
    refetchOnMount: "always",
  });
}
