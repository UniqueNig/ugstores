"use client";

import { AlertTriangle, X } from "lucide-react";

type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
};

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Delete", loading }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm glass-strong rounded-3xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
              <AlertTriangle size={16} />
            </div>
            <h3 className="font-bold font-['DM_Sans']" style={{ color: "var(--text-primary)" }}>{title}</h3>
          </div>
          <button onClick={onClose} className="hover:opacity-60 transition-opacity" style={{ color: "var(--text-muted)" }}><X size={16} /></button>
        </div>
        <p className="text-sm font-['DM_Sans']" style={{ color: "var(--text-secondary)" }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] border hover:opacity-70 transition-opacity"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-['DM_Sans'] hover:opacity-80 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "#ef4444", color: "#fff" }}>
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}