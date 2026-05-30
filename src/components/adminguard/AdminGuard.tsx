"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const tokenName = "admin_token";
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${tokenName}=`))
      ?.split("=")[1];

    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now();

      if (!["admin", "superadmin"].includes(payload.role) || payload.exp * 1000 < now) {
        document.cookie = `${tokenName}=; Max-Age=0; path=/`;
        router.push("/admin/login");
        return;
      }

      setAuthorized(true);

      const timeout = setTimeout(() => {
        document.cookie = `${tokenName}=; Max-Age=0; path=/`;
        router.push("/admin/login");
      }, payload.exp * 1000 - now);

      return () => clearTimeout(timeout);
    } catch {
      document.cookie = `${tokenName}=; Max-Age=0; path=/`;
      router.push("/admin/login");
    }
  }, [router]);

  if (!authorized) return null;
  return <>{children}</>;
}