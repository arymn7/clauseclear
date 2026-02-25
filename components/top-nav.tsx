import Link from "next/link";

import ThemeToggle from "./theme-toggle";

type TopNavProps = {
  userEmail?: string | null;
  active?: "dashboard" | "analyses" | "settings";
};

const navItems: Array<{ id: "dashboard" | "analyses" | "settings"; label: string; href: string }> = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "analyses", label: "Analyses", href: "/dashboard/analyses" },
  { id: "settings", label: "Settings", href: "/dashboard/settings" },
];

function getInitials(email?: string | null) {
  if (!email) {
    return "CC";
  }

  const [name] = email.split("@");
  const cleaned = name.replace(/[^a-zA-Z]/g, "");

  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2).toUpperCase();
  }

  return "CC";
}

export default function TopNav({ userEmail, active }: TopNavProps) {
  const initials = getInitials(userEmail);
  const isAuthenticated = Boolean(userEmail);
  const logoHref = isAuthenticated ? "/dashboard" : "/";

  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--panel)]">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={logoHref} className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)]">
          ClauseClear
        </Link>

        {isAuthenticated ? (
          <nav className="hidden items-center gap-3 md:flex">
            {navItems.map((item) => {
              const isActive = item.id === active;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ${
                    isActive
                      ? "bg-[var(--accent-soft)] font-medium text-[var(--text-primary)]"
                      : "font-normal text-[var(--text-secondary)] hover:bg-[var(--section-tint)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : (
          <div className="hidden text-sm text-[var(--text-secondary)] md:block">Legal document intelligence platform</div>
        )}

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden text-xs text-[var(--text-muted)] sm:block">{userEmail}</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--section-tint)] text-xs font-semibold text-[var(--text-secondary)]">
              {initials}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        )}
      </div>

      {isAuthenticated ? (
        <nav className="border-t border-[var(--border-subtle)] bg-[var(--panel)] px-4 py-2 md:hidden">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-2">
            {navItems.map((item) => {
              const isActive = item.id === active;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex-1 rounded-md px-3 py-1.5 text-center text-xs transition-colors duration-150 ${
                    isActive
                      ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--section-tint)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
