import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import { normalizeTagTypesList } from "../lib/tagTypeUtils";

export default function useTagTypes() {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["tag-types"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/tag-types");
      return normalizeTagTypesList(res.data);
    },
    staleTime: 10 * 60 * 1000,
  });
}
