import Head from "next/head";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/sidebar";
import "./globals.css";
import { AuthProvider } from "@/contexts/authContext";

export const metadata = {
  title: "Chameleon",
  description: "Chameleon",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/assets/logo.svg" type="image/svg+xml" />
      </Head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Toaster />
          <div className="flex flex-1 bg-base-color">
            <Sidebar />
            <div className="flex flex-col flex-1 h-screen">
              <main className="flex-1 overflow-auto">{children}</main>
              <footer className="h-12 font-bold text-slate-100 text-center py-4">
                @Chameleon
              </footer>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
