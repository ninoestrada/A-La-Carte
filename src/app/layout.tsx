import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MantineProvider, createTheme } from "@mantine/core";
import { cormorant } from "@/lib/fonts";

import "@mantine/core/styles.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const theme = createTheme({
  components: {
    Tooltip: {
      styles: {
        tooltip: {
          fontFamily: cormorant.style.fontFamily,
          fontSize: "17px",
          fontWeight: 500,
          letterSpacing: "0.02em",
        },
      },
    },
  },
});

export const metadata: Metadata = {
  title: "À La Carte",
  description: "Discover recipes made for you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
