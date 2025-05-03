'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [isFading, setIsFading] = useState(false);
  
  useEffect(() => {
    // Start the fade-out effect after 1.5 seconds
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 100);
    
    // Redirect after the fade animation (total 2 seconds)
    const redirectTimer = setTimeout(() => {
      router.push('/dashboard');
    }, 100);
    
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);
  
  return (
    <div className={`${styles.loaderContainer} ${isFading ? styles.fadeOut : ''}`}>
      <div className={styles.loaderContent}>
        <div className={styles.musicIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18V5L21 3V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
            <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <div className={styles.spinner}></div>
        <h1 className={styles.title}>Songs Dashboard</h1>
        <p className={styles.message}>Loading your music...</p>
      </div>
    </div>
  );
}
