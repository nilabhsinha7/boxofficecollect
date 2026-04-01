"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/compare", label: "Compare" }
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f9f7f1]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/80 text-sm font-semibold tracking-[0.28em] text-ember shadow-panel">
              BOC
            </div>
            <div>
              <p className="font-display text-3xl leading-none tracking-[0.04em]">BoxOfficeCollect</p>
              <p className="text-xs uppercase tracking-[0.32em] text-ink/55">Theatrical performance tracker</p>
            </div>
          </Link>
          <nav className="hidden gap-2 sm:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition",
                    active ? "bg-ink text-white" : "text-ink/70 hover:bg-white/80 hover:text-ink"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
