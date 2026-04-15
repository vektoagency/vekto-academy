import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vekto Academy — Научи AI видео. Получи реална работа.",
  description: "Платформа за AI видео съдържание от Vekto Agency. Курс, общност и job pipeline — всичко на едно място. Влезни и започни.",
  keywords: ["AI видео", "AI курс", "видео продукция", "Vekto Academy", "freelance", "AI съдържание", "онлайн курс"],
  authors: [{ name: "Vekto Agency", url: "https://vektoagency.com" }],
  metadataBase: new URL("https://vektoacademy.com"),
  openGraph: {
    title: "Vekto Academy — Научи AI видео. Получи реална работа.",
    description: "Учиш от агенция с реални клиенти. Докажи се — и ти плащаме. Курс + общност + job pipeline на едно място.",
    url: "https://vektoacademy.com",
    siteName: "Vekto Academy",
    locale: "bg_BG",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vekto Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vekto Academy — Научи AI видео. Получи реална работа.",
    description: "Учиш от агенция с реални клиенти. Докажи се — и ти плащаме.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="bg" className={`${geist.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-[#080808] text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
