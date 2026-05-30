"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isTokenExpired } from "@/src/lib/authClient";
import { client } from "@/src/lib/apolloClient";

const getCookie = (name: string) => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
};

export const useAutoLogout = (role: "admin" | "user") => {
  const router = useRouter();

  useEffect(() => {
    const tokenName = role === "admin" ? "admin_token" : "user_token";

    const checkToken = () => {
      const token = getCookie(tokenName);
      if (!token) return;

      if (isTokenExpired(token)) {
        document.cookie = `${tokenName}=; Max-Age=0; path=/`;
        router.push(role === "admin" ? "/admin/login" : "/login");
      }
    };

    checkToken();
    const interval = setInterval(checkToken, 60000);

    return () => clearInterval(interval);
  }, [router, role]);
};