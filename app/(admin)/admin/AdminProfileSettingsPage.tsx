"use client";

import { useState } from "react";
import {
  Save, Lock, Check, Bell, Globe, Shield, CreditCard, Loader2,
} from "lucide-react";
import AuthInput from "@/src/components/auth/AuthInput";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useFormik } from "formik";
import * as yup from "yup";
import { siteConfig } from "@/src/config/site";

// ─── Queries & Mutations ─────────────────────────────────────────────────────

const ME_QUERY = gql`
  query Me {
    me { id name email phone address role createdAt }
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String!, $email: String!, $phone: String, $address: String) {
    updateProfile(name: $name, email: $email, phone: $phone, address: $address) {
      id name email
    }
  }
`;

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

const GET_SETTINGS = gql`
  query {
    settings {
      id storeName currency contactEmail whatsapp
      paystackPublicKey paystackSecretKey emailNotifs orderNotifs
    }
  }
`;

const UPDATE_SETTINGS = gql`
  mutation UpdateSettings(
    $storeName: String $currency: String $contactEmail: String
    $whatsapp: String $paystackPublicKey: String $paystackSecretKey: String
    $emailNotifs: Boolean $orderNotifs: Boolean
  ) {
    updateSettings(
      storeName: $storeName currency: $currency contactEmail: $contactEmail
      whatsapp: $whatsapp paystackPublicKey: $paystackPublicKey
      paystackSecretKey: $paystackSecretKey emailNotifs: $emailNotifs orderNotifs: $orderNotifs
    ) {
      id storeName
    }
  }
`;

// ─── Admin Profile Page ──────────────────────────────────────────────────────
export function AdminProfilePage() {
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const { data, loading } = useQuery<{
    me: { id: string; name: string; email: string; phone?: string; address?: string; role: string; createdAt: string };
  }>(ME_QUERY);

  const [updateProfile, { loading: saving }] = useMutation(UPDATE_PROFILE, {
    onCompleted: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); },
    refetchQueries: [{ query: ME_QUERY }],
  });

  const [changePassword, { loading: pwLoading }] = useMutation(CHANGE_PASSWORD, {
    onCompleted: () => {
      setPwSaved(true);
      pwFormik.resetForm();
      setTimeout(() => setPwSaved(false), 2500);
    },
    onError: (err) => setPwError(err.message),
  });

  const profileFormik = useFormik({
    initialValues: {
      name: data?.me?.name ?? "",
      email: data?.me?.email ?? "",
    },
    enableReinitialize: true,
    validationSchema: yup.object({
      name: yup.string().required("Name is required"),
      email: yup.string().email("Invalid email").required("Email is required"),
    }),
    onSubmit: async (values) => {
      await updateProfile({ variables: values });
    },
  });

  const pwFormik = useFormik({
    initialValues: { currentPassword: "", newPassword: "", confirm: "" },
    validationSchema: yup.object({
      currentPassword: yup.string().required("Required"),
      newPassword: yup.string().min(8, "Min 8 characters").required("Required"),
      confirm: yup.string().oneOf([yup.ref("newPassword")], "Passwords do not match").required("Required"),
    }),
    onSubmit: async (values) => {
      setPwError("");
      await changePassword({ variables: { currentPassword: values.currentPassword, newPassword: values.newPassword } });
    },
  });

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="animate-spin" size={24} style={{ color: "var(--accent)" }} />
    </div>
  );

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>
          My Profile
        </h2>
        <p className="text-sm font-['DM_Sans'] mt-1" style={{ color: "var(--text-muted)" }}>
          Manage your admin account information.
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black font-['Playfair_Display'] shrink-0"
          style={{ backgroundColor: "var(--accent)", color: "#16240f" }}>
          {(data?.me?.name ?? "A").charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>
            {data?.me?.name}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <Shield size={11} style={{ color: "var(--accent)" }} />
            <span className="text-[10px] tracking-widest uppercase font-bold font-['DM_Sans']" style={{ color: "var(--accent)" }}>
               {data?.me?.role === "superadmin" ? "Super Admin" : "Admin"}
            </span>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans'] mb-5" style={{ color: "var(--text-muted)" }}>
          Personal Information
        </h3>
        <form onSubmit={profileFormik.handleSubmit} className="space-y-4">
          <AuthInput
            label="Full Name"
            value={profileFormik.values.name}
            onChange={(e) => profileFormik.setFieldValue("name", e.target.value)}
            error={profileFormik.errors.name}
            touched={profileFormik.touched.name}
            success={!profileFormik.errors.name && profileFormik.values.name.length > 1}
          />
          <AuthInput
            label="Email Address"
            type="email"
            value={profileFormik.values.email}
            onChange={(e) => profileFormik.setFieldValue("email", e.target.value)}
            error={profileFormik.errors.email}
            touched={profileFormik.touched.email}
            success={!profileFormik.errors.email && profileFormik.values.email.includes("@")}
          />
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-all"
              style={{ backgroundColor: saved ? "var(--accent-2)" : "var(--accent)", color: saved ? "#fff" : "#16240f" }}>
              {saved ? <><Check size={13} /> Saved!</> : saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Save size={13} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={14} style={{ color: "var(--accent)" }} />
          <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
            Change Password
          </h3>
        </div>
        <form onSubmit={pwFormik.handleSubmit} className="space-y-4">
          <AuthInput
            label="Current Password"
            type="password"
            value={pwFormik.values.currentPassword}
            onChange={(e) => { pwFormik.setFieldValue("currentPassword", e.target.value); setPwError(""); }}
            placeholder="••••••••"
          />
          <AuthInput
            label="New Password"
            type="password"
            value={pwFormik.values.newPassword}
            onChange={(e) => { pwFormik.setFieldValue("newPassword", e.target.value); setPwError(""); }}
            placeholder="••••••••"
            error={pwFormik.errors.newPassword}
            touched={pwFormik.touched.newPassword}
          />
          <AuthInput
            label="Confirm New Password"
            type="password"
            value={pwFormik.values.confirm}
            onChange={(e) => { pwFormik.setFieldValue("confirm", e.target.value); setPwError(""); }}
            placeholder="••••••••"
            error={pwFormik.errors.confirm}
            touched={pwFormik.touched.confirm}
            success={pwFormik.values.confirm.length > 0 && pwFormik.values.confirm === pwFormik.values.newPassword}
          />
          {pwError && (
            <p className="text-xs font-['DM_Sans']" style={{ color: "#ef4444" }}>{pwError}</p>
          )}
          <div className="flex justify-end">
            <button type="submit" disabled={pwLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80"
              style={{ backgroundColor: pwSaved ? "var(--accent-2)" : "var(--accent)", color: pwSaved ? "#fff" : "#16240f" }}>
              {pwSaved ? <><Check size={13} /> Updated!</> : pwLoading ? <><Loader2 size={13} className="animate-spin" /> Updating...</> : <><Lock size={13} /> Update Password</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Admin Settings Page ─────────────────────────────────────────────────────
export function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const { data, loading } = useQuery<{
    settings: {
      storeName: string; currency: string; contactEmail: string; whatsapp: string;
      paystackPublicKey: string; paystackSecretKey: string; emailNotifs: boolean; orderNotifs: boolean;
    };
  }>(GET_SETTINGS);

  const [updateSettings, { loading: saving }] = useMutation(UPDATE_SETTINGS, {
    onCompleted: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); },
    refetchQueries: [{ query: GET_SETTINGS }],
  });

  const formik = useFormik({
    initialValues: {
      storeName: data?.settings?.storeName ?? siteConfig.name,
      currency: data?.settings?.currency ?? "NGN",
      contactEmail: data?.settings?.contactEmail ?? "",
      whatsapp: data?.settings?.whatsapp ?? "",
      paystackPublicKey: data?.settings?.paystackPublicKey ?? "",
      paystackSecretKey: data?.settings?.paystackSecretKey ?? "",
      emailNotifs: data?.settings?.emailNotifs ?? true,
      orderNotifs: data?.settings?.orderNotifs ?? true,
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      await updateSettings({ variables: values });
    },
  });

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button type="button" onClick={() => onChange(!value)}
      className="relative w-10 h-5 rounded-full transition-colors shrink-0"
      style={{ backgroundColor: value ? "var(--accent)" : "var(--border)" }}>
      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
        style={{ transform: value ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  );

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm font-['DM_Sans'] outline-none border transition-all";
  const inputStyle = { backgroundColor: "var(--bg-primary)", borderColor: "var(--border)", color: "var(--text-primary)" };
  const labelClass = "text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans'] block mb-1.5";

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="animate-spin" size={24} style={{ color: "var(--accent)" }} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-black font-['Playfair_Display']" style={{ color: "var(--text-primary)" }}>
          Settings
        </h2>
        <p className="text-sm font-['DM_Sans'] mt-1" style={{ color: "var(--text-muted)" }}>
          Configure your store preferences.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        {/* Store info */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Globe size={14} style={{ color: "var(--accent)" }} />
            <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
              Store Information
            </h3>
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--text-muted)" }}>Store Name</label>
            <input value={formik.values.storeName} onChange={(e) => formik.setFieldValue("storeName", e.target.value)}
              className={inputClass} style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={{ color: "var(--text-muted)" }}>Contact Email</label>
              <input type="email" value={formik.values.contactEmail}
                onChange={(e) => formik.setFieldValue("contactEmail", e.target.value)}
                className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={{ color: "var(--text-muted)" }}>WhatsApp Number</label>
              <input value={formik.values.whatsapp}
                onChange={(e) => formik.setFieldValue("whatsapp", e.target.value)}
                placeholder="2348012345678" className={inputClass} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--text-muted)" }}>Currency</label>
            <select value={formik.values.currency} onChange={(e) => formik.setFieldValue("currency", e.target.value)}
              className={inputClass} style={inputStyle}>
              {["NGN", "USD", "GBP", "EUR"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Payments */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard size={14} style={{ color: "var(--accent)" }} />
            <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
              Payment Gateway
            </h3>
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--text-muted)" }}>Paystack Public Key</label>
            <input value={formik.values.paystackPublicKey}
              onChange={(e) => formik.setFieldValue("paystackPublicKey", e.target.value)}
              placeholder="pk_live_xxxxxxxxxxxx" className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={{ color: "var(--text-muted)" }}>Paystack Secret Key</label>
            <input type="password" value={formik.values.paystackSecretKey}
              onChange={(e) => formik.setFieldValue("paystackSecretKey", e.target.value)}
              placeholder="sk_live_xxxxxxxxxxxx" className={inputClass} style={inputStyle} />
          </div>
          <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
            Get your keys from your{" "}
            <a href="https://dashboard.paystack.com" target="_blank" className="underline" style={{ color: "var(--accent)" }}>
              Paystack Dashboard
            </a>.
          </p>
        </div>

        {/* Notifications */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Bell size={14} style={{ color: "var(--accent)" }} />
            <h3 className="text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>
              Notifications
            </h3>
          </div>
          {[
            { label: "Email Notifications", sub: "Receive updates about orders and customers via email", field: "emailNotifs" },
            { label: "New Order Alerts",    sub: "Get notified immediately when a new order is placed", field: "orderNotifs" },
          ].map(({ label, sub, field }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="text-sm font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>{label}</p>
                <p className="text-xs font-['DM_Sans']" style={{ color: "var(--text-muted)" }}>{sub}</p>
              </div>
              <Toggle
                value={formik.values[field as keyof typeof formik.values] as boolean}
                onChange={(v) => formik.setFieldValue(field, v)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-all"
            style={{ backgroundColor: saved ? "var(--accent-2)" : "var(--accent)", color: saved ? "#fff" : "#16240f" }}>
            {saved ? <><Check size={13} /> Saved!</> : saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Save size={13} /> Save Settings</>}
          </button>
        </div>
      </form>
    </div>
  );
}