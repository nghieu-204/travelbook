import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import AuthModal from "@/components/auth/AuthModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TravelBook | Nền tảng đặt tour số 1",
  description: "Khám phá thế giới với các tour du lịch đa dạng và hấp dẫn.",
};

import Chatbot from "@/components/chat/Chatbot";

import { ConfirmProvider } from "@/providers/ConfirmProvider";
import { OAuthProvider } from "@/providers/OAuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 antialiased`} suppressHydrationWarning>
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            duration: 3000,
            style: {
              fontSize: '16px',
              padding: '16px 24px',
              maxWidth: '500px'
            }
          }} 
        />
        <OAuthProvider>
          <ConfirmProvider>
            {children}
            <AuthModal />
            <Chatbot />
          </ConfirmProvider>
        </OAuthProvider>
      </body>
    </html>
  );
}
