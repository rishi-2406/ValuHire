import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Briefcase, User } from "lucide-react";

const FEATURES = [
  {
    icon: "analytics",
    iconColor: "text-primary-fixed",
    iconBg: "bg-primary-fixed-dim/20",
    title: "AI Integrity Score",
    desc: "Fraud detection algorithms."
  },
  {
    icon: "videocam",
    iconColor: "text-secondary-fixed",
    iconBg: "bg-secondary-fixed-dim/20",
    title: "Real-time Proctored Rooms",
    desc: "Secure live technical interviews."
  },
  {
    icon: "format_list_numbered",
    iconColor: "text-tertiary-fixed",
    iconBg: "bg-tertiary-fixed-dim/20",
    title: "Automated Ranking",
    desc: "Data-driven candidate comparison."
  },
  {
    icon: "edit_note",
    iconColor: "text-white",
    iconBg: "bg-white/20",
    title: "Custom Assessments",
    desc: "Tailored technical challenges."
  }
];

const BRAND_FEATURES = [...FEATURES, ...FEATURES];

function BrandPanel() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 10
  }));

  return (
    <div className="hidden lg:flex w-1/2 bg-primary relative flex-col justify-between p-12 overflow-hidden bg-pattern">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary opacity-30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-screen pointer-events-none animate-ambient-shift" />
      <div
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-fixed-dim opacity-20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 mix-blend-screen pointer-events-none animate-ambient-shift"
        style={{ animationDelay: "-10s" }}
      />

      {particles.map((p) => (
        <div
          key={p.id}
          className="floating-particle absolute bg-white/10 rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `-${p.delay}s`
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col justify-center flex-grow">
        <div className="brand-mark mb-12 animate-fade-in-up">VH</div>

        <h1 className="text-display-lg text-on-primary mb-6 max-w-lg leading-tight animate-fade-in-up stagger-1">
          Precision Technical Recruitment
        </h1>
        <p className="text-body-lg text-primary-fixed mb-12 max-w-md animate-fade-in-up stagger-2">
          Unlock top engineering talent with our data-driven valuation platform. Streamline your hiring
          pipeline with confidence.
        </p>

        <div className="animate-fade-in-up stagger-3 w-[calc(100%+6rem)] -ml-12">
          <div className="scroll-container py-4">
            <div className="scroll-content gap-4 px-12">
              {BRAND_FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="glass-card flex items-center gap-4 p-4 rounded-xl min-w-[280px]"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${f.iconBg}`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {f.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-label-md text-on-primary font-semibold">{f.title}</h3>
                    <p className="text-body-sm text-primary-fixed/80">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between text-primary-fixed/60 text-body-sm animate-fade-in stagger-5">
        <span>© 2024 ValuHire</span>
        <div className="flex gap-4">
          <a className="hover:text-on-primary transition-colors" href="#">Privacy</a>
          <a className="hover:text-on-primary transition-colors" href="#">Terms</a>
        </div>
      </div>
    </div>
  );
}

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
  const [showPassword, setShowPassword] = useState(false);
  const tabIndicatorRef = useRef(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", companyName: "" });

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

  const handleGoogleLogin = () => {
    toast.info("Google SSO coming soon", { title: "OAuth" });
  };

  const handleGithubLogin = () => {
    toast.info("GitHub SSO coming soon", { title: "OAuth" });
  };

  return (
    <div className="flex min-h-screen bg-surface overflow-hidden">
      <BrandPanel />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-6 bg-surface-container-lowest overflow-y-auto animate-slide-in-right">
        <div className="w-full max-w-[440px] flex flex-col gap-6">
          <div className="lg:hidden flex justify-center mb-2 animate-fade-in">
            <div className="brand-mark">VH</div>
          </div>

          <div className="text-center animate-fade-in stagger-1">
            <h2 className="text-headline-lg text-on-surface mb-2">
              {tab === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              {tab === "login"
                ? "Sign in to access your ValuHire dashboard."
                : "Join ValuHire and discover top technical talent."}
            </p>

            <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/30 relative">
              <div
                ref={tabIndicatorRef}
                className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-surface-container-lowest rounded-md shadow-sm border border-outline-variant/20 transition-transform duration-300"
                style={{ transform: tab === "login" ? "translateX(0)" : "translateX(100%)" }}
              />
              <button
                className={`flex-1 py-2 text-label-md font-semibold relative z-10 transition-colors rounded-md ${
                  tab === "login" ? "text-primary" : "text-on-surface-variant"
                }`}
                onClick={() => switchTab("login")}
              >
                Log In
              </button>
              <button
                className={`flex-1 py-2 text-label-md relative z-10 transition-colors rounded-md ${
                  tab === "register" ? "text-primary font-semibold" : "text-on-surface-variant"
                }`}
                onClick={() => switchTab("register")}
              >
                Create Account
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-lg text-body-sm flex items-center gap-2">
              <span className="text-[14px]">error</span>
              {error}
            </div>
          )}

          {tab === "login" ? (
            <form className="flex flex-col gap-4 animate-fade-in stagger-2" onSubmit={handleLoginSubmit}>
              <div className="flex flex-col gap-1">
                <label className="text-label-md text-on-surface" htmlFor="login-email">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-on-surface-variant transition-colors group-focus-within:text-primary" />
                  </div>
                  <input
                    id="login-email"
                    className="form-input w-full pl-10 pr-4 py-2 border border-outline rounded-lg bg-surface-container-lowest text-on-surface transition-colors placeholder:text-on-surface-variant/50 hover:border-primary/50"
                    placeholder="name@company.com"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-label-md text-on-surface" htmlFor="login-password">
                    Password
                  </label>
                  <a className="text-label-sm text-primary hover:underline transition-colors" href="#">
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-on-surface-variant transition-colors group-focus-within:text-primary" />
                  </div>
                  <input
                    id="login-password"
                    className="form-input w-full pl-10 pr-10 py-2 border border-outline rounded-lg bg-surface-container-lowest text-on-surface transition-colors placeholder:text-on-surface-variant/50 hover:border-primary/50"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                className="w-full bg-primary-container text-on-primary text-label-md font-semibold py-3 rounded-lg flex justify-center items-center gap-2 hover:bg-primary hover:shadow-lg transition-all duration-200 active:scale-[0.98] focus:ring-4 focus:ring-primary/20 disabled:opacity-50 mt-1"
                type="submit"
                disabled={loading}
              >
                <span>{loading ? "Signing in..." : "Sign In"}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form className="flex flex-col gap-4 animate-fade-in stagger-2" onSubmit={handleRegisterSubmit}>
              <div className="flex flex-col gap-1">
                <label className="text-label-md text-on-surface block mb-2">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative cursor-pointer group">
                    <input
                      checked={role === "recruiter"}
                      className="peer sr-only"
                      name="role"
                      type="radio"
                      value="recruiter"
                      onChange={() => setRole("recruiter")}
                    />
                    <div
                      className={`role-card border rounded-lg p-4 flex items-center gap-3 transition-all ${
                        role === "recruiter"
                          ? "border-primary bg-primary/5"
                          : "border-outline-variant bg-surface-container-lowest hover:border-primary/50 hover:bg-surface-container-high"
                      }`}
                    >
                      <Briefcase
                        size={20}
                        className={role === "recruiter" ? "text-primary" : "text-on-surface-variant group-hover:text-primary/70"}
                      />
                      <span className={`text-label-md font-semibold transition-colors ${role === "recruiter" ? "text-primary" : "text-on-surface"}`}>
                        Recruiter
                      </span>
                    </div>
                  </label>
                  <label className="relative cursor-pointer group">
                    <input
                      checked={role === "candidate"}
                      className="peer sr-only"
                      name="role"
                      type="radio"
                      value="candidate"
                      onChange={() => setRole("candidate")}
                    />
                    <div
                      className={`role-card border rounded-lg p-4 flex items-center gap-3 transition-all ${
                        role === "candidate"
                          ? "border-primary bg-primary/5"
                          : "border-outline-variant bg-surface-container-lowest hover:border-primary/50 hover:bg-surface-container-high"
                      }`}
                    >
                      <User
                        size={20}
                        className={role === "candidate" ? "text-primary" : "text-on-surface-variant group-hover:text-primary/70"}
                      />
                      <span className={`text-label-md font-semibold transition-colors ${role === "candidate" ? "text-primary" : "text-on-surface"}`}>
                        Candidate
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {role === "recruiter" && (
                <div className="flex flex-col gap-1">
                  <label className="text-label-md text-on-surface" htmlFor="reg-company">
                    Company Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase size={18} className="text-on-surface-variant" />
                    </div>
                    <input
                      id="reg-company"
                      className="form-input w-full pl-10 pr-4 py-2 border border-outline rounded-lg bg-surface-container-lowest text-on-surface transition-colors placeholder:text-on-surface-variant/50 hover:border-primary/50"
                      placeholder="Acme Inc."
                      type="text"
                      value={registerForm.companyName}
                      onChange={(e) => setRegisterForm({ ...registerForm, companyName: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-label-md text-on-surface" htmlFor="reg-email">
                  {role === "recruiter" ? "Work Email" : "Email Address"}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-on-surface-variant transition-colors group-focus-within:text-primary" />
                  </div>
                  <input
                    id="reg-email"
                    className="form-input w-full pl-10 pr-4 py-2 border border-outline rounded-lg bg-surface-container-lowest text-on-surface transition-colors placeholder:text-on-surface-variant/50 hover:border-primary/50"
                    placeholder="name@company.com"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-md text-on-surface" htmlFor="reg-name">
                  Full Name
                </label>
<div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-on-surface-variant transition-colors group-focus-within:text-primary" />
                    </div>
                    <input
                      id="reg-name"
                      className="form-input w-full pl-10 pr-4 py-2 border border-outline rounded-lg bg-surface-container-lowest text-on-surface transition-colors placeholder:text-on-surface-variant/50 hover:border-primary/50"
                      placeholder="Jane Doe"
                      type="text"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required
                    />
                  </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-md text-on-surface" htmlFor="reg-password">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-on-surface-variant transition-colors group-focus-within:text-primary" />
                  </div>
                  <input
                    id="reg-password"
                    className="form-input w-full pl-10 pr-10 py-2 border border-outline rounded-lg bg-surface-container-lowest text-on-surface transition-colors placeholder:text-on-surface-variant/50 hover:border-primary/50"
                    placeholder="Min. 8 characters"
                    type={showPassword ? "text" : "password"}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                className="w-full bg-primary-container text-on-primary text-label-md font-semibold py-3 rounded-lg flex justify-center items-center gap-2 hover:bg-primary hover:shadow-lg transition-all duration-200 active:scale-[0.98] focus:ring-4 focus:ring-primary/20 disabled:opacity-50 mt-1"
                type="submit"
                disabled={loading}
              >
                <span>{loading ? "Creating account..." : "Get Started"}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          <div className="relative flex items-center py-2 animate-fade-in stagger-3">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="flex-shrink-0 mx-4 text-body-sm text-on-surface-variant">or continue with</span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          <div className="grid grid-cols-2 gap-3 animate-fade-in stagger-4">
            <button
              className="flex justify-center items-center gap-2 border border-outline-variant bg-surface-container-lowest py-2.5 rounded-lg hover:bg-surface-container-low hover:border-outline transition-all duration-200 text-label-md text-on-surface shadow-sm hover:shadow"
              type="button"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              className="flex justify-center items-center gap-2 border border-outline-variant bg-surface-container-lowest py-2.5 rounded-lg hover:bg-surface-container-low hover:border-outline transition-all duration-200 text-label-md text-on-surface shadow-sm hover:shadow"
              type="button"
              onClick={handleGithubLogin}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"/>
              </svg>
              GitHub
            </button>
          </div>

          <div className="lg:hidden text-center mt-2 pb-8 animate-fade-in stagger-5">
            <p className="text-body-sm text-on-surface-variant">
              By continuing, you agree to our{" "}
              <a className="text-primary hover:underline transition-colors" href="#">Terms</a>
              {" "}and{" "}
              <a className="text-primary hover:underline transition-colors" href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}