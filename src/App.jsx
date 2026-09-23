import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const App = () => {

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 10, // Data 10 minute tak "Fresh" rahega (No Internet re-fetch)
        gcTime: 1000 * 60 * 30,    // Cache 30 minute tak memory me safe rahega (Garbage Collection)
        refetchOnWindowFocus: false, // Window active hone par auto fetch band
        refetchOnMount: false,       // Component dubara load hone par pehle se maujood cache use hoga
        refetchOnReconnect: false,   // Internet reconnect hone par faltu re-fetch band
      },
    },
  });
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}
