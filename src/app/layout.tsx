import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
const heading = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-heading", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
export const metadata: Metadata = { title: "Edelweiss Swiss Passport", description: "A little Swiss adventure, one delicious order at a time.", icons: { icon: "/android-chrome-512x512.png", apple: "/apple-icon.png" }, appleWebApp: { capable: true, title: "Swiss Passport", statusBarStyle: "default" } };
export const viewport: Viewport = { themeColor: "#5E6F52", width: "device-width", initialScale: 1 };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body className={`${heading.variable} ${body.variable}`}><Script id="install-prompt-capture" strategy="beforeInteractive">{`window.addEventListener('beforeinstallprompt',function(event){event.preventDefault();window.__edelweissInstallPrompt=event;});`}</Script>{children}</body></html>; }
