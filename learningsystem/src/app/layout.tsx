import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/app/context/AudioContext"; // Update the import path as needed
import AudioToggle from "@/components/AudioToggle"; // Ensure this component exists

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AudioProvider>
          {/* AudioToggle provides a mute/unmute button */}
          <AudioToggle />
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
