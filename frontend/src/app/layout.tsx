import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/components/I18nProvider";
import { UserProvider } from "@/contexts/UserContext";
import { NetworkProvider } from "@/contexts/NetworkContext";
import MainLayout from "@/components/layout/MainLayout";
import { SidePanelProvider } from "@/contexts/SidePanelContext";
import { HeroUIClientProvider } from "@/components/providers/hero-ui-provider";
// import { AppKitProvider } from "@/contexts/appkit";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GameCacheProvider } from "@/contexts/GameCacheContext";
import ThemedToastContainer from "@/components/ThemedToastContainer";
import Script from "next/script";

export const metadata: Metadata = {
  title: "SpinFox - Premium Gaming Platform",
  description:
    "Experience the best in online gaming with SpinFox. Play, win, and enjoy premium casino games.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="SpinFox" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="h-full">
        <ThemeProvider>
          <NetworkProvider>
            <UserProvider>
              <GameCacheProvider>
                <I18nProvider>
                  <SidePanelProvider>
                    <HeroUIClientProvider>
                      <MainLayout>{children}</MainLayout>
                    </HeroUIClientProvider>
                  </SidePanelProvider>
                </I18nProvider>
              </GameCacheProvider>
            </UserProvider>
          </NetworkProvider>
          <ThemedToastContainer />
        </ThemeProvider>
        {/* Load LiveAgent script globally */}
        <Script
          id="liveagent-script"
          strategy="afterInteractive"
          src="https://spinfox.ladesk.com/scripts/track.js"
        />
      </body>
    </html>
  );
}
