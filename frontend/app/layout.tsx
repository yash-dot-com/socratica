import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Curiosity Wallet",
  description: "Gamified voice learning with OpenAI Realtime WebRTC",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
