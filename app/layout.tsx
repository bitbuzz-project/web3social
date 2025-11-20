import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Web3 Social",
  description: "Decentralized Social Network",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getTheme() {
                  const saved = localStorage.getItem('theme');
                  if (saved) return saved;
                  
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  return prefersDark ? 'dark' : 'light';
                }
                
                const theme = getTheme();
                
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
                
                localStorage.setItem('theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-white dark:bg-black text-gray-900 dark:text-white`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}