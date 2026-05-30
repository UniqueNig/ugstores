"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import AuthCard from "@/src/components/auth/AuthCard";
import AuthInput from "@/src/components/auth/AuthInput";
import { siteConfig } from "@/src/config/site";
import { Loader2 } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { useFormik } from "formik";
import * as yup from "yup";
import { client } from "@/src/lib/apolloClient";

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

export default function Login() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const [login, { data, loading, error }] = useMutation<LoginResponse>(
    LOGIN_MUTATION,
    {
      onCompleted: (data) => {
        // localStorage.setItem("token", data.login.token);
        const isProduction = process.env.NODE_ENV === "production";

        // clear old cookie
        document.cookie = "user_token=; Max-Age=0; path=/";

        // set new cookie — 1 year, matches the user JWT lifetime (stay logged in)
        document.cookie = `user_token=${data.login.token}; path=/; max-age=31536000; SameSite=Strict;${isProduction ? " Secure;" : ""}`;
        // ✅ OPTIONAL (refresh Apollo cache)
        client.resetStore();
        router.push("/dashboard");
      },
      onError: (err) => {
        setServerError(
          err.message?.includes("Invalid credentials")
            ? "Incorrect email or password"
            : "Something went wrong. Please try again.",
        );
      },
    },
  );

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values) => {
      setServerError("");
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
        .min(8, "Password must be at least 8 characters")
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
    <AuthCard
      title="Welcome back"
      subtitle={`Sign in to your ${siteConfig.name} account`}
      footerText="Don't have an account?"
      footerLinkText="Create one"
      footerLinkHref="/register"
    >
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
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

        {/* Forgot password */}
        <div className="flex justify-end -mt-2">
          <Link
            href="/forgot-password"
            className="text-xs font-['DM_Sans'] transition-opacity hover:opacity-60"
            style={{ color: "var(--text-muted)" }}
          >
            Forgot password?
          </Link>
        </div>

        {/* Server error */}
        {serverError && (
          <div
            className="px-4 py-3 rounded-xl text-sm font-['DM_Sans'] border"
            style={{
              backgroundColor: "color-mix(in srgb, #ef4444 10%, transparent)",
              borderColor: "color-mix(in srgb, #ef4444 30%, transparent)",
              color: "#ef4444",
            }}
          >
            {serverError}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-sm font-bold tracking-widest uppercase font-['DM_Sans'] transition-all duration-300 disabled:opacity-60 mt-2 hover:opacity-90"
          style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </AuthCard>
  );
}
