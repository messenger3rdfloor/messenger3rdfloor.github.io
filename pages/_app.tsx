import type { AppProps } from "next/app";
import GameProvider from "@/context/game-context";
import "@/styles/globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GameProvider>
      <GoogleAnalytics />
      <Component {...pageProps} />
    </GameProvider>
  );
}
