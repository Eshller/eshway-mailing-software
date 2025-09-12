import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mailway",
  description: "Mailway is an email marketing platform that helps you send emails to your customers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
        />
      </head>
      <body
        className={`${montserrat.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
