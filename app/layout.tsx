import type React from "react";
import "./globals.css";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Difras - AI-Powered Documentation Platform",
  description:
    "Simplify the documentation process for researchers with AI-generated LaTeX documents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
    >
      <html lang="en" className="scroll-smooth">
        <body
          className={`${poppins.variable} font-sans antialiased flex flex-col min-h-screen`}
        >
          <div id="__next" className="flex flex-col min-h-screen">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
