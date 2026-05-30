"use client";

import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import AuthCard from "@/src/components/auth/AuthCard";
import AuthInput from "@/src/components/auth/AuthInput";
import { Loader2, MailCheck } from "lucide-react";

const REQUEST_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [request, { loading }] = useMutation(REQUEST_RESET);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await request({ variables: { email } });
    } catch {
      /* ignore — we don't reveal whether the email exists */
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="If an account exists for that address, we've sent a reset link."
        footerText="Remembered it?"
        footerLinkText="Back to sign in"
        footerLinkHref="/login"
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <MailCheck size={40} style={{ color: "var(--accent)" }} />
          <p className="text-sm font-['DM_Sans'] text-center" style={{ color: "var(--text-muted)" }}>
            The link expires in 1 hour. Check your spam folder if you don't see it.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot password"
      subtitle="Enter your email and we'll send you a reset link"
      footerText="Remembered it?"
      footerLinkText="Back to sign in"
      footerLinkHref="/login"
    >
      <form onSubmit={submit} className="flex flex-col gap-5">
        <AuthInput
          name="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-sm font-bold tracking-widest uppercase font-['DM_Sans'] transition-all duration-300 disabled:opacity-60 mt-2 hover:opacity-90"
          style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
        >
          {loading ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : "Send Reset Link"}
        </button>
      </form>
    </AuthCard>
  );
}
