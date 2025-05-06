import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import Navbar from "~/components/Navbar";
import { Toaster } from "~/components/ui/sonner";
import { cn } from "~/lib/utils";
export const metadata: Metadata = {
  title: "Learning Path With YT",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  console.log("RootLayout");
  return (
    <html
      lang="en"
      className={cn(geist.className, "min-h-screen pt-18 antialiased")}
    >
      <body>
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
