import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";

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

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState("recruiter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: ""
  });

  React.useEffect(() => {
    if (user) {
      navigate(roleHomeFor(user.role), { replace: true });
    }
  }, [user, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(loginForm.email, loginForm.password);
      navigate(roleHomeFor(data.user?.role), { replace: true });
      toast.success("Welcome back!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <main className="flex min-h-screen bg-surface">
      <section className="w-full md:w-5/12 bg-surface-container-lowest flex flex-col p-margin-desktop relative z-10 border-r border-outline-variant">
        <div className="mb-xl">
          <div className="brand-mark">VH</div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-[400px] mx-auto w-full">
          <div className="mb-lg">
            <h1 className="text-headline-lg text-on-surface mb-xs">Welcome to ValuHire</h1>
            <p className="text-body-md text-on-surface-variant">
              The recruiter-first technical assessment platform.
            </p>
          </div>

          <div className="flex border-b border-outline-variant mb-xl">
            <button
              className={`flex-1 py-md text-label-md transition-all ${
                tab === "login"
                  ? "border-b-2 border-primary text-primary font-bold"
                  : "text-on-surface-variant hover:text-primary"
              }`}
              onClick={() => setTab("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-md text-label-md transition-all ${
                tab === "register"
                  ? "border-b-2 border-primary text-primary font-bold"
                  : "text-on-surface-variant hover:text-primary"
              }`}
              onClick={() => setTab("register")}
            >
              Create account
            </button>
          </div>

          {error && (
            <div className="mb-md p-md bg-error-container text-on-error-container rounded-lg text-body-sm flex items-center gap-xs">
              <span className="text-[14px]">error</span>
              {error}
            </div>
          )}

          {tab === "login" ? (
            <form className="space-y-lg" onSubmit={handleLoginSubmit}>
              <div className="space-y-base">
                <label className="text-label-md text-on-surface block">Email Address</label>
                <input
                  className="w-full h-[40px] px-md border border-outline rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-body-md"
                  placeholder="name@company.com"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-base">
                <div className="flex justify-between items-center">
                  <label className="text-label-md text-on-surface">Password</label>
                  <a className="text-label-sm text-primary hover:underline" href="#">
                    Forgot Password?
                  </a>
                </div>
                <input
                  className="w-full h-[40px] px-md border border-outline rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-body-md"
                  placeholder="••••••••"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <button
                className="w-full h-[40px] bg-primary-container hover:bg-primary text-on-primary text-label-md rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form className="space-y-lg" onSubmit={handleRegisterSubmit}>
              <div className="space-y-base">
                <label className="text-label-md text-on-surface block">Who are you?</label>
                <div className="grid grid-cols-2 gap-md">
                  <button
                    type="button"
                    className={`h-[40px] flex items-center justify-center gap-xs rounded-xl font-label-md transition-all ${
                      role === "recruiter"
                        ? "border-2 border-primary bg-primary-container/10 text-primary"
                        : "border border-outline text-on-surface-variant"
                    }`}
                    onClick={() => setRole("recruiter")}
                  >
                    <span className="material-symbols-outlined text-[18px]">business_center</span>
                    Recruiter
                  </button>
                  <button
                    type="button"
                    className={`h-[40px] flex items-center justify-center gap-xs rounded-xl font-label-md transition-all ${
                      role === "candidate"
                        ? "border-2 border-primary bg-primary-container/10 text-primary"
                        : "border border-outline text-on-surface-variant"
                    }`}
                    onClick={() => setRole("candidate")}
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Candidate
                  </button>
                </div>
              </div>

              {role === "recruiter" && (
                <div className="space-y-base">
                  <label className="text-label-md text-on-surface block">Company Name</label>
                  <input
                    className="w-full h-[40px] px-md border border-outline rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-body-md"
                    placeholder="Acme Inc."
                    type="text"
                    value={registerForm.companyName}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, companyName: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="space-y-base">
                <label className="text-label-md text-on-surface block">
                  {role === "recruiter" ? "Work Email" : "Email Address"}
                </label>
                <input
                  className="w-full h-[40px] px-md border border-outline rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-body-md"
                  placeholder="name@company.com"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-base">
                <label className="text-label-md text-on-surface block">Full Name</label>
                <input
                  className="w-full h-[40px] px-md border border-outline rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-body-md"
                  placeholder="Jane Doe"
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-base">
                <label className="text-label-md text-on-surface block">Password</label>
                <input
                  className="w-full h-[40px] px-md border border-outline rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-body-md"
                  placeholder="Min. 8 characters"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>

              <button
                className="w-full h-[40px] bg-primary-container hover:bg-primary text-on-primary text-label-md rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          <div className="mt-xl pt-xl border-t border-outline-variant">
            <p className="text-label-sm text-on-surface-variant text-center">
              By continuing, you agree to ValuHire's{" "}
              <a className="text-primary hover:underline" href="#">
                Terms
              </a>{" "}
              and{" "}
              <a className="text-primary hover:underline" href="#">
                Privacy Policy
              </a>.
            </p>
          </div>
        </div>

        <div className="mt-auto text-center md:text-left">
          <p className="text-label-sm text-on-surface-variant/60">
            © 2024 ValuHire. Recruiter-first technical assessment platform.
          </p>
        </div>
      </section>

      <section className="hidden md:flex md:w-7/12 bg-surface flex-col justify-center items-center p-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-fixed-dim blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-surface-container-highest blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-[600px] space-y-lg">
          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-custom transform -rotate-1 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-sm">
                <div className="w-sm h-lg bg-primary rounded-full" />
                <h3 className="text-title-md">Technical Assessment</h3>
              </div>
              <span className="px-sm py-xs bg-primary-fixed text-on-primary-fixed rounded text-label-sm">
                Active
              </span>
            </div>
            <div className="space-y-sm">
              <div className="flex items-center gap-md py-sm border-b border-surface-variant">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary">
                  JD
                </div>
                <div className="flex-1">
                  <p className="text-label-md">Jane Doe</p>
                  <p className="text-body-sm text-on-surface-variant">Full-stack React Engineer</p>
                </div>
                <div className="text-right">
                  <p className="text-label-md text-primary">94%</p>
                  <p className="text-label-sm text-on-surface-variant">Score</p>
                </div>
              </div>
              <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[94%]" />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-custom rotate-1 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-title-md">Live Interviews</h3>
              <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
            </div>
            <div className="flex gap-md min-w-0">
              <div className="relative w-24 h-24 rounded-lg bg-surface-container flex-shrink-0 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary-container to-surface-variant" />
                <div className="absolute bottom-1 right-1 w-3 h-3 bg-primary rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 flex flex-col justify-center min-w-0">
                <p className="text-title-md truncate">Live Coding: Python</p>
                <p className="text-body-sm text-on-surface-variant mt-xs">Started 12 mins ago</p>
                <div className="flex gap-xs mt-sm flex-shrink-0">
                  <div className="w-6 h-6 rounded bg-error-container text-on-error-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">videocam_off</span>
                  </div>
                  <div className="w-6 h-6 rounded bg-primary-container text-on-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">mic</span>
                  </div>
                  <div className="w-6 h-6 rounded bg-surface-container text-on-surface-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">screen_share</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-custom -rotate-2 hover:rotate-0 transition-transform duration-500">
            <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-md">
              Candidate Ranking
            </h3>
            <div className="space-y-xs">
              <div className="flex items-center justify-between p-sm rounded bg-primary/5 border-l-4 border-primary">
                <span className="text-label-md">1. Michael Smith</span>
                <span className="text-body-sm text-primary">High Fit</span>
              </div>
              <div className="flex items-center justify-between p-sm rounded bg-surface hover:bg-surface-container transition-colors">
                <span className="text-label-md">2. Sarah Wilson</span>
                <span className="text-body-sm text-on-surface-variant">Moderate Fit</span>
              </div>
              <div className="flex items-center justify-between p-sm rounded bg-surface hover:bg-surface-container transition-colors">
                <span className="text-label-md">3. Robert Chen</span>
                <span className="text-body-sm text-on-surface-variant">Moderate Fit</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-xl text-center px-xl max-w-[480px]">
          <h2 className="text-headline-md text-on-surface">
            Scale your engineering team with confidence.
          </h2>
          <p className="text-body-md text-on-surface-variant mt-sm">
            Built for high-density recruitment workflows, ValuHire brings data-driven precision
            to your technical hiring process.
          </p>
        </div>
      </section>
    </main>
  );
}