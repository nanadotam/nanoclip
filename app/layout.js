// app/layout.tsx
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/home/Navbar.jsx";
import Footer from "./components/home/Footer.jsx";
import { ThemeProvider } from "next-themes"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const monaSans = localFont({
  src: "./fonts/Mona-Sans.woff2",
  variable: "--font-mona-sans",
  weight: "100 900",
});

export const metadata = {
  title: "NanoClip - Secure File & Text Sharing",
  description: "Share text and files securely with optional password protection and automatic expiration.",
  openGraph: {
    title: "NanoClip - Secure File & Text Sharing",
    description: "Share text and files securely with optional password protection and automatic expiration.",
    url: "https://nanoclip.vercel.app",
    siteName: "NanoClip",
    images: [
      {
        url: "./og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NanoClip - Secure File & Text Sharing",
    description: "Share text and files securely with optional password protection and automatic expiration.",
    images: ["./og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${monaSans.variable} antialiased min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          suppressHydrationWarning
        >
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(45%_25%_at_50%_50%,rgba(56,189,248,0.05),rgba(56,189,248,0))]" />
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer/>
        </ThemeProvider>
      </body>
    </html>
  );
}
