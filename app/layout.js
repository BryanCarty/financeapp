import "@/app/_styles/globals.css";

export const metadata = {
  title: "The Traders Journal",
  description:
    "Discover The Traders Journal, a platform where traders share predictions, log trades, and gain insights into market trends. Join a community driven by shared knowledge and accountability.",
  icons: {
    icon: "/images/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
