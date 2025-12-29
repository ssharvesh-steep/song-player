import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Player from "@/components/player/Player";
import { AuthProvider } from "@/components/auth/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PWA Music Player",
  description: "Spotify-like PWA Music Player",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <AuthProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <div className="hidden md:block w-[300px] h-full p-2">
              <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto m-2 rounded-2xl glass border-none">
              {children}
            </main>
          </div>

          {/* Persistent Player */}
          <div className="fixed bottom-0 left-0 right-0 h-[90px] glass border-t-0 z-50 backdrop-blur-xl">
            <Player />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
