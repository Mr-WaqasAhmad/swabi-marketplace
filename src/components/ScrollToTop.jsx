import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // ✅ Page change hone par top par scroll karein
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // Turant, smooth nahi
    });
  }, [pathname]);

  return null;
};
