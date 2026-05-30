"use client";

import { useState } from "react";
import { Save, Lock, Trash2, Check } from "lucide-react";
import AuthInput from "@/src/components/auth/AuthInput";
// import gql from "graphql-tag";
import { gql } from "@apollo/client";
import * as yup from "yup";
import { useFormik } from "formik";
import { useMutation, useQuery } from "@apollo/client/react";
import { client } from "@/src/lib/apolloClient";
import ConfirmModal from "@/src/components/admindashboard/ConfirmModal";

const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile(
    $name: String!
    $email: String!
    $phone: String!
    $address: String!
  ) {
    updateProfile(
      name: $name
      email: $email
      phone: $phone
      address: $address
    ) {
      id
      name
      email
      phone
      address
      createdAt
    }
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      phone
      address
      createdAt
    }
  }
`;

const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($current: String!, $new: String!) {
    changePassword(currentPassword: $current, newPassword: $new)
  }
`;

const DELETE_ACCOUNT_MUTATION = gql`
  mutation DeleteAccount {
    deleteAccount
  }
`;

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const profileSchema = yup.object().shape({
    name: yup.string().required("Full name is required"),
    email: yup
      .string()
      .email("Enter a valid email")
      .required("Email is required"),
    phone: yup
      .string()
      .min(10, "Enter a valid phone number")
      .required("Phone number is required"),
    address: yup.string().required("Address is required"),
  });

  const passwordSchema = yup.object().shape({
    current: yup.string().required("Current password is required"),
    new: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .required("New password is required"),
    confirm: yup
      .string()
      .oneOf([yup.ref("new")], "Passwords do not match")
      .required("Confirm your password"),
  });

  // const token =
  //   typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const { data, loading: userLoading } = useQuery<{
    me: {
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
      createdAt: string;
    };
  }>(ME_QUERY);

  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE_MUTATION, {
    onCompleted: (data) => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    refetchQueries: [{ query: ME_QUERY }],

    onError: (err) => {
      // console.log("UPDATE ERROR:", err.message);
    },
  });

  const [changePassword, { loading: pwLoading }] = useMutation(
    CHANGE_PASSWORD_MUTATION,
    {
      onCompleted: () => {
        setPwSaved(true);
        setTimeout(() => setPwSaved(false), 2500);
      },
    },
  );

  const [deleteAccount, { loading: deleting }] = useMutation(
    DELETE_ACCOUNT_MUTATION,
    {
      onCompleted: () => {
        document.cookie = "user_token=; Max-Age=0; path=/";
        window.location.href = "/login";

        // redirect
        // window.location.href = "/register";
      },
    },
  );
  const passwordFormik = useFormik({
    initialValues: {
      current: "",
      new: "",
      confirm: "",
    },
    validationSchema: passwordSchema,
    onSubmit: async (values) => {
      await changePassword({
        variables: {
          current: values.current,
          new: values.new,
        },
      });
    },
  });

  const formik = useFormik({
    initialValues: {
      name: data?.me?.name || "",
      email: data?.me?.email || "",
      phone: data?.me?.phone || "",
      address: data?.me?.address || "",
      // createdAt: data?.me?.createdAt || "",
    },
    enableReinitialize: true, // 🔥 THIS IS THE MAGIC
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      // console.log("SUBMITTING", values);
      await updateProfile({
        variables: values,
      });
    },
  });

  if (userLoading) {
    return <div className="p-6">Loading profile...</div>;
  }

  console.log("CREATED AT:", data?.me?.createdAt);
  const createdAt = data?.me?.createdAt;

  const date = createdAt
    ? new Date(typeof createdAt === "string" ? createdAt : Number(createdAt))
    : null;

  console.log(date);

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h2
          className="text-2xl font-black font-['Playfair_Display']"
          style={{ color: "var(--text-primary)" }}
        >
          Profile
        </h2>
        <p
          className="text-sm font-['DM_Sans'] mt-1"
          style={{ color: "var(--text-muted)" }}
        >
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black font-['Playfair_Display'] shrink-0"
          style={{ backgroundColor: "var(--accent)", color: "#16240f" }}
        >
          {(data?.me?.name || "U").charAt(0).toUpperCase()}
        </div>
        <div>
          <p
            className="text-sm font-bold font-['DM_Sans']"
            style={{ color: "var(--text-primary)" }}
          >
            {data?.me?.name || "User"}
          </p>
          <p
            className="text-xs font-['DM_Sans'] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {data?.me?.email || ""}
          </p>
          <p
            className="text-[10px] tracking-widest uppercase mt-1 font-['DM_Sans'] font-bold"
            style={{ color: "var(--accent)" }}
          >
            Member since{" "}
            {date && !isNaN(date.getTime())
              ? date.toLocaleDateString("en-GB", {
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>
      </div>

      {/* Personal info */}
      <div className="glass rounded-2xl p-6">
        <h3
          className="text-xs tracking-[0.2em] uppercase font-bold font-['DM_Sans'] mb-6"
          style={{ color: "var(--text-muted)" }}
        >
          Personal Information
        </h3>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
          <AuthInput
            name="name"
            label="Full Name"
            value={formik.values.name}
            onChange={(e) => formik.setFieldValue("name", e.target.value)}
            placeholder="Your full name"
            // onBlur={() => formik.setFieldTouched("name", true)}
            error={formik.errors.name}
            touched={formik.touched.name}
          />
          <AuthInput
            name="email"
            label="Email Address"
            type="email"
            value={formik.values.email}
            onChange={(e) => formik.setFieldValue("email", e.target.value)}
            placeholder="your@email.com"
            success={formik.values.email.includes("@")}
            onBlur={() => formik.setFieldTouched("email", true)}
            error={formik.errors.email}
            touched={formik.touched.email}
          />
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans']"
              style={{ color: "var(--text-muted)" }}
            >
              Phone Number
            </label>
            <input
              name="phone"
              type="tel"
              value={formik.values.phone}
              onChange={(e) => formik.setFieldValue("phone", e.target.value)}
              placeholder="+234 800 000 0000"
              className="w-full px-4 py-3.5 rounded-xl text-sm font-['DM_Sans'] outline-none border transition-all duration-200"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              onBlur={() => formik.setFieldTouched("phone", true)}
            />
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.phone}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans']"
              style={{ color: "var(--text-muted)" }}
            >
              Address
            </label>
            <input
              name="address"
              type="text"
              value={formik.values.address}
              onChange={(e) => formik.setFieldValue("address", e.target.value)}
              placeholder="123 Main Street, City, Country"
              className="w-full px-4 py-3.5 rounded-xl text-sm font-['DM_Sans'] outline-none border transition-all duration-200"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              onBlur={() => formik.setFieldTouched("address", true)}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] transition-all duration-300 hover:opacity-80"
              style={{
                backgroundColor: saved ? "var(--accent-2)" : "var(--accent)",
                color: saved ? "#fff" : "#16240f",
              }}
            >
              {saved ? (
                <>
                  <Check size={13} /> Saved!
                </>
              ) : (
                <>
                  <Save size={13} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock size={14} style={{ color: "var(--accent)" }} />
          <h3
            className="text-xs tracking-[0.2em] uppercase font-bold font-['DM_Sans']"
            style={{ color: "var(--text-muted)" }}
          >
            Change Password
          </h3>
        </div>
        <form
          onSubmit={passwordFormik.handleSubmit}
          className="flex flex-col gap-5"
        >
          <AuthInput
            name="current"
            label="Current Password"
            type="password"
            value={passwordFormik.values.current}
            onChange={(e) =>
              passwordFormik.setFieldValue("current", e.target.value)
            }
            // onChange={(value) => passwordFormik.setFieldValue("current", value)}
            placeholder="••••••••"
          />
          <AuthInput
            name="new"
            label="New Password"
            type="password"
            value={passwordFormik.values.new}
            onChange={(e) =>
              passwordFormik.setFieldValue("new", e.target.value)
            }
            placeholder="••••••••"
            error={passwordFormik.errors.new}
          />
          <AuthInput
            label="Confirm New Password"
            type="password"
            value={passwordFormik.values.confirm}
            onChange={(e) =>
              passwordFormik.setFieldValue("confirm", e.target.value)
            }
            placeholder="••••••••"
            success={
              passwordFormik.values.confirm.length > 0 &&
              passwordFormik.values.confirm === passwordFormik.values.new
            }
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] transition-all duration-300 hover:opacity-80"
              style={{
                backgroundColor: pwSaved ? "var(--accent-2)" : "var(--accent)",
                color: pwSaved ? "#fff" : "#16240f",
              }}
            >
              {pwSaved ? (
                <>
                  <Check size={13} /> Updated!
                </>
              ) : (
                <>
                  <Lock size={13} /> Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div
        className="glass rounded-2xl p-6"
        style={{ border: "1px solid color-mix(in srgb, #ef4444 30%, transparent)" }}
      >
        <h3
          className="text-xs tracking-[0.2em] uppercase font-bold font-['DM_Sans'] mb-2"
          style={{ color: "#ef4444" }}
        >
          Danger Zone
        </h3>
        <p
          className="text-sm font-['DM_Sans'] mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>

        <ConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={async () => {
            await deleteAccount();
            setIsDeleteOpen(false);
          }}
          title="Delete Account"
          message="This will permanently delete your account and all associated data. This action cannot be undone."
        />

        <button
          onClick={() => setIsDeleteOpen(true)}
          disabled={deleting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border transition-opacity hover:opacity-70"
          style={{ borderColor: "#ef4444", color: "#ef4444" }}
        >
          <Trash2 size={13} />
          {deleting ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </div>
  );
}
