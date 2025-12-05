import type { Metadata } from "next";
import "./globals.css";
import ClientThemeWrapper from "@/components/ClientThemeWrapper.js";


export const metadata: Metadata = {
  title: "Next.js Blog",
  description: "A modern blog with MySQL authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientThemeWrapper>
          {children}
        </ClientThemeWrapper>
      </body>
    </html>
  );
}





