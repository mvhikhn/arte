import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arte - Generative Art",
  description: "Interactive generative art with real-time controls",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link href='https://db.onlinewebfonts.com/c/f05bbbfac1257664fc69ba21f8451b57?family=ABC+Diatype' rel='stylesheet' type='text/css' />
      </head>
      <body className="bg-white" style={{ fontFamily: "'ABC Diatype', -apple-system, BlinkMacSystemFont, sans-serif" }}>{children}</body>
    </html>
  );
}
