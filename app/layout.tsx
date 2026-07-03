import type { Metadata } from "next";
import { Source_Code_Pro, Noto_Sans, Courier_Prime } from "next/font/google";
import { getBuildVersion, getSiteUrl } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrl();
const buildVersion = getBuildVersion();
const coverImageUrl = new URL(`/assets/images/Cover.webp?v=${buildVersion}`, siteUrl).toString();
const siteDescription =
  "Designing experiences from insight to interface. UI/UX Designer with 5+ years of experience.";

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-mono",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto",
});

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-courier-prime",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ripa Ahyar — UI/UX Designer",
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ripa Ahyar — UI/UX Designer",
    description: siteDescription,
    images: [
      {
        url: coverImageUrl,
        width: 1586,
        height: 992,
        alt: "Ripa Ahyar cover preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ripa Ahyar — UI/UX Designer",
    description: siteDescription,
    images: [coverImageUrl],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceCodePro.variable} ${notoSans.variable} ${courierPrime.variable}`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=psychiatry,sunny" />
        <link rel="preload" href="/assets/icons/mac-folder-back-opt.svg" as="image" />
        <link rel="preload" href="/assets/icons/mac-folder-front-opt.svg" as="image" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
