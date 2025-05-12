import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import ClientNavigation from "@/components/header/ClientNavigation"; // Import ClientNavigation
import ClientCartSidebar from "@/components/cart/ClientCartSidebar";
// import Copyright from "@/components/ui/Copyright";
import Footer from "@/components/footer/Footer"; // Add this import

// Remove dynamic import and HeaderPlaceholder
// const NavigationHeader = dynamic(
//   () => import('@/components/header/NavigationHeader'),
//   { ssr: false, loading: () => <HeaderPlaceholder /> }
// );

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MALIKLI1992",
  description: "Exclusive periodic drops.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen bg-white`}>
        <AuthProvider>
          <CartProvider>
            <ClientNavigation />
            <ClientCartSidebar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            {/* <Copyright /> */}
            <Footer /> {/* Add the Footer component here */}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
