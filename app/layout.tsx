import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "N8N Templates Gallery",
  description: "Discover amazing workflow templates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}