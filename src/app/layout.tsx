import type { Metadata } from "next";
import "./globals.css";
import styles from './layout.module.css';

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
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
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
