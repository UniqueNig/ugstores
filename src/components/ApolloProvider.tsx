"use client";

import { ApolloProvider } from "@apollo/client/react";
import { client } from "@/src/lib/apolloClient";
import { ThemeProvider } from "next-themes";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class" // applies "dark" class to <html>
      defaultTheme="system" // respects OS preference
      enableSystem // enables system detection
      disableTransitionOnChange={false}
    >
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </ThemeProvider>
  );
}
