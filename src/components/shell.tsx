"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { initials } from "@/lib/format";
import { useStore } from "@/lib/store";

const links = [
  { href: "/portal", label: "Today", icon: "today" },
  { href: "/portal/discover", label: "Discover", icon: "discover" },
  { href: "/portal/applications", label: "Applications", icon: "path" },
  { href: "/portal/reminders", label: "Reminders", icon: "dates" },
  { href: "/portal/saved", label: "Saved", icon: "saved" },
  { href: "/portal/profile", label: "Profile", icon: "you" },
];

function Glyph({ name }: { name: string }) {
  const props = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  if (name === "today") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="3.4" />
        <path d="M12 2.8v2.2M12 19v2.2M2.8 12H5M19 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" />
      </svg>
    );
  }
  if (name === "discover") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
        <path d="M12 4.5v2.2M16.8 7.2l-1.4 1.4" />
      </svg>
    );
  }
  if (name === "path") {
    return (
      <svg {...props}>
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
      </svg>
    );
  }
  if (name === "dates") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4.5l2.8 1.6" />
      </svg>
    );
  }
  if (name === "saved") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <circle cx="12" cy="9" r="3" />
      <path d="M6.5 18.5c1.2-2.4 3.1-3.5 5.5-3.5s4.3 1.1 5.5 3.5" />
    </svg>
  );
}

function active(pathname: string, href: string) {
  if (href === "/portal") return pathname === "/portal";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Shell({ children }: { children: ReactNode }) {
  const { user, logout } = useStore();
  const pathname = usePathname();

  if (!user) return null;

  function leave() {
    logout();
    window.location.href = "/";
  }

  return (
    <div className="app-shell">
      <aside className="rail">
        <Link href="/portal" className="brand rail-brand">
          <span className="brand-mark" aria-hidden />
          ScholarLane
        </Link>
        <nav aria-label="Desk">
          {links.map((link) => {
            const on = active(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={on ? "rail-link active" : "rail-link"}
                aria-current={on ? "page" : undefined}
              >
                <span className={link.icon === "you" ? "orb-btn initials" : "orb-btn"}>
                  {link.icon === "you" ? initials(user.name) : <Glyph name={link.icon} />}
                </span>
                <span className="label">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="rail-foot">
          <button className="text-button" type="button" onClick={leave}>
            Leave
          </button>
        </div>
      </aside>
      <div className="canvas">
        <div className="mobile-mark">
          <Link href="/portal" className="brand">
            <span className="brand-mark" aria-hidden />
            ScholarLane
          </Link>
          <button className="text-button" type="button" onClick={leave}>
            Leave
          </button>
        </div>
        <div className="canvas-inner rise">{children}</div>
      </div>
    </div>
  );
}
