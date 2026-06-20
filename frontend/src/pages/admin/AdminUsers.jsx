import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import { adminUsers } from "../../data/adminDummyData.js";

export default function AdminUsers() {
  const [users, setUsers] = useState(adminUsers);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesQuery = `${user.name} ${user.email} ${user.targetRole}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesStatus = status === "All" || user.status === status;

        return matchesQuery && matchesStatus;
      }),
    [query, status, users]
  );

  function toggleStatus(id) {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "Active" ? "Blocked" : "Active" }
          : user
      )
    );
  }

  return (
    <div>
      <AdminPageHeader
        description="Search student accounts and manage active or blocked access status."
        title="Users"
      />

      <AdminCard>
        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-full text-sm outline-none"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users by name, email, or role"
              value={query}
            />
          </label>
          <select
            className="rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            <option>All</option>
            <option>Active</option>
            <option>Blocked</option>
          </select>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="py-3">Student</th>
                <th className="py-3">Target role</th>
                <th className="py-3">Joined</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="py-4">
                    <p className="font-semibold text-slate-950">{user.name}</p>
                    <p className="text-slate-500">{user.email}</p>
                  </td>
                  <td className="py-4 text-slate-600">{user.targetRole}</td>
                  <td className="py-4 text-slate-600">{user.joined}</td>
                  <td className="py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      user.status === "Active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Button
                      onClick={() => toggleStatus(user.id)}
                      size="sm"
                      variant={user.status === "Active" ? "secondary" : "primary"}
                    >
                      {user.status === "Active" ? "Block" : "Unblock"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
