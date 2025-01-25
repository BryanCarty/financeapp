export const metadata = {
  title: "Insights Of A Trader | Sign Up",
  description:
    "'Insights of a Trader' sign up page. 'Insights of a Trader' is a dynamic platform designed for traders to collaborate and refine their market strategies. Users can share stock price predictions, log their trades, discuss individual stocks, and gain valuable insights into market trends. The platform also offers email notifications for trade prediction posts, allowing traders to stay updated. Additionally, users can search by ticker and date to discover what others foresee for the future performance of a stock, helping them make more informed decisions based on collective insights from the community.",
  icons: {
    icon: "/images/icon.png",
  },
  keywords: [
    "trading platform",
    "stock predictions",
    "market trends",
    "trade logging",
    "stock insights",
    "financial community",
    "trader collaboration",
    "stock forecasting",
    "ticker search",
    "market predictions",
    "trading insights",
    "stock market analysis",
    "future performance predictions",
    "trader notifications",
    "stock consensus",
    "investment strategies",
    "copy trading",
    "stock forum",
  ],
  metadataBase: new URL("https://insightsofatrader.com"),
  alternates: {
    canonical: "/signup",
    languages: {
      "en-US": "/en-US",
    },
  },
  openGraph: {
    images: "/icon.png",
  },
};

export default function Layout({ children }) {
  return <>{children};</>;
}
