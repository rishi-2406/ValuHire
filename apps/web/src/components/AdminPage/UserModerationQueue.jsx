import React from "react";
import { Shield, Search, Ban } from "lucide-react";

export function UserModerationQueue({
  userSearch,
  setUserSearch,
  loading,
  filteredUsers,
  handleBan,
  busyId
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm flex flex-col min-h-[400px]">
      <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright rounded-t">
        <h3 className="text-title-lg text-on-surface flex items-center gap-2 font-semibold">
          <Shield className="text-error" size={24} />
          User Moderation Queue
        </h3>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <Search size={14} className="text-outline" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="block w-full pl-8 pr-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-sm outline-none focus:border-primary"
          />
        </div>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th className="p-3 text-label-sm text-on-surface-variant uppercase font-semibold">User / Email</th>
              <th className="p-3 text-label-sm text-on-surface-variant uppercase font-semibold">Role</th>
              <th className="p-3 text-label-sm text-on-surface-variant uppercase font-semibold">Status</th>
              <th className="p-3 text-label-sm text-on-surface-variant uppercase font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface">
            {loading ? (
                <tr><td colSpan={4} className="p-4 text-center text-on-surface-variant">Loading...</td></tr>
            ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">No users found</td></tr>
            ) : (
              filteredUsers.map(u => {
                  const role = (u.role || "CANDIDATE").toLowerCase();
                  const status = (u.status || "active").toLowerCase();
                  return (
                    <tr key={u.id} className="hover:bg-surface-bright transition-colors group">
                      <td className="p-3">
                        <div className="text-label-md font-medium">{u.name}</div>
                        <div className="text-on-surface-variant text-[12px]">{u.email || (u.name.toLowerCase().replace(/\s/g, '') + "@example.com")}</div>
                      </td>
                      <td className="p-3 text-on-surface-variant capitalize">{role}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-label-sm text-[10px] uppercase font-bold tracking-wider ${
                          status === 'banned' ? 'bg-error-container text-on-error-container line-through decoration-error' : 'bg-success-green/10 text-success-green'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {role !== "admin" && status !== "banned" && (
                            <button onClick={() => handleBan(u)} disabled={busyId === u.id} className="text-error hover:bg-error-container p-1 rounded transition-colors" title="Suspend">
                              <Ban size={20} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t border-outline-variant bg-surface-container-lowest text-center">
        <a className="text-label-sm text-primary hover:underline" href="#">View All Users</a>
      </div>
    </div>
  );
}
