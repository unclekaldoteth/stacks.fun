import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Stacks.fun - Token Launchpad on Stacks",
  description: "Deploy and trade tokens on the Stacks blockchain with a bonding curve, secured by Bitcoin.",
  keywords: ["Stacks", "STX", "Token", "Launchpad", "Bonding Curve", "Web3"],
  openGraph: {
    title: "Stacks.fun - Token Launchpad on Stacks",
    description: "The most degenerate token launchpad on Stacks.",
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
        <WalletProvider>
          <ToastProvider>
            <Navbar />
            <main>
              {children}
            </main>
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}

