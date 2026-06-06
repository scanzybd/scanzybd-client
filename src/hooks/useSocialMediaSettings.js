import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { DEFAULT_SOCIAL_LINKS } from "../lib/socialMediaConfig";

export function usePublicSocialMedia() {
  return useQuery({
    queryKey: ["social-media-public"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/api/settings/social-media`);
      return res.data?.social || DEFAULT_SOCIAL_LINKS;
    },
    staleTime: 120_000,
  });
}
