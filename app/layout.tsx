import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { SafeArea } from "./components/SafeArea";
import { farcasterConfig } from "../farcaster.config";
import { Providers } from "./providers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: farcasterConfig.miniapp.name,
    description: farcasterConfig.miniapp.description,
    openGraph: {
      title: farcasterConfig.miniapp.ogTitle,
      description: farcasterConfig.miniapp.ogDescription,
      images: [farcasterConfig.miniapp.ogImageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: farcasterConfig.miniapp.ogTitle,
      description: farcasterConfig.miniapp.ogDescription,
      images: [farcasterConfig.miniapp.ogImageUrl],
    },
    other: {
      "fc:frame": JSON.stringify({
        version: farcasterConfig.miniapp.version,
        imageUrl: farcasterConfig.miniapp.heroImageUrl,
        button: {
          title: "Play Grid of the Day",
          action: {
            name: "Launch Grid of the Day",
            type: "launch_frame",
          },
        },
      }),
    },
  };
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
          <meta name="theme-color" content="#0a0a0a" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="base:app_id" content="697f86e82aafa0bc9ad8a464" />
        </head>
        <body className={`${inter.variable} ${sourceCodePro.variable} antialiased`}>
          <SafeArea>{children}</SafeArea>
        </body>
      </html>
    </Providers>
  );
}
