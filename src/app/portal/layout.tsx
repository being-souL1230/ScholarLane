"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/shell";
import { useStore } from "@/lib/store";

export default function PortalLayout({ children }: { children: ReactNode }) {
  const { ready, user } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready) {
    return (
      <div className="loading-stage" role="status">
        <div>
          <div className="pulse-ring" aria-hidden />
          <p>Gathering your path…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <Shell>{children}</Shell>;
}
