import { Link } from "react-router-dom";
import { Home, Headset } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans antialiased overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-fixed-dim/20 blur-[100px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary-fixed-dim/20 blur-[100px]" />
        <div className="absolute inset-0 bg-pattern opacity-30" />
      </div>

      {/* Header / Logo */}
      <header className="w-full py-6 px-4 md:px-6 z-10 flex justify-center md:justify-start">
        <div className="brand-mark">VH</div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-6 z-10 w-full max-w-7xl mx-auto text-center relative">
        {/* Illustration Area */}
        <div className="relative mb-8 w-full max-w-sm md:max-w-md lg:max-w-lg aspect-square">
          <div className="absolute inset-0 bg-surface rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] transform scale-90 -z-10" />
          <img
            alt="404 Illustration"
            className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl animate-[bounce_3s_ease-in-out_infinite]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiIXkmp82WPos8_hRtLMXjsBj91WsnagCqUobFqfmT6ek4xz-GoCjyWE6H7_FeTy9aIfcNxSoxEv79z4hnjwEvDBAzvgu3enrJeSSEG2949ftj3NGChKmfSBZ9Z_WvzctAL08XIPswO7n2rKZa5R6XTbc978PfYGF3LoTa9zfYZCZ_JxiLrwPLAzOpeNUK2GgM_7OOLVM1mBKgiwl4jfdJ6-YwZh9FHOXzFP4s89q3z0vrDnw5jNwYvChLuw470tROyuEdia3E55k"
          />
        </div>

        {/* Typography & Messaging */}
        <div className="max-w-2xl space-y-4">
          <h1 className="text-display-lg text-primary tracking-tight font-bold">
            404
          </h1>
          <h2 className="text-headline-lg text-on-surface hidden md:block font-bold">
            PAGE NOT FOUND
          </h2>
          <h2 className="text-headline-lg-mobile text-on-surface md:hidden font-bold">
            PAGE NOT FOUND
          </h2>
          <p className="text-body-lg text-on-surface-variant max-w-lg mx-auto leading-relaxed">
            Oops! Seems we've lost that piece. Let's get you back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-container text-on-primary-container rounded-lg text-label-md font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto"
          >
            <Home size={20} />
            Go Back Home
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-outline-variant bg-surface text-primary rounded-lg text-label-md font-semibold hover:bg-surface-container-low transition-colors duration-200 w-full sm:w-auto group"
          >
            <Headset size={20} className="group-hover:animate-pulse" />
            Contact Support
          </Link>
        </div>
      </main>

      {/* Footer padding to balance the header */}
      <div className="py-6 hidden md:block" />
    </div>
  );
}
