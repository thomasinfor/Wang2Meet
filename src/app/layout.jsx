import { Roboto_Mono  } from "next/font/google";
import "./global.css";

const inter = Roboto_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "when2meet 2.0",
  description: "when2meet 2.0",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest"/>
      </head>
      <body className={inter.className} style={{ margin: 0 }}>{children}</body>
    </html>
  );
}