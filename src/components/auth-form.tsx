"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { login, signup } = useStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const signupMode = mode === "signup";

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (signupMode && name.trim().length < 2) {
      setError("A name helps the desk know who arrived.");
      return;
    }
    if (!email.includes("@")) {
      setError("That email does not look complete.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    const result = signupMode
      ? signup(name, email, password)
      : login(email, password);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push("/portal");
  }

  return (
    <form onSubmit={onSubmit} className="stack" noValidate>
      {signupMode ? (
        <label className="field">
          <span>Name</span>
          <input className="line-input" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
        </label>
      ) : null}
      <label className="field">
        <span>Email</span>
        <input
          className="line-input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </label>
      <label className="field">
        <span>Password</span>
        <input
          className="line-input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={signupMode ? "new-password" : "current-password"}
          required
        />
      </label>
      {error ? <p className="issue">{error}</p> : null}
      {signupMode ? (
        <p className="help">A name, an email, a password. The rest can wait until you are inside.</p>
      ) : (
        <p className="help">
          Try the studio desk: maya@scholarlane.studio, password demo1234. Jordan’s desk is jordan@scholarlane.studio, same password.
        </p>
      )}
      <div className="actions">
        <button className="pill" type="submit">
          {signupMode ? "Begin" : "Enter"}
        </button>
        <Link className="quiet-link" href={signupMode ? "/login" : "/signup"}>
          {signupMode ? "I already have a desk" : "Create a desk"}
        </Link>
      </div>
    </form>
  );
}
