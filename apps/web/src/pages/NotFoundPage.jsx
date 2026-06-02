import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="max-w-xl w-full text-center animate-fade-in-up">
        <div className="relative mx-auto w-48 h-48 mb-8">
          <div className="absolute inset-0 bg-primary-container rounded-full opacity-30 blur-3xl animate-ambient-shift" />
          <div className="relative w-full h-full rounded-full bg-white border border-outline flex items-center justify-center">
            <span className="text-display-sm font-extrabold text-primary tracking-tight">404</span>
          </div>
        </div>

        <h1 className="text-headline-lg text-on-surface mb-3">Lost in the talent graph</h1>
        <p className="text-body-lg text-on-surface-variant max-w-md mx-auto mb-8">
          We couldn't find the page you're looking for. The link may be broken, or the campaign has been archived.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="primary-button">
            <Home size={18} />
            <span>Back to dashboard</span>
          </Link>
          <Link to="/campaigns" className="secondary-button">
            <Search size={18} />
            <span>Browse campaigns</span>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
          {[
            { label: "Dashboard", to: "/" },
            { label: "Interviews", to: "/interviews" },
            { label: "Results", to: "/results" },
            { label: "Settings", to: "/settings" }
          ].map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="px-4 py-3 text-sm font-medium text-on-surface-variant bg-white border border-outline rounded-lg hover:border-primary hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
