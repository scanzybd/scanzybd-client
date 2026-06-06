import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { FaTiktok } from "react-icons/fa";

export const SOCIAL_PLATFORMS = [
  { id: "facebook", label: "Facebook", Icon: Facebook },
  { id: "instagram", label: "Instagram", Icon: Instagram },
  { id: "tiktok", label: "TikTok", Icon: FaTiktok },
  { id: "twitter", label: "Twitter / X", Icon: Twitter },
  { id: "linkedin", label: "LinkedIn", Icon: Linkedin },
];

export const DEFAULT_SOCIAL_LINKS = {
  facebook: {
    url: "https://www.facebook.com/people/Scanzybd/61589104403859/",
    enabled: true,
  },
  instagram: {
    url: "https://www.instagram.com/scanzybdofficial",
    enabled: true,
  },
  tiktok: {
    url: "https://www.tiktok.com/@scanzybd",
    enabled: true,
  },
  twitter: { url: "", enabled: false },
  linkedin: { url: "", enabled: false },
};

export function buildFooterSocialLinks(social) {
  const data = social || DEFAULT_SOCIAL_LINKS;
  return SOCIAL_PLATFORMS.map((p) => {
    const row = data[p.id] || {};
    return {
      id: p.id,
      label: p.label,
      Icon: p.Icon,
      href: String(row.url || "").trim(),
      enabled: row.enabled !== false && Boolean(String(row.url || "").trim()),
    };
  }).filter((x) => x.enabled);
}
