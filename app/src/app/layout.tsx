import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ClientNavigation from "@/components/header/ClientNavigation"; // Import ClientNavigation
import Copyright from "@/components/ui/Copyright";

// Remove dynamic import and HeaderPlaceholder
// const NavigationHeader = dynamic(
//   () => import('@/components/header/NavigationHeader'),
//   { ssr: false, loading: () => <HeaderPlaceholder /> }
// );

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "malikli1992 Drops",
  description: "Exclusive periodic drops.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <ClientNavigation /> {/* Use ClientNavigation here */}
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Copyright />
        </AuthProvider>
      </body>
    </html>
  );
}
