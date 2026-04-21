import React, { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Car, QrCode, Search, UserRound, Phone, Shield } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import useMongoProfile from "../../../hooks/useMongoProfile";
import SmartLoader from "../../../components/SmartLoader";

const AllVehiclePage = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const { data: mongoUser } = useMongoProfile();

  const [search, setSearch] = React.useState("");

  const {
    data: vehicles = [],
    isLoading: vehiclesLoading,
    isError: vehiclesError,
  } = useQuery({
    queryKey: ["dashboard", "vehicles", "all"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/vehicle");
      return res.data.data || [];
    },
    staleTime: 30_000,
  });

  const qrIds = useMemo(
    () => [...new Set(vehicles.map((v) => v.qrData).filter(Boolean))],
    [vehicles]
  );

  const qrQueries = useQueries({
    queries: qrIds.map((id) => ({
      queryKey: ["qr", "detail", id],
      queryFn: async () => {
        const r = await axiosSecure.get(`/api/qr/id/${id}`);
        return r.data;
      },
      staleTime: 120_000,
      enabled: Boolean(id),
    })),
  });

  const qrMap = useMemo(() => {
    const map = {};
    qrQueries.forEach((q) => {
      const d = q.data;
      if (d?._id) map[d._id] = d;
    });
    return map;
  }, [qrQueries]);

  const qrStillLoading = qrQueries.some((q) => q.isPending);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) =>
      `${v.vehicleName} ${v.model} ${v.plate}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [vehicles, search]);

  return (
    <div className="min-h-[60vh]">
      <div className="mb-8 flex flex-col gap-4 border-b border-slate-200/90 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Car className="h-3.5 w-3.5" />
            Fleet
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            All vehicles
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {mongoUser?.role === "admin" ? "Admin view" : "Directory"} ·{" "}
            <span className="font-medium text-slate-800">{user?.email}</span>
          </p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, model, plate..."
            className="input input-bordered w-full rounded-xl border-slate-200 bg-white pl-10 pr-4 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {vehiclesLoading && (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <SmartLoader label="Loading vehicles..." />
        </div>
      )}

      {vehiclesError && !vehiclesLoading && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Could not load vehicles. Try refreshing.
        </p>
      )}

      {!vehiclesLoading && !vehiclesError && filteredVehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center">
          <Car className="h-12 w-12 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700">No vehicles match</p>
          <p className="mt-1 text-sm text-slate-500">
            {vehicles.length === 0
              ? "No vehicles registered yet."
              : "Try a different search."}
          </p>
        </div>
      )}

      {!vehiclesLoading && !vehiclesError && filteredVehicles.length > 0 && (
        <ul className="grid gap-4 lg:grid-cols-2">
          {filteredVehicles.map((v) => {
            const qr = qrMap[v.qrData];

            return (
              <li
                key={v._id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-emerald-200/80 hover:shadow-md sm:flex-row sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{v.vehicleName}</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {v.model}
                    </span>
                  </div>
                  <p className="font-mono text-sm text-emerald-700">{v.plate}</p>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                        v.qrData
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      <QrCode className="h-3 w-3" />
                      {v.qrData ? "QR assigned" : "No QR"}
                    </span>
                  </div>

                  <div className="space-y-1 border-t border-slate-100 pt-3 text-sm">
                    <p className="flex items-center gap-2 text-slate-700">
                      <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="font-medium">{v.owner?.name || "—"}</span>
                      <span className="truncate text-slate-500">{v.owner?.email}</span>
                    </p>
                    {v.driver ? (
                      <p className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                        {v.driver.name}{" "}
                        <span className="text-slate-500">({v.driver.phone})</span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">No driver linked</p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:w-[120px]">
                  {v.qrData && !qr && qrStillLoading ? (
                    <div className="flex h-[88px] w-[88px] flex-col items-center justify-center gap-1 rounded-lg bg-white">
                      <span className="loading loading-spinner loading-sm text-emerald-600" />
                      <span className="text-[9px] text-slate-400">QR…</span>
                    </div>
                  ) : qr?.qrCode ? (
                    <>
                      <img
                        src={qr.qrCode}
                        alt=""
                        className="h-[88px] w-[88px] rounded-lg bg-white object-contain"
                        loading="lazy"
                      />
                      <p className="mt-2 max-w-[100px] truncate text-center text-[10px] text-slate-500">
                        {qr.code}
                      </p>
                    </>
                  ) : v.qrData ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=88x88&data=${encodeURIComponent(v.qrData)}`}
                      alt=""
                      className="h-[88px] w-[88px] rounded-lg"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-slate-400">
                      <Shield className="h-6 w-6" />
                      <span className="mt-1 text-[10px]">No QR</span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AllVehiclePage;
