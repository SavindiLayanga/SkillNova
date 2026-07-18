import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Eye, Edit2, Ban, Trash2, CheckCircle2, ChevronLeft, ChevronRight, BarChart3, List } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AdminCard from "../../components/admin/AdminCard.jsx";
import Button from "../../components/ui/Button.jsx";
import { fetchAllUsers, updateUserStatus, deleteUser, updateUser } from "../../services/adminUsersService.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePreferences } from "../../context/PreferencesContext.jsx";
import { formatDate } from "../../utils/dateUtils.js";

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { preferences } = usePreferences();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [viewMode, setViewMode] = useState("table");
  
  const debouncedSearch = useDebounce(searchTerm, 400);

  const chartData = useMemo(() => {
    const roles = {};
    users.forEach(u => {
      const role = u.role ? (u.role.charAt(0).toUpperCase() + u.role.slice(1)) : 'User';
      roles[role] = (roles[role] || 0) + 1;
    });
    return Object.keys(roles).map(key => ({ name: key, count: roles[key] }));
  }, [users]);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: "", careerGoal: "", targetRole: "" });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers({
        page,
        limit: 10,
        search: debouncedSearch,
        status: statusFilter
      });
      setUsers(data.users);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const handleToggleStatus = async (user) => {
    if (!window.confirm(`Are you sure you want to ${user.isActive ? 'disable' : 'enable'} ${user.name}?`)) return;
    setIsActionLoading(true);
    try {
      await updateUserStatus(user._id, !user.isActive);
      loadUsers();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`WARNING: Are you sure you want to delete ${user.name}? This action cannot be fully undone.`)) return;
    setIsActionLoading(true);
    try {
      await deleteUser(user._id);
      loadUsers();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || "",
      careerGoal: user.careerGoal || "",
      targetRole: user.targetRole || ""
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      await updateUser(selectedUser._id, editFormData);
      setIsEditModalOpen(false);
      loadUsers();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="User Management"
        description={`Manage ${total} registered students on the platform.`}
      />

      <AdminCard className="mt-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:w-auto flex-1">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setSearchParams(prev => {
                  const newParams = new URLSearchParams(prev);
                  newParams.set("status", e.target.value);
                  return newParams;
                });
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <List className="h-4 w-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${viewMode === 'chart' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <BarChart3 className="h-4 w-4" />
              Chart
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Career Goal</th>
                  <th className="px-4 py-3 font-medium">Joined Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-500">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">{user.email}</td>
                      <td className="px-4 py-4 capitalize">{user.role}</td>
                      <td className="px-4 py-4">{user.careerGoal || "-"}</td>
                      <td className="px-4 py-4">
                        {formatDate(user.createdAt, preferences)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/users/${user._id}`)}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            title="View Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                            title="Edit User"
                            disabled={isActionLoading}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`rounded p-1.5 ${
                              user.isActive
                                ? "text-amber-400 hover:bg-amber-50 hover:text-amber-600"
                                : "text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600"
                            }`}
                            title={user.isActive ? "Disable User" : "Enable User"}
                            disabled={isActionLoading}
                          >
                            {user.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="rounded p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Delete User"
                            disabled={isActionLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-96 w-full rounded-lg border border-slate-100 bg-slate-50 p-6">
            {users.length === 0 ? (
               <div className="flex h-full items-center justify-center text-slate-500">No data to display</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                  <Legend />
                  <Bar dataKey="count" name="Users Count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{" "}
              <span className="font-medium">{Math.min(page * 10, total)}</span> of{" "}
              <span className="font-medium">{total}</span> users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium text-slate-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </AdminCard>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <AdminCard className="w-full max-w-md">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Edit User</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Name</span>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Target Role</span>
                <input
                  type="text"
                  value={editFormData.targetRole}
                  onChange={(e) => setEditFormData({ ...editFormData, targetRole: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Career Goal</span>
                <textarea
                  value={editFormData.careerGoal}
                  onChange={(e) => setEditFormData({ ...editFormData, careerGoal: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
                  rows={3}
                />
              </label>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isActionLoading}>
                  {isActionLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </AdminCard>
        </div>
      )}
    </div>
  );
}
