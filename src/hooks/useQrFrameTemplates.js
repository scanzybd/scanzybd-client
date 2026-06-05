import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useAxiosSecure from "./useAxiosSecure";
import { API_BASE_URL } from "../config/api";
import { buildFrameCatalog, normalizeFrameTemplate } from "../lib/qrFrameRuntime";
import { LEGACY_QR_FRAMES } from "../lib/qrFrameDefaults";

export function useQrFrameTemplates() {
  return useQuery({
    queryKey: ["qr-frame-templates"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/api/qr/frames`);
      const templates = res.data?.templates;
      if (!Array.isArray(templates) || templates.length === 0) {
        return buildFrameCatalog(LEGACY_QR_FRAMES);
      }
      return buildFrameCatalog(templates);
    },
    staleTime: 60_000,
  });
}

export function useQrFrameTemplatesAdmin() {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey: ["qr-frame-templates-admin"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/qr/frames/admin/all");
      const templates = res.data?.templates || [];
      return templates.map(normalizeFrameTemplate);
    },
    staleTime: 15_000,
  });
}
