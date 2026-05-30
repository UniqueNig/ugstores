"use client";

import AccountHeader from "@/src/components/account/AccountHeader";
import AccountSidebar from "@/src/components/account/AccountSidebar";
import { useAuth } from "@/src/hooks/useAuth";
import { useAutoLogout } from "@/src/hooks/useAutoLogout";
import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import gql from "graphql-tag";

const ME = gql`
  query {
    me {
      id
      name
      email
    }
  }
`;

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAutoLogout("user"); // 🔥 ADD THIS
  const { loading } = useAuth("user");
  const { data } = useQuery<{ me: { name: string; email: string } }>(ME);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  if (loading) return <p>Loading...</p>; // Or spinner
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <AccountSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={data?.me?.name ?? "My Account"}
        userEmail={data?.me?.email ?? ""}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AccountHeader onMenuOpen={() => setSidebarOpen(true)} />
        <main
          className="flex-1 overflow-y-auto p-6 lg:p-8"
          style={{ backgroundColor: "var(--bg-primary)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
