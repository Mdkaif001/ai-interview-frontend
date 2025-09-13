import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import ShaderBackground from "@/components/shader-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Interview Model",
  description: "Development of AI Interview Model by Mohammad Kaif",
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/favicon_lgog.jpg", sizes: "32x32", type: "image/jpg" },
      { url: "/favicon_lgog.jpg", sizes: "16x16", type: "image/jpg" },
    ],
    shortcut: "/favicon.ico",
    other: [{ rel: "manifest", url: "/site.webmanifest" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased !font-thin`}
      >
        <ShaderBackground>
          <Header />

          <main className="h-[calc(100vh-80px)] overflow-y-auto mt-20">
            {children}
          </main>

          <Toaster />
        </ShaderBackground>
      </body>
    </html>
  );
}
