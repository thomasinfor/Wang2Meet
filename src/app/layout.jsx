import { Roboto_Mono  } from "next/font/google";
import Script from 'next/script';
import "./global.css";
import Theme from '@/components/Theme';
import Navbar from '@/components/Navbar';
import { AuthContextProvider } from "@/context/Auth";
import { StatusContextProvider } from "@/context/Status";

const inter = Roboto_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "Wang2Meet",
  description: "Wang2Meet",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/*<!-- Google tag (gtag.js) -->*/}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-0P4MSW3QPS"></Script>
        <Script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-0P4MSW3QPS');
        `}</Script>
        <link rel="manifest" href="/manifest.webmanifest"/>
      </head>
      <body className={inter.className} style={{ margin: 0 }}>
        <Theme>
          <AuthContextProvider>
            <StatusContextProvider>
              <Navbar/>
              {children}
            </StatusContextProvider>
          </AuthContextProvider>
        </Theme>
      </body>
    </html>
  );
}
