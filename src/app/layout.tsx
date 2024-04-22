import { Metadata } from "next";
import * as React from "react";

import "@/styles/globals.css";
import "@/styles/app.css";
import { siteConfig } from "@/constant/config";
import Menu from "@/components/menu";
import Head from 'next/head'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon-16x16.png",
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: `/favicon/site.webmanifest`,
  openGraph: {
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.title,
    images: [`${siteConfig.url}/images/og.jpg`],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [`${siteConfig.url}/images/og.jpg`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
        <Head>
            <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"></meta>
        </Head>
      <body>
        <div id="layout" className="layout">
          <Menu />
          <main className="main w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
