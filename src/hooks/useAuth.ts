"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const useAuth = (role: "admin" | "user") => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const tokenName = role === "admin" ? "admin_token" : "user_token";
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${tokenName}=`))
      ?.split("=")[1];

    if (!token) {
      router.replace(role === "admin" ? "/admin/login" : "/login");
    } else {
      setLoading(false);
    }
  }, [router, role]);

  return { loading };
};