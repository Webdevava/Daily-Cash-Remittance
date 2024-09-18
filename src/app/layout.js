import localFont from "next/font/local";
import "./globals.css";
import { Footer } from "@/components/Footer";

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

export const metadata = {
  title: "Cash Remittance Tracker",
  description: "A comprehensive tool for bank employees to efficiently record and manage daily cash remittances, ensuring accurate financial tracking and reporting.",
  keywords: "cash remittance, bank, financial tracking, daily records, banking operations",
  author: "Your Bank Name",
  openGraph: {
    title: "Cash Remittance Tracker for Bank Employees",
    description: "Streamline your daily cash remittance recording process with our user-friendly application designed specifically for bank employees.",
    type: "website",
    url: "https://your-cash-remittance-app.com",
    image: "https://your-cash-remittance-app.com/og-image.jpg",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cash Remittance Tracker",
    description: "Efficient cash remittance recording for bank employees",
    image: "https://your-cash-remittance-app.com/twitter-image.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}