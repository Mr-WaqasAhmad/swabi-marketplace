import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { QueryClient } from '@tanstack/react-query';
import { ScrollToTop } from './components/ScrollToTop';

export const App = () => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat');

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
    },
  });
  return (
    <>
      <ScrollToTop />
      <Header />
      <Outlet />
      {/* ✅ Chat page pe Footer hide */}
      {!isChatPage && <Footer />}
    </>
  )
}
