import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import styles from './layout.module.css';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Songs Dashboard",
  description: "A dashboard for managing songs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.className}>
      <body className={styles.body}>
        <nav className={styles.nav}>
          <div className={styles.navContainer}>
            <div className={styles.navContent}>
              <div className={styles.navTitle}>Songs Dashboard</div>
            </div>
          </div>
        </nav>
        <main className={styles.main}>
          {children}
        </main>
      </body>
    </html>
  );
}
