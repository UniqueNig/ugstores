// Title/description are inherited from the root layout (app/layout.tsx).
// Individual pages override them via their own `metadata` / generateMetadata.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}
