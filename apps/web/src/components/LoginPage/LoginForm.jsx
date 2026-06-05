import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export function LoginForm({ onLogin, loading }) {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(loginForm.email, loginForm.password);
  };

  return (
    <form className="flex flex-col gap-4 animate-fade-in stagger-2" onSubmit={handleSubmit}>
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
  );
}
