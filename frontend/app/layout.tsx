import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, Barlow } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-ibm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Winnipeg Relocation Intelligence",
  description:
    "The most persuasive relocation argument a CFO and HR Director could see in the same room.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${dmSans.variable} ${barlow.variable} antialiased`}
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
