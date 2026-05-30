import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Provider from "@/src/components/ApolloProvider";
import ThemeStyle from "@/src/themes/ThemeStyle";
import { siteConfig } from "@/src/config/site";
import { CartProvider } from "@/src/context/CartContext";
import { ToastProvider } from "@/src/context/ToastContext";
import { WishlistProvider } from "@/src/context/WishlistContext";
import { CouponProvider } from "@/src/context/CouponContext";
// import Provider from "@/src/components/ApolloProvider/apollo-clients";
// import Provider from "@/src/components/ApolloClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Public site URL — set NEXT_PUBLIC_SITE_URL in your env per client deployment
// (e.g. https://clienta.com). Falls back to localhost for local dev.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  // Makes relative OpenGraph/canonical URLs resolve to absolute URLs.
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.seo.titleDefault,
    // Page titles become "Product Name | FanMidCommerce"
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.legalName,
    url: "/",
    title: siteConfig.seo.titleDefault,
    description: siteConfig.seo.description,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme={siteConfig.theme} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,900;1,500;1,600;1,700&family=DM+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* Inject the active theme's colour palette as CSS variables. */}
        <ThemeStyle />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          <ToastProvider>
            <WishlistProvider>
              <CartProvider>
                <CouponProvider>{children}</CouponProvider>
              </CartProvider>
            </WishlistProvider>
          </ToastProvider>
        </Provider>
        {/* Vercel Web Analytics — page views (free) + custom events below.
            No-ops in local dev and when analytics isn't enabled on the project. */}
        <Analytics />
      </body>
    </html>
  );
}
