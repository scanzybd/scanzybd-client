import React, { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";

const UserProfile = () => {
    const { user, loading, updateUserProfile } = useAuth();
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setName(user?.displayName ?? "");
    }, [user?.displayName]);

    const handleSaveName = async (e) => {
        e.preventDefault();
        if (!user || saving) return;
        setSaving(true);
        try {
            await updateUserProfile({ displayName: name.trim() || null });
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <p className="py-10 text-center text-slate-600 dark:text-slate-300">Loading...</p>
        );
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] bg-linear-to-b from-slate-100/80 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="mx-auto max-w-xl p-6">
                <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Profile
                </h1>

                <form
                    onSubmit={handleSaveName}
                    className="space-y-4 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/90"
                >
                    <div>
                        <label
                            className="label font-medium text-slate-800 dark:text-slate-200"
                            htmlFor="profile-name"
                        >
                            Name
                        </label>
                        <input
                            id="profile-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="name"
                            className="input input-bordered w-full border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-300"
                        />
                    </div>

                    <div>
                        <label
                            className="label font-medium text-slate-800 dark:text-slate-200"
                            htmlFor="profile-email"
                        >
                            Email
                        </label>
                        <input
                            id="profile-email"
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

                    <button
                        type="submit"
                        className="btn border-0 bg-amber-500 font-semibold text-slate-900 hover:bg-amber-600 disabled:opacity-60 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-600"
                        disabled={saving}
                    >
                    {saving ? "Saving…" : "Save name"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserProfile;
