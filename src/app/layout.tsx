import type { Metadata } from "next";
import { Calistoga, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const calistoga = Calistoga({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-calistoga",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ModuCore",
    template: "%s | ModuCore",
  },
  description:
    "Gestao modular para pequenos negocios de servico em Belo Horizonte.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${calistoga.variable}`}>
      <body>{children}</body>
    </html>
  );
}
