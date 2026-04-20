import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

/** Shared /api/auth/me — cached; use on dashboard pages instead of duplicate useEffect fetches */
export default function useMongoProfile(enabled = true) {
  const axiosSecure = useAxiosSecure();

  return useQuery({
    queryKey: ["auth", "mongo-profile"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/auth/me");
      return res.data;
    },
    staleTime: 5 * 60_000,
    enabled,
  });
}
