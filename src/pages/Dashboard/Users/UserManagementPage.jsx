import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Search, UserPlus, Building2, Users, Shield, Pencil, Save, X } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import SmartLoader from "../../../components/SmartLoader";

const roleBadge = (role) => {
    const base = "rounded-full px-2.5 py-0.5 text-xs font-semibold";
    if (role === "admin") return `${base} bg-violet-100 text-violet-800`;
    if (role === "provider") return `${base} bg-sky-100 text-sky-800`;
    return `${base} bg-slate-100 text-slate-700`;
};

const UserManagementPage = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();

    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [error, setError] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editRole, setEditRole] = useState("user");

    const load = useCallback(async () => {
        setError(null);
        try {
            const params = {};
            if (search.trim()) params.search = search.trim();
            if (roleFilter) params.role = roleFilter;
            const res = await axiosSecure.get("/api/users", { params });
            setList(res.data?.data || []);
        } catch (e) {
            setError(e.response?.data?.message || "Could not load users.");
            setList([]);
        } finally {
            setLoading(false);
        }
    }, [axiosSecure, search, roleFilter]);

    useEffect(() => {
        const t = setTimeout(() => {
            load();
        }, 300);
        return () => clearTimeout(t);
    }, [load]);

    const currentEmail = user?.email?.toLowerCase() || "";

    const toggleActive = async (row) => {
        const isOn = row.isActive !== false;
        if (row.email?.toLowerCase() === currentEmail && isOn) {
            return;
        }
        const next = !isOn;
        setBusyId(row._id);
        try {
            await axiosSecure.patch(`/api/users/${row._id}`, { isActive: next });
            await load();
        } catch (e) {
            alert(e.response?.data?.message || "Update failed.");
        } finally {
            setBusyId(null);
        }
    };

    const counts = useMemo(() => {
        const c = { admin: 0, provider: 0, user: 0 };
        list.forEach((u) => {
            if (c[u.role] !== undefined) c[u.role] += 1;
        });
        return c;
    }, [list]);

    const startEdit = (row) => {
        setEditingId(row._id);
        setEditName(row.name || "");
        setEditRole(row.role || "user");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
        setEditRole("user");
    };

    const saveEdit = async (row) => {
        const name = editName.trim();
        const role = editRole;
        const isActive = row.isActive !== false;
        if (!name) {
            alert("Name is required.");
            return;
        }
        setBusyId(row._id);
        try {
            await axiosSecure.patch(`/api/users/${row._id}`, { name, role, isActive });
            await load();
            cancelEdit();
        } catch (e) {
            alert(e.response?.data?.message || "User edit failed.");
        } finally {
            setBusyId(null);
        }
    };

    if (loading && list.length === 0 && !error) {
        return <SmartLoader fullPage label="Loading users..." />;
    }

    return (
        <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-4 border-b border-slate-200/90 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        <Users className="h-3.5 w-3.5" />
                        Directory
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                        User management
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Search accounts, review roles, and enable or disable access.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        to="/dashboard/add-user"
                        className="btn gap-2 rounded-xl border-0 bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add user
                    </Link>
                    <Link
                        to="/dashboard/add-provider"
                        className="btn gap-2 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                    >
                        <Building2 className="h-4 w-4" />
                        Add provider
                    </Link>
                </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-lg bg-white px-2 py-1 shadow-sm ring-1 ring-slate-200/80">
                    Admins: <strong className="text-slate-900">{counts.admin}</strong>
                </span>
                <span className="rounded-lg bg-white px-2 py-1 shadow-sm ring-1 ring-slate-200/80">
                    Providers: <strong className="text-slate-900">{counts.provider}</strong>
                </span>
                <span className="rounded-lg bg-white px-2 py-1 shadow-sm ring-1 ring-slate-200/80">
                    Users: <strong className="text-slate-900">{counts.user}</strong>
                </span>
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="input input-bordered w-full rounded-xl border-slate-200 bg-white pl-10 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="select select-bordered w-full rounded-xl border-slate-200 sm:w-44"
                >
                    <option value="">All roles</option>
                    <option value="admin">Admin</option>
                    <option value="provider">Provider</option>
                    <option value="user">User</option>
                </select>
            </div>

            {error && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {list.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                        No users match your filters.
                                    </td>
                                </tr>
                            ) : (
                                list.map((row) => {
                                    const isSelf =
                                        row.email?.toLowerCase() === currentEmail;
                                    const active = row.isActive !== false;
                                    const isEditing = editingId === row._id;
                                    return (
                                        <tr
                                            key={row._id}
                                            className="border-t border-slate-100 hover:bg-slate-50/80"
                                        >
                                            <td className="px-4 py-3 font-medium text-slate-900">
                                                {isEditing ? (
                                                    <input
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="input input-sm input-bordered w-full max-w-[220px] rounded-lg border-slate-200 bg-white"
                                                    />
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        {row.name}
                                                        {isSelf && (
                                                            <span
                                                                title="You"
                                                                className="inline-flex items-center gap-0.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800"
                                                            >
                                                                <Shield className="h-3 w-3" />
                                                                You
                                                            </span>
                                                        )}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-600">
                                                {row.email}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isEditing ? (
                                                    <select
                                                        value={editRole}
                                                        onChange={(e) => setEditRole(e.target.value)}
                                                        className="select select-sm select-bordered w-full max-w-[140px] rounded-lg border-slate-200"
                                                    >
                                                        <option value="admin">Admin</option>
                                                        <option value="provider">Provider</option>
                                                        <option value="user">User</option>
                                                    </select>
                                                ) : (
                                                    <span className={roleBadge(row.role)}>
                                                        {row.role}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {active ? (
                                                    <span className="text-emerald-700">Active</span>
                                                ) : (
                                                    <span className="text-rose-600">Disabled</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="inline-flex items-center justify-end gap-2">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => saveEdit(row)}
                                                                disabled={busyId === row._id}
                                                                className="btn btn-xs gap-1 rounded-lg border-0 bg-emerald-600 text-white hover:bg-emerald-700"
                                                            >
                                                                <Save className="h-3.5 w-3.5" />
                                                                Save
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={cancelEdit}
                                                                disabled={busyId === row._id}
                                                                className="btn btn-xs gap-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => startEdit(row)}
                                                            disabled={busyId === row._id}
                                                            className="btn btn-xs gap-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                            Edit
                                                        </button>
                                                    )}
                                                    <input
                                                        type="checkbox"
                                                        className="toggle toggle-success"
                                                        checked={active}
                                                        disabled={
                                                            busyId === row._id ||
                                                            isEditing ||
                                                            (isSelf && active)
                                                        }
                                                        title={
                                                            isSelf && active
                                                                ? "You cannot disable your own account here"
                                                                : active
                                                                  ? "Disable account"
                                                                  : "Enable account"
                                                        }
                                                        onChange={() => toggleActive(row)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagementPage;
