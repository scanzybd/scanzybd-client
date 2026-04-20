import React from "react";
import useAuth from "../../../hooks/useAuth";

const UserSettings = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <p className="py-10 text-center text-slate-600 dark:text-slate-300">Loading...</p>
        );
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] bg-linear-to-b from-slate-100/80 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="mx-auto max-w-xl p-6">
                <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Settings
                </h1>

                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
                    <div>
                        <label
                            className="label font-medium text-slate-800 dark:text-slate-200"
                            htmlFor="settings-email"
                        >
                            Email
                        </label>
                        <input
                            id="settings-email"
                            type="email"
                            readOnly
                            autoComplete="email"
                            value={user?.email ?? ""}
                            aria-readonly="true"
                            className="input input-bordered w-full cursor-not-allowed border-slate-200 bg-slate-100 text-slate-700 focus:border-slate-300 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Email is tied to your account and cannot be edited
                            here.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;
