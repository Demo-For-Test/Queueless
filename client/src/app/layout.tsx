import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "QueueLess - Smart Stall Management",
  description: "Skip the line, order digital. The ultimate solution for exhibition and event food stalls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body
        className="font-sans antialiased"
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
