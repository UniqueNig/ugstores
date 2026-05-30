"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import { Lock, Loader2, Shield } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { useFormik } from "formik";
import * as yup from "yup";
import { siteConfig } from "@/src/config/site";
import AuthInput from "@/src/components/auth/AuthInput";
import Logo from "@/src/components/ui/Logo";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        role
      }
    }
  }
`;

type LoginResponse = {
  login: {
    token: string;
    user: {
      id: string;
      email: string;
      role: string;
    };
  };
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [login, { loading }] = useMutation<LoginResponse>(LOGIN_MUTATION, {
onCompleted: (data) => {
  if (!["admin", "superadmin"].includes(data.login.user.role)) {
    setError("Access denied. Admin accounts only.");
    return;
  }

  const isProduction = process.env.NODE_ENV === "production";

  // Clear any old tokens
  document.cookie = "admin_token=; Max-Age=0; path=/";

  // Always set admin_token for both admin and superadmin
  document.cookie = `admin_token=${data.login.token}; path=/; max-age=604800; SameSite=Strict;${isProduction ? " Secure;" : ""}`;

  router.push("/admin/dashboard");
  router.refresh();
},
    onError: (err) => {
      setError(
        err.message?.includes("Invalid credentials")
          ? "Incorrect email or password"
          : "Something went wrong. Please try again.",
      );
    },
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values) => {
      setError("");
      // ✅ Clear any leftover token first
      // localStorage.removeItem("token");
      // document.cookie = "token=; Max-Age=0; path=/"; // also clear old cookie if needed

      await login({
        variables: {
          email: values.email,
          password: values.password,
        },
      });
    },

    validationSchema: yup.object().shape({
      email: yup
        .string()
        .email("Enter a valid email address")
        .required("Email is required"),
      password: yup
        .string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
  });

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <Loader2 className="animate-spin" size={24} style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-6"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Decoration layer — fixed + clipped so it never adds scroll */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -top-20 -right-20 w-125 h-125 rounded-full" style={{ filter: "blur(120px)", opacity: 0.5, backgroundColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }} />
        <div className="absolute -bottom-20 -left-20 w-125 h-125 rounded-full" style={{ filter: "blur(120px)", opacity: 0.5, backgroundColor: "color-mix(in srgb, var(--accent-2) 40%, transparent)" }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <Link href="/">
            <Logo height={40} />
          </Link>
          <div className="inline-flex items-center gap-1.5">
            <Shield size={13} style={{ color: "var(--accent)" }} />
            <p
              className="text-[10px] tracking-[0.3em] uppercase font-['DM_Sans']"
              style={{ color: "var(--text-muted)" }}
            >
              Admin Portal
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-8">
          <h1 className="text-xl font-black font-['Playfair_Display'] mb-1" style={{ color: "var(--text-primary)" }}>
            Sign in
          </h1>
          <p
            className="text-xs font-['DM_Sans'] mb-7"
            style={{ color: "var(--text-muted)" }}
          >
            Restricted to authorized administrators only
          </p>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <AuthInput
              name="email"
              label="Email address"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="you@example.com"
              error={formik.errors.email}
              touched={formik.touched.email}
              success={
                !formik.errors.email &&
                formik.touched.email &&
                formik.values.email.includes("@")
              }
            />

            <AuthInput
              name="password"
              label="Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="••••••••"
              error={formik.errors.password}
              touched={formik.touched.password}
            />

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-xs font-['DM_Sans'] border"
                style={{
                  backgroundColor: "color-mix(in srgb, #ef4444 10%, transparent)",
                  borderColor: "color-mix(in srgb, #ef4444 30%, transparent)",
                  color: "#ef4444",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-sm font-bold tracking-widest uppercase font-['DM_Sans'] transition-opacity hover:opacity-80 disabled:opacity-50 mt-2"
              style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  <Lock size={14} /> Access Admin Panel
                </>
              )}
            </button>
          </form>
        </div>

        <p
          className="text-center text-[10px] font-['DM_Sans'] mt-6"
          style={{ color: "var(--text-muted)" }}
        >
          {siteConfig.name} Admin · Unauthorized access is prohibited
        </p>
      </div>
    </div>
  );
}
