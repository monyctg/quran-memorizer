import type { Metadata } from "next";
import { Inter, Amiri, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});
const notoBangla = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "700"],
  variable: "--font-bengali",
});

export const metadata: Metadata = {
  title: "Quran Memorizer",
  description: "Learn 2 Ayats a day",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        {/* 👇 ADDED suppressHydrationWarning to body */}
        <body
          suppressHydrationWarning={true}
          className={`${inter.variable} ${amiri.variable} ${notoBangla.variable} font-sans bg-gray-50`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
