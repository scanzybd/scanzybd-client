import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { DEFAULT_CONTACT_INFO } from "../lib/contactInfoConfig";

export function usePublicContactInfo() {
  return useQuery({
    queryKey: ["contact-info-public"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/api/settings/contact`);
      return res.data?.contact || DEFAULT_CONTACT_INFO;
    },
    staleTime: 120_000,
  });
}
