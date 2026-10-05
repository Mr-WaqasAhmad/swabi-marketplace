import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { ScrollToTop } from './components/ScrollToTop';

export const App = () => {
  const location = useLocation();

  const isChatPage = location.pathname.startsWith('/chat');
  const isMessagesPage = location.pathname.startsWith('/messages');

  return (
    <>
      <ScrollToTop />
      <Header />
      <Outlet />
      {!isChatPage && !isMessagesPage && <Footer />}
    </>
  )
}
