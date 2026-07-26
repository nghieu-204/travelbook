import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import AuthModal from "@/components/auth/AuthModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Travel Booking | Nền tảng đặt tour số 1",
  description: "Khám phá thế giới với các tour du lịch đa dạng và hấp dẫn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 antialiased`}>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        <AuthModal />
      </body>
    </html>
  );
}
