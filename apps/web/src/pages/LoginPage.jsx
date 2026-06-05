import React from "react";
import { BrandPanel } from "../components/LoginPage/BrandPanel";
import { LoginForm } from "../components/LoginPage/LoginForm";
import { RegisterForm } from "../components/LoginPage/RegisterForm";
import { SocialLogins } from "../components/LoginPage/SocialLogins";
import { useLoginData } from "../hooks/useLoginData";

export default function LoginPage() {
  const {
    tab,
    switchTab,
    role,
    setRole,
    loading,
    error,
    tabIndicatorRef,
    handleLoginSubmit,
    handleRegisterSubmit
  } = useLoginData();

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
            <LoginForm onLogin={handleLoginSubmit} loading={loading} />
          ) : (
            <RegisterForm onRegister={handleRegisterSubmit} loading={loading} role={role} setRole={setRole} />
          )}

          <div className="relative flex items-center py-2 animate-fade-in stagger-3">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="flex-shrink-0 mx-4 text-body-sm text-on-surface-variant">or continue with</span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          <SocialLogins />

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