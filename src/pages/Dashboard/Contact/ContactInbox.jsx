import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MailOpen, RefreshCcw } from "lucide-react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import SmartLoader from "../../../components/SmartLoader";

const formatDateTime = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
};

const ContactInbox = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const {
    data: messages = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["contact-inbox"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/contact");
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const toggleStatus = async (msg) => {
    const nextStatus = msg.status === "read" ? "unread" : "read";
    try {
      await axiosSecure.patch(`/api/contact/${msg._id}/status`, {
        status: nextStatus,
      });
      await queryClient.invalidateQueries({ queryKey: ["contact-inbox"] });
    } catch (error) {
      Swal.fire("Failed", error?.response?.data?.message || "Could not update status", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <SmartLoader label="Loading messages..." />
      </div>
    );
  }

  const unreadCount = messages.filter((m) => m.status !== "read").length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Contact Messages</h1>
            <p className="mt-1 text-sm text-slate-600">
              Read customer messages and mark read/unread.
            </p>
          </div>
          <button type="button" onClick={() => refetch()} className="btn rounded-xl">
            <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        <p className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
          Unread: {unreadCount}
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 py-14 text-center">
          <Mail className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-600">No contact messages yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => {
            const isRead = msg.status === "read";
            return (
              <article
                key={msg._id}
                className={`rounded-2xl border p-5 shadow-sm ${
                  isRead ? "border-slate-200 bg-white" : "border-emerald-200 bg-emerald-50/30"
                }`}
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{msg.name}</p>
                    <p className="text-xs text-slate-500">{msg.email}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(msg.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleStatus(msg)}
                    className={`btn btn-sm rounded-xl ${
                      isRead
                        ? "border-slate-300 bg-white text-slate-700"
                        : "border-emerald-300 bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                    Mark as {isRead ? "unread" : "read"}
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{msg.message}</p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContactInbox;
