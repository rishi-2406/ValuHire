import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Briefcase, User } from "lucide-react";

export function RegisterForm({ onRegister, loading, role, setRole }) {
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", companyName: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(registerForm);
  };

  return (
    <form className="flex flex-col gap-4 animate-fade-in stagger-2" onSubmit={handleSubmit}>
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
  );
}
