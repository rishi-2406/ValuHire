import { useState, useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "./useToast";

function roleHomeFor(role) {
  switch (role) {
    case "CANDIDATE":
      return "/candidate";
    case "ADMIN":
      return "/admin";
    case "RECRUITER":
      return "/recruiter";
    default:
      return "/login";
  }
}

export function useLoginData() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState("recruiter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const tabIndicatorRef = useRef(null);

  useEffect(() => {
    if (user) {
      navigate(roleHomeFor(user.role), { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (tabIndicatorRef.current) {
      tabIndicatorRef.current.style.transform = tab === "login" ? "translateX(0)" : "translateX(100%)";
    }
  }, [tab]);

  const switchTab = (t) => {
    setTab(t);
    setError("");
  };

  const handleLoginSubmit = async (email, password) => {
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      navigate(roleHomeFor(data.user?.role), { replace: true });
      toast.success("Welcome back!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (registerForm) => {
    setError("");
    setLoading(true);
    try {
      const data = await register({
        ...registerForm,
        role: role.toUpperCase(),
        companyName: role === "recruiter" ? registerForm.companyName : undefined
      });
      navigate(roleHomeFor(data.user?.role), { replace: true });
      toast.success("Account created! Welcome to ValuHire.");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    tab,
    switchTab,
    role,
    setRole,
    loading,
    error,
    tabIndicatorRef,
    handleLoginSubmit,
    handleRegisterSubmit
  };
}
