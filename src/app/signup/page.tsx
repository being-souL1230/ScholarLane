"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { useStore } from "@/lib/store";

export default function SignupPage() {
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
        Begin
      </p>
      <h1>A desk of your own.</h1>
      <p className="lede">No long form. Tell ScholarLane who you are, then shape the fit once you are inside.</p>
      <AuthForm mode="signup" />
    </main>
  );
}
