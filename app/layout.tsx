import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

export const metadata: Metadata = {
  title: "yippee",
  description: "yippee",
  icons: {
    icon: "/yippee.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      {/* `suppressHydrationWarning` only affects the html tag,
      // and is needed by `ThemeProvider` which sets the theme
      // class attribute on it */}
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased">
          <ThemeProvider attribute="class">{children}</ThemeProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
