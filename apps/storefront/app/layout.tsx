import type { ReactNode } from "react";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { getNavigation } from "../lib/bff";
import "./globals.css";

export const metadata = {
  title: "Dalizebo Commerce",
  description: "Modern commerce by Dalizebo Holdings",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const navigation = await getNavigation();
  return (
    <html lang="en">
      <body>
        <SiteHeader navigation={navigation} />
        {children}
        <SiteFooter navigation={navigation} />
      </body>
    </html>
  );
}
