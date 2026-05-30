"use client";

import { useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

type AuthInputProps = {
  name?: string; // ✅ NEW (optional, so it won’t break anything)
  label: string;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // ✅ supports Formik
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; // ✅ NEW
  placeholder?: string;
  error?: string;
  touched?: boolean; // ✅ NEW
  success?: boolean;
};

export default function AuthInput({
  name,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
  success,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const showError = !!error && (touched ?? true); // 👈 smart fallback

  const borderColor = showError
    ? "#ef4444"
    : success
    ? "#22c55e"
    : focused
    ? "var(--accent)"
    : "var(--border)";

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans']"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </label>

      <div className="relative">
        <input
          name={name} // ✅ important for Formik
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e); // ✅ preserve Formik behavior
          }}
          placeholder={placeholder}
          className="w-full px-4 py-3.5 rounded-xl text-sm font-['DM_Sans'] outline-none transition-all duration-200 pr-10"
          style={{
            backgroundColor: "var(--bg-primary)",
            border: `1px solid ${borderColor}`,
            color: "var(--text-primary)",
            boxShadow: focused
              ? `0 0 0 3px color-mix(in srgb, ${borderColor} 15%, transparent)`
              : "none",
          }}
        />

        {/* Right icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="transition-opacity hover:opacity-60"
              style={{ color: "var(--text-muted)" }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          ) : showError ? (
            <AlertCircle size={15} color="#ef4444" />
          ) : success ? (
            <CheckCircle2 size={15} color="#22c55e" />
          ) : null}
        </div>
      </div>

      {/* Error message */}
      {showError && (
        <p
          className="text-xs font-['DM_Sans'] flex items-center gap-1.5"
          style={{ color: "#ef4444" }}
        >
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}