"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import AuthCard from "@/src/components/auth/AuthCard";
import AuthInput from "@/src/components/auth/AuthInput";
import { Loader2, CheckCircle } from "lucide-react";

const RESET = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

function ResetContent() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [reset, { loading }] = useMutation(RESET);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    try {
      await reset({ variables: { token, newPassword: password } });
      setDone(true);
    } catch (err) {
      setError((err as Error).message || "Could not reset password.");
    }
  };

  if (!token) {
    return (
      <AuthCard title="Invalid link" subtitle="This reset link is missing or malformed."
        footerText="Need a new link?" footerLinkText="Request one" footerLinkHref="/forgot-password">
        <p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
          Please request a fresh password reset link.
        </p>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Password updated" subtitle="You can now sign in with your new password."
        footerText="" footerLinkText="Go to sign in" footerLinkHref="/login">
        <div className="flex flex-col items-center gap-4 py-4">
          <CheckCircle size={40} style={{ color: "var(--accent-2)" }} />
          <Link href="/login" className="px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80"
            style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
            Sign In
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a strong password you'll remember"
      footerText="Remembered it?" footerLinkText="Back to sign in" footerLinkHref="/login">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <AuthInput name="password" label="New password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        <AuthInput name="confirm" label="Confirm password" type="password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm font-['DM_Sans'] border"
            style={{ backgroundColor: "color-mix(in srgb, #ef4444 10%, transparent)", borderColor: "color-mix(in srgb, #ef4444 30%, transparent)", color: "#ef4444" }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-sm font-bold tracking-widest uppercase font-['DM_Sans'] transition-all duration-300 disabled:opacity-60 mt-2 hover:opacity-90"
          style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
          {loading ? <><Loader2 size={15} className="animate-spin" /> Updating...</> : "Update Password"}
        </button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}><Loader2 className="animate-spin" size={24} style={{ color: "var(--accent)" }} /></div>}>
      <ResetContent />
    </Suspense>
  );
}
