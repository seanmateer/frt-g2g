import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FRT G2G - Front Range Trail Status",
  description: "Community-driven mountain bike trail conditions for the Front Range of Colorado. Check real-time trail status before you ride.",
  keywords: ["mountain biking", "trail conditions", "Front Range", "Colorado", "MTB", "Denver", "Golden", "Boulder"],
  openGraph: {
    title: "FRT G2G - Front Range Trail Status",
    description: "Community-driven mountain bike trail conditions for the Front Range of Colorado",
    type: "website",
  },
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
