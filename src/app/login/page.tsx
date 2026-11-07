"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const { ready, user } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && user) router.replace("/portal");
  }, [ready, user, router]);

  return (
    <main className="gate">
      <Link href="/" className="brand">
        <span className="brand-mark" aria-hidden />
        ScholarLane
      </Link>
      <p className="kicker" style={{ marginTop: 36 }}>
        <i aria-hidden="true" />
        Enter
      </p>
      <h1>Welcome back.</h1>
      <p className="lede">Your awards, dates, and notes are where you left them.</p>
      <AuthForm mode="login" />
    </main>
  );
}
