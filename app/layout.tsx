import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LearnFlow - AI-Assisted Course Management",
  description: "Full-stack course management platform with AI-powered quiz generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {return (
	    <html
	      lang="en"
	      className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
	    >
	      <body className="min-h-full flex flex-col font-sans">
	        <div className="flex-1">
	          {children}
	        </div>
	        <Footer />
	        <Toaster />
	      </body>
	    </html>
	  );
}
