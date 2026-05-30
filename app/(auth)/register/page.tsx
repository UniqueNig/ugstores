"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import AuthCard from "@/src/components/auth/AuthCard";
import AuthInput from "@/src/components/auth/AuthInput";
import { siteConfig } from "@/src/config/site";
import { Loader2, Check } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { useFormik } from "formik";
import * as yup from "yup";

const REGISTER_MUTATION = gql`
  mutation Register(
    $name: String!
    $email: String!
    $phone: String!
    $address: String!
    $password: String!
  ) {
    register(
      name: $name
      email: $email
      phone: $phone
      address: $address
      password: $password
    ) {
      id
      name
      phone
      address
      email
    }
  }
`;

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

export default function Register() {
  const router = useRouter();
  const [register, { data, loading, error }] = useMutation<{
    register: {
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
    };
  }>(REGISTER_MUTATION, {
    onCompleted: (data) => {
      // Auto redirect to login after registration
      router.push("/login?registered=true");
    },
    onError: (err) => {
      setServerError(
        err.message?.includes("already exists")
          ? "An account with this email already exists"
          : "Something went wrong. Please try again.",
      );
    },
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirm: "",
    },
    onSubmit: async (values) => {
      setServerError("");
      await register({
        variables: {
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          password: values.password,
        },
      });
    },

    validationSchema: yup.object().shape({
      name: yup.string().required("Full name is required"),
      email: yup
        .string()
        .email("Enter a valid email address")
        .required("Email is required"),
      phone: yup
        .string()
        .matches(
          /^(\+?\d{1,3}[- ]?)?\d{10}$/,
          "Enter a valid phone number (10 digits, optional country code)",
        )
        .required("Phone number is required"),
      address: yup.string().required("Address is required"),
      password: yup
        .string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
      confirm: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords do not match")
        .required("Please confirm your password"),
    }),
  });

  const [serverError, setServerError] = useState("");
  const [showRules, setShowRules] = useState(false);

  return (
    <AuthCard
      title="Create account"
      subtitle={`Create your ${siteConfig.name} account`}
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
        <AuthInput
          name="name"
          label="Full name"
          type="text"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="John Doe"
          error={formik.errors.name}
          touched={formik.touched.name}
          // success={!formik.errors.name && formik.values.name.trim().length > 1}
          // autoComplete="name"
        />

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
          // autoComplete="email"
        />

        <AuthInput
          name="phone"
          label="Phone number"
          type="tel"
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="+234 801 234 5678"
          error={formik.errors.phone}
          touched={formik.touched.phone}
        />

        <AuthInput
          name="address"
          label="Address"
          type="text"
          value={formik.values.address}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="123 Main Street, City, Country"
          error={formik.errors.address}
          touched={formik.touched.address}
        />

        <div>
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
            // autoComplete="new-password"
          />

          {/* Password strength rules */}
          {(showRules || formik.values.password.length > 0) && (
            <div className="mt-2 flex flex-col gap-1">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(formik.values.password);
                return (
                  <div
                    key={rule.label}
                    className="flex items-center gap-2 text-[11px] font-['DM_Sans']"
                    style={{ color: passed ? "#22c55e" : "var(--text-muted)" }}
                  >
                    <Check size={10} strokeWidth={3} />
                    {rule.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <AuthInput
          name="confirm"
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          value={formik.values.confirm}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.confirm}
          touched={formik.touched.confirm}
          success={
            formik.touched.confirm &&
            !formik.errors.confirm &&
            formik.values.confirm === formik.values.password
          }
        />

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

        {/* Terms */}
        <p
          className="text-[11px] font-['DM_Sans'] leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          By creating an account, you agree to our{" "}
          <span
            className="underline cursor-pointer hover:opacity-70 transition-opacity"
            style={{ color: "var(--accent)" }}
          >
            Terms of Service
          </span>{" "}
          and{" "}
          <span
            className="underline cursor-pointer hover:opacity-70 transition-opacity"
            style={{ color: "var(--accent)" }}
          >
            Privacy Policy
          </span>
          .
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-sm font-bold tracking-widest uppercase font-['DM_Sans'] transition-all duration-300 disabled:opacity-60 hover:opacity-90"
          style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </AuthCard>
  );
}
