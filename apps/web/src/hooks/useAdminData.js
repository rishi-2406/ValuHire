import { useState, useEffect } from "react";
import { adminService } from "../services/api";

export function useAdminData(toast) {
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    Promise.all([
      adminService.getCompanies().catch((err) => { setError(err.message); return { companies: [] }; }),
      adminService.getUsers().catch(() => ({ users: [] }))
    ])
      .then(([companyData, userData]) => {
        setCompanies(companyData.companies || companyData || []);
        setUsers(userData.users || userData || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCompanies = companies.filter((c) => companyFilter === "all" || c.status === companyFilter);
  const filteredUsers = users.filter((u) => !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()));

  const pendingCount = companies.filter((c) => c.status === "pending").length;
  const approvedCount = companies.filter((c) => c.status === "approved").length;
  const rejectedCount = companies.filter((c) => c.status === "rejected").length;
  const bannedCount = users.filter((u) => (u.status || "").toLowerCase() === "banned").length;

  const handleApprove = async (company) => {
    if (busyId) return;
    setBusyId(company.id);
    try {
      await adminService.updateCompanyStatus(company.id, "approved");
      setCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...c, status: "approved" } : c)));
      toast.success(`${company.name} approved`, { title: "Company verified" });
    } catch (err) {
      toast.error(err.message || "Approval failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (company) => {
    if (busyId) return;
    setBusyId(company.id);
    try {
      await adminService.updateCompanyStatus(company.id, "rejected");
      setCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...c, status: "rejected" } : c)));
      toast.warning(`${company.name} rejected`);
    } catch (err) {
      toast.error(err.message || "Rejection failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleBan = async (u) => {
    if (busyId) return;
    if (!window.confirm(`Ban ${u.name}?`)) return;
    setBusyId(u.id);
    try {
      await adminService.banUser(u.id);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: "banned" } : x)));
      toast.warning(`${u.name} banned`);
    } catch (err) {
      toast.error(err.message || "Ban failed");
    } finally {
      setBusyId(null);
    }
  };

  return {
    companies, setCompanies,
    users, setUsers,
    loading, setLoading,
    error, setError,
    companyFilter, setCompanyFilter,
    userSearch, setUserSearch,
    busyId, setBusyId,
    filteredCompanies, filteredUsers,
    pendingCount, approvedCount, rejectedCount, bannedCount,
    handleApprove, handleReject, handleBan
  };
}
